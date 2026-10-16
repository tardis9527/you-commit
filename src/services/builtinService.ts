import * as vscode from 'vscode';
import type { StreamCallback } from '../types';
import { AiError } from '../types';
import { ConfigManager, SecretManager } from '../config';
import { log, logError } from '../utils';

const REQUEST_TIMEOUT_MS = 30_000;

export interface QuotaInfo {
  remaining: number;
  total: number;
}

export type QuotaUpdateListener = (remaining: number) => void;

let quotaUpdateListener: QuotaUpdateListener | undefined;

export function onQuotaUpdate(listener: QuotaUpdateListener): void {
  quotaUpdateListener = listener;
}

export class BuiltinService {
  private readonly machineId: string;

  constructor(
    private readonly configManager: ConfigManager,
    private readonly secretManager: SecretManager,
  ) {
    this.machineId = vscode.env.machineId;
  }

  private get serviceUrl(): string {
    return this.configManager.getBuiltinServiceUrl().replace(/\/+$/, '');
  }

  async activate(key: string): Promise<QuotaInfo> {
    const res = await fetch(`${this.serviceUrl}/api/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, machineId: this.machineId }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      throw new Error(body.message || body.error || `激活失败 (${res.status})`);
    }

    return res.json() as Promise<QuotaInfo>;
  }

  async queryQuota(): Promise<QuotaInfo> {
    const key = await this.secretManager.getServiceKey();
    if (!key) {
      throw new Error('未配置内置服务密钥');
    }

    const params = new URLSearchParams({ key, machineId: this.machineId });
    const res = await fetch(`${this.serviceUrl}/api/quota?${params}`);

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      throw new Error(body.message || body.error || `查询失败 (${res.status})`);
    }

    return res.json() as Promise<QuotaInfo>;
  }

  async generateStream(
    systemPrompt: string,
    userPrompt: string,
    callback: StreamCallback,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    const key = await this.secretManager.getServiceKey();
    if (!key) {
      callback.onError(new AiError('未配置内置服务密钥', 'NOT_CONFIGURED'));
      return;
    }

    const url = `${this.serviceUrl}/api/generate`;
    log(`Builtin service request: ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          machineId: this.machineId,
          systemPrompt,
          userPrompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
        throw this.mapError(response.status, body.message || body.error || '');
      }

      if (!response.body) {
        callback.onError(new AiError('响应体为空', 'EMPTY_RESPONSE'));
        return;
      }

      await this.parseSSEStream(response.body, callback);
    } catch (error) {
      if (error instanceof AiError) {
        callback.onError(error);
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        callback.onError(new AiError('请求超时或已取消', 'TIMEOUT'));
      } else {
        logError('Builtin service request failed', error);
        callback.onError(
          new AiError(
            `服务请求失败: ${error instanceof Error ? error.message : String(error)}`,
            'NETWORK_ERROR',
          ),
        );
      }
    }
  }

  private async parseSSEStream(
    body: ReadableStream<Uint8Array>,
    callback: StreamCallback,
  ): Promise<void> {
    let fullText = '';
    let callbackSent = false;
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const handleData = (data: string): boolean => {
      if (data === '[DONE]') {
        if (!callbackSent) {
          callbackSent = true;
          if (fullText.length === 0) {
            callback.onError(new AiError('AI 返回了空内容', 'EMPTY_RESPONSE'));
          } else {
            callback.onComplete(fullText);
          }
        }
        return true;
      }

      try {
        const parsed = JSON.parse(data) as {
          error?: string | { message?: string };
          token?: string;
          remaining?: number;
          done?: boolean;
          choices?: Array<{
            delta?: { content?: string | null };
            text?: string | null;
          }>;
        };

        // 后端会把上游错误作为 SSE 事件转发，必须在这里显式透传，不能误报为空内容。
        if (parsed.error) {
          callbackSent = true;
          const message =
            typeof parsed.error === 'string' ? parsed.error : parsed.error.message || 'AI 服务返回错误';
          callback.onError(new AiError(message, 'UNKNOWN'));
          return true;
        }

        const token = parsed.token || parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
        if (token) {
          fullText += token;
          callback.onToken(token);
        }
        if (parsed.remaining !== undefined && quotaUpdateListener) {
          quotaUpdateListener(parsed.remaining);
        }
        if (parsed.done && fullText.length > 0 && !callbackSent) {
          callbackSent = true;
          callback.onComplete(fullText);
          return true;
        }
      } catch {
        // SSE 可能把一条 JSON 拆到多个 chunk；未能解析的行交由后续 chunk 拼接。
      }
      return false;
    };

    const handleLine = (line: string): boolean => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) return false;
      return handleData(trimmed.slice(5).trimStart());
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (handleLine(line)) {
            return;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (buffer && !callbackSent) {
      handleLine(buffer);
    }

    if (!callbackSent) {
      callbackSent = true;
      if (fullText.length === 0) {
        callback.onError(new AiError('AI 返回了空内容', 'EMPTY_RESPONSE'));
      } else {
        callback.onComplete(fullText);
      }
    }
  }

  private mapError(status: number, message: string): AiError {
    switch (status) {
      case 401:
        return new AiError(message || '密钥无效', 'AUTH_ERROR', 401);
      case 403:
        return new AiError(message || '该密钥已绑定其他设备', 'KEY_BOUND', 403);
      case 429:
        return new AiError(message || '额度已用完，请购买新密钥', 'QUOTA_EXHAUSTED', 429);
      default:
        return new AiError(message || `服务请求失败 (${status})`, 'UNKNOWN', status);
    }
  }
}
