import * as vscode from 'vscode';
import { log, logError } from '../utils';

interface GitExtensionApi {
  getAPI(version: number): GitApi;
}

interface GitApi {
  repositories: GitRepository[];
}

interface GitRepository {
  inputBox: { value: string };
  state: {
    HEAD: { name?: string } | undefined;
    indexChanges: { uri: vscode.Uri }[];
  };
  diff(cached?: boolean): Thenable<string>;
  commit(message: string): Thenable<void>;
  push(): Thenable<void>;
}

export class GitService {
  private getGitApi(): GitApi {
    const gitExtension = vscode.extensions.getExtension<GitExtensionApi>('vscode.git');
    if (!gitExtension) {
      throw new Error('Git 扩展未找到，请确保已安装 Git 扩展。');
    }
    if (!gitExtension.isActive) {
      throw new Error('Git 扩展尚未激活。');
    }
    return gitExtension.exports.getAPI(1);
  }

  private getRepository(): GitRepository {
    const api = this.getGitApi();
    if (!api.repositories.length) {
      throw new Error('当前工作区没有 Git 仓库。');
    }
    return api.repositories[0];
  }

  async getStagedDiff(): Promise<string> {
    const repo = this.getRepository();
    const diff = await repo.diff(true);
    return diff;
  }

  hasStagedChanges(): boolean {
    try {
      const repo = this.getRepository();
      return repo.state.indexChanges.length > 0;
    } catch {
      return false;
    }
  }

  getCurrentBranch(): string {
    try {
      const repo = this.getRepository();
      return repo.state.HEAD?.name ?? '';
    } catch {
      return '';
    }
  }

  setCommitMessage(message: string): void {
    const repo = this.getRepository();
    repo.inputBox.value = message;
  }

  appendCommitMessage(token: string): void {
    const repo = this.getRepository();
    repo.inputBox.value += token;
  }

  clearCommitMessage(): void {
    const repo = this.getRepository();
    repo.inputBox.value = '';
  }

  async commit(message: string): Promise<void> {
    const repo = this.getRepository();
    log(`Auto commit: ${message.split('\n')[0]}`);
    await repo.commit(message);
  }

  async push(): Promise<void> {
    const repo = this.getRepository();
    log('Auto push...');
    try {
      await repo.push();
      log('Push completed.');
    } catch (error) {
      logError('Push failed', error);
      throw new Error(
        `提交成功，但推送失败：${error instanceof Error ? error.message : String(error)}。请手动 push。`,
      );
    }
  }
}
