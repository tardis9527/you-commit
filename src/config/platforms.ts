export interface PlatformPreset {
  label: string;
  baseUrl: string;
  models: string[];
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    label: '阿里云百炼',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
  },
  {
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
  {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  {
    label: '小米 MiLM',
    baseUrl: 'https://api.milm.xiaomi.com/v1',
    models: ['milm-1'],
  },
];
