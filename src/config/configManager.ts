import * as vscode from 'vscode';
import type {
  YouCommitConfig,
  CommitFormat,
  ContentRule,
  Language,
  ServiceMode,
  ProviderConfig,
} from '../types';

const SECTION = 'youcommit';

export class ConfigManager {
  private get config(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(SECTION);
  }

  getAll(): YouCommitConfig {
    return {
      serviceMode: this.getServiceMode(),
      provider: this.getProvider(),
      commitFormat: this.getCommitFormat(),
      contentRule: this.getContentRule(),
      language: this.getLanguage(),
      customPromptPath: this.config.get<string>('customPromptPath', ''),
      autoCommit: this.config.get<boolean>('autoCommit', false),
      autoPush: this.config.get<boolean>('autoPush', false),
      streaming: this.config.get<boolean>('streaming', true),
      temperature: this.config.get<number>('temperature', 0.3),
      maxDiffLength: this.config.get<number>('maxDiffLength', 8000),
    };
  }

  getProvider(): ProviderConfig {
    return {
      baseUrl: this.config.get<string>('provider.baseUrl', ''),
      model: this.config.get<string>('provider.model', ''),
    };
  }

  getCommitFormat(): CommitFormat {
    return this.config.get<CommitFormat>('commitFormat', 'conventional');
  }

  getContentRule(): ContentRule {
    return this.config.get<ContentRule>('contentRule', 'standard');
  }

  getLanguage(): Language {
    return this.config.get<Language>('language', 'zh-CN');
  }

  getServiceMode(): ServiceMode {
    return this.config.get<ServiceMode>('serviceMode', 'byok');
  }

  isBuiltinMode(): boolean {
    return this.getServiceMode() === 'builtin';
  }

  getBuiltinServiceUrl(): string {
    return this.config.get<string>('builtinServiceUrl', '');
  }

  isProviderConfigured(): boolean {
    const provider = this.getProvider();
    return !!provider.baseUrl && !!provider.model;
  }

  async updateProvider(baseUrl: string, model: string): Promise<void> {
    await this.config.update('provider.baseUrl', baseUrl, vscode.ConfigurationTarget.Global);
    await this.config.update('provider.model', model, vscode.ConfigurationTarget.Global);
  }
}
