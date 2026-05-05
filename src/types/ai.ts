export interface AiRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiRequestOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: AiRequestMessage[];
  temperature: number;
  stream: boolean;
}

export interface StreamCallback {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: AiError) => void;
}

export class AiError extends Error {
  constructor(
    message: string,
    public readonly code: AiErrorCode,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AiError';
  }
}

export type AiErrorCode =
  | 'NOT_CONFIGURED'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'MODEL_NOT_FOUND'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'EMPTY_RESPONSE'
  | 'PARSE_ERROR'
  | 'QUOTA_EXHAUSTED'
  | 'KEY_BOUND'
  | 'UNKNOWN';
