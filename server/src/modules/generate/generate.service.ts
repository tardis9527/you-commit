import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { KeyService } from '../key/key.service';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class GenerateService {
  constructor(
    private readonly keyService: KeyService,
    private readonly channelService: ChannelService,
  ) { }

  async generate(
    key: string,
    machineId: string,
    systemPrompt: string,
    userPrompt: string,
    res: Response,
  ): Promise<void> {
    // machineId is kept for API compatibility; quota is now limited by key only.
    await this.keyService.ensureHasQuota(key);

    const channel = await this.channelService.getActiveChannel();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const url = `${channel.baseUrl.replace(/\/+$/, '')}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: channel.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: true,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        res.write(`data: ${JSON.stringify({ error: `AI service error (${response.status}): ${errorBody.slice(0, 200)}` })}\n\n`);
        res.end();
        return;
      }

      if (!response.body) {
        res.write(`data: ${JSON.stringify({ error: 'AI response body is empty' })}\n\n`);
        res.end();
        return;
      }

      await this.keyService.consumeOne(key);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trimStart();
          if (data === '[DONE]') {
            const quota = await this.keyService.getQuota(key, machineId);
            res.write(`data: ${JSON.stringify({ done: true, remaining: quota.remaining })}\n\n`);
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              // 某些 OpenAI 兼容网关会在 HTTP 200 的 SSE 中返回错误对象。
              // 必须透传给扩展，否则扩展会把它误判成空响应。
              const message =
                typeof parsed.error === 'string'
                  ? parsed.error
                  : parsed.error.message || 'AI service returned an error';
              res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
              res.end();
              return;
            }
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
              if (typeof (res as any).flush === 'function') (res as any).flush();
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      // 兼容最后一条 SSE 没有换行的代理实现。
      const trailingLine = buffer.trim();
      if (trailingLine.startsWith('data:')) {
        const data = trailingLine.slice(5).trimStart();
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              const message =
                typeof parsed.error === 'string'
                  ? parsed.error
                  : parsed.error.message || 'AI service returned an error';
              res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
              res.end();
              return;
            }
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
              if (typeof (res as any).flush === 'function') (res as any).flush();
            }
          } catch {
            // 忽略无法解析的尾部事件，后续由空响应检查处理。
          }
        }
      }

      const quota = await this.keyService.getQuota(key, machineId);
      res.write(`data: ${JSON.stringify({ done: true, remaining: quota.remaining })}\n\n`);
      res.end();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
    }
  }
}
