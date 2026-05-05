import * as vscode from 'vscode';
import { AiError } from '../types';
import { logError } from './logger';

export function handleAiError(error: unknown): void {
  if (error instanceof AiError) {
    logError(`AI Error [${error.code}]`, error);

    switch (error.code) {
      case 'NOT_CONFIGURED':
        vscode.window.showWarningMessage(
          'YouCommit: 请先完成 AI 模型配置。',
          '去配置',
        ).then((choice: string | undefined) => {
          if (choice === '去配置') {
            vscode.commands.executeCommand('youcommit.configureProvider');
          }
        });
        break;
      case 'AUTH_ERROR':
        vscode.window.showErrorMessage(
          'YouCommit: API Key 验证失败（401），请检查 Key 配置。',
        );
        break;
      case 'MODEL_NOT_FOUND':
        vscode.window.showErrorMessage(
          `YouCommit: 模型不存在，请检查模型名称配置。`,
        );
        break;
      case 'RATE_LIMIT':
        vscode.window.showErrorMessage(
          'YouCommit: API 调用受限（429），可能是余额不足或超出限额。',
        );
        break;
      case 'NETWORK_ERROR':
        vscode.window.showErrorMessage(
          'YouCommit: 网络连接失败，请检查网络或 API 地址配置。',
        );
        break;
      case 'TIMEOUT':
        vscode.window.showErrorMessage('YouCommit: AI 响应超时，请稍后重试。');
        break;
      case 'EMPTY_RESPONSE':
        vscode.window.showWarningMessage(
          'YouCommit: AI 返回了空内容，请重试或检查 prompt 配置。',
        );
        break;
      default:
        vscode.window.showErrorMessage(`YouCommit: ${error.message}`);
    }
  } else if (error instanceof Error) {
    logError('Unexpected error', error);
    vscode.window.showErrorMessage(`YouCommit: ${error.message}`);
  } else {
    logError('Unknown error', error);
    vscode.window.showErrorMessage('YouCommit: 发生未知错误，请查看输出面板。');
  }
}
