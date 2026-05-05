import * as vscode from 'vscode';
import { ConfigManager, SecretManager } from '../config';
import { AiService, BuiltinService, GitService, DiffProcessor, PromptBuilder } from '../services';
import type { StreamCallback } from '../types';
import { parseBranch, log, handleAiError } from '../utils';

interface StreamProvider {
  generateStream(
    systemPrompt: string,
    userPrompt: string,
    callback: StreamCallback,
    abortSignal?: AbortSignal,
  ): Promise<void>;
}

const THROTTLE_MS = 50;

let isGenerating = false;

export async function generateMessage(
  configManager: ConfigManager,
  secretManager: SecretManager,
): Promise<void> {
  if (isGenerating) {
    vscode.window.showWarningMessage('YouCommit: 正在生成中，请稍候...');
    return;
  }

  // Check configuration based on service mode
  const isBuiltin = configManager.isBuiltinMode();

  if (isBuiltin) {
    const hasServiceKey = await secretManager.hasServiceKey();
    if (!hasServiceKey) {
      const action = await vscode.window.showWarningMessage(
        'YouCommit: 请先输入内置服务密钥。',
        '输入密钥',
        '购买额度',
      );
      if (action === '输入密钥') {
        await vscode.commands.executeCommand('youcommit.inputServiceKey');
      } else if (action === '购买额度') {
        await vscode.commands.executeCommand('youcommit.buyQuota');
      }
      return;
    }
  } else {
    const hasKey = await secretManager.hasApiKey();
    if (!configManager.isProviderConfigured() || !hasKey) {
      const configure = await vscode.window.showWarningMessage(
        'YouCommit: 请先完成 AI 模型配置。',
        '去配置',
      );
      if (configure === '去配置') {
        await vscode.commands.executeCommand('youcommit.configureProvider');
      }
      return;
    }
  }

  const gitService = new GitService();
  const streamProvider: StreamProvider = isBuiltin
    ? new BuiltinService(configManager, secretManager)
    : new AiService(configManager, secretManager);
  const diffProcessor = new DiffProcessor();
  const promptBuilder = new PromptBuilder(configManager);

  // Check staged changes
  if (!gitService.hasStagedChanges()) {
    vscode.window.showWarningMessage('YouCommit: 没有已暂存的改动。请先使用 git add 暂存文件。');
    return;
  }

  isGenerating = true;

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'YouCommit',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: '正在分析暂存区改动...' });

        // Get diff and branch
        const rawDiff = await gitService.getStagedDiff();
        const branchName = gitService.getCurrentBranch();
        const branch = parseBranch(branchName);

        // Process diff
        const config = configManager.getAll();
        const diffResult = diffProcessor.process(rawDiff, config.maxDiffLength);

        if (!diffResult.diff) {
          vscode.window.showWarningMessage('YouCommit: 暂存区没有实质性改动。');
          return;
        }

        // Build prompts
        const systemPrompt = promptBuilder.buildSystemPrompt();
        const userPrompt = promptBuilder.buildUserPrompt({
          diff: diffResult.diff,
          branch,
          filesChanged: diffResult.filesChanged,
          filesStats: diffResult.filesStats,
        });

        log(`Branch: ${branchName} → type: ${branch.type ?? 'unknown'}`);
        log(`Diff: ${diffResult.strategy}, ${diffResult.diff.length} chars`);

        // Show generating hint in input box
        gitService.setCommitMessage('✨ 正在生成中...');
        progress.report({ message: '正在生成 Commit Message...' });

        if (config.streaming) {
          await generateStreaming(streamProvider, gitService, systemPrompt, userPrompt, config);
        } else {
          await generateNonStreaming(streamProvider, gitService, systemPrompt, userPrompt, config);
        }

        vscode.window.showInformationMessage('✅ YouCommit: Commit Message 已生成。');
      },
    );
  } catch (error) {
    handleAiError(error);
  } finally {
    isGenerating = false;
  }
}

async function generateStreaming(
  streamProvider: StreamProvider,
  gitService: GitService,
  systemPrompt: string,
  userPrompt: string,
  config: ReturnType<ConfigManager['getAll']>,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let buffer = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let fullText = '';
    let firstToken = true;

    const flushBuffer = () => {
      if (buffer) {
        gitService.appendCommitMessage(buffer);
        buffer = '';
      }
      timer = null;
    };

    streamProvider
      .generateStream(systemPrompt, userPrompt, {
        onToken: (token: string) => {
          if (firstToken) {
            gitService.clearCommitMessage();
            firstToken = false;
          }
          fullText += token;
          buffer += token;
          if (!timer) {
            timer = setTimeout(flushBuffer, THROTTLE_MS);
          }
        },
        onComplete: async (text: string) => {
          if (timer) {
            clearTimeout(timer);
          }
          flushBuffer();

          log(`Generated: ${text.split('\n')[0]}`);
          await handleAutoActions(gitService, text, config);
          resolve();
        },
        onError: (error) => {
          if (timer) {
            clearTimeout(timer);
          }
          reject(error);
        },
      })
      .catch(reject);
  });
}

async function generateNonStreaming(
  streamProvider: StreamProvider,
  gitService: GitService,
  systemPrompt: string,
  userPrompt: string,
  config: ReturnType<ConfigManager['getAll']>,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    streamProvider
      .generateStream(systemPrompt, userPrompt, {
        onToken: () => { },
        onComplete: async (text: string) => {
          gitService.setCommitMessage(text);
          log(`Generated: ${text.split('\n')[0]}`);
          await handleAutoActions(gitService, text, config);
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      })
      .catch(reject);
  });
}

async function handleAutoActions(
  gitService: GitService,
  message: string,
  config: ReturnType<ConfigManager['getAll']>,
): Promise<void> {
  if (!config.autoCommit) {
    return;
  }

  try {
    await gitService.commit(message);
    const firstLine = message.split('\n')[0];
    vscode.window.showInformationMessage(`✅ YouCommit: 已自动提交 - ${firstLine}`);

    if (config.autoPush) {
      try {
        await gitService.push();
        vscode.window.showInformationMessage('✅ YouCommit: 已自动推送。');
      } catch (error) {
        vscode.window.showWarningMessage(
          `⚠️ YouCommit: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ YouCommit: 自动提交失败 - ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
