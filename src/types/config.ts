export type CommitFormat = 'conventional' | 'gitmoji' | 'simple' | 'detailed' | 'custom';

export type ContentRule = 'standard' | 'brief' | 'verbose' | 'custom';

export type Language = 'zh-CN' | 'en-US';

export type ServiceMode = 'byok' | 'builtin';

export interface ProviderConfig {
  baseUrl: string;
  model: string;
}

export interface YouCommitConfig {
  serviceMode: ServiceMode;
  provider: ProviderConfig;
  commitFormat: CommitFormat;
  contentRule: ContentRule;
  language: Language;
  customPromptPath: string;
  autoCommit: boolean;
  autoPush: boolean;
  streaming: boolean;
  temperature: number;
  maxDiffLength: number;
}
