import type { AiRequestMessage, StreamCallback } from '../types';
import { AiError } from '../types';
import { ConfigManager, SecretManager } from '../config';
import { log, logError } from '../utils';

const REQUEST_TIMEOUT_MS = 30_000;

export class AiService {
  constructor(
    private readonly configManager: ConfigManager,
    private readonly secretManager: SecretManager,
  ) {}

  async generateStream(
    systemPrompt: string,
    userPrompt: string,
    callback: StreamCallback,
    abortSignal?: AbortSignal,
  ): Promise<void> {
    const { provider, temperature } = this.configManager.getAll();
    const apiKey = await this.secretManager.getApiKey();

    if (!provider.baseUrl || !provider.model || !apiKey) {
      callback.onError(new AiError('AI 模型未配置', 'NOT_CONFIGURED'));
      return;
    }

    const messages: AiRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    log(`Requesting: ${provider.model} at ${provider.baseUrl}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          stream: true,
          temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw this.mapHttpError(response.status, errorBody);
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
        logError('AI request failed', error);
        callback.onError(
          new AiError(
            `网络请求失败: ${error instanceof Error ? error.message : String(error)}`,
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
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue;
          }

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            if (fullText.length === 0) {
              callback.onError(new AiError('AI 返回了空内容', 'EMPTY_RESPONSE'));
            } else {
              callback.onComplete(fullText);
            }
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              fullText += token;
              callback.onToken(token);
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (fullText.length === 0) {
      callback.onError(new AiError('AI 返回了空内容', 'EMPTY_RESPONSE'));
    } else {
      callback.onComplete(fullText);
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const { provider } = this.configManager.getAll();
    const apiKey = await this.secretManager.getApiKey();

    if (!provider.baseUrl || !provider.model || !apiKey) {
      return { success: false, error: '配置不完整' };
    }

    const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const err = this.mapHttpError(response.status, body);
        return { success: false, error: err.message };
      }

      return { success: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: `连接失败: ${msg}` };
    }
  }

  private mapHttpError(status: number, body: string): AiError {
    switch (status) {
      case 401:
        return new AiError('API Key 无效或已过期', 'AUTH_ERROR', 401);
      case 403:
        return new AiError('无权访问该模型', 'AUTH_ERROR', 403);
      case 404:
        return new AiError('模型不存在或 API 地址错误', 'MODEL_NOT_FOUND', 404);
      case 429:
        return new AiError('请求过于频繁或余额不足', 'RATE_LIMIT', 429);
      default:
        return new AiError(`API 请求失败 (${status}): ${body.slice(0, 200)}`, 'UNKNOWN', status);
    }
  }
}
