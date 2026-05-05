import * as vscode from 'vscode';
import { ConfigManager, SecretManager } from './config';
import { BuiltinService, onQuotaUpdate } from './services';
import { generateMessage, openSettings, configureProvider } from './commands';
import { getOutputChannel, log } from './utils';

const SHOP_URL = 'https://pay.ldxp.cn/shop/FRW82VJ7';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  log('YouCommit activating...');

  const configManager = new ConfigManager();
  const secretManager = new SecretManager(context.secrets);

  // Status bar (right side, near SCM)
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'youcommit.queryQuota';
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('youcommit.generateMessage', () =>
      generateMessage(configManager, secretManager),
    ),

    vscode.commands.registerCommand('youcommit.openSettings', () => openSettings()),

    vscode.commands.registerCommand('youcommit.configureProvider', () =>
      configureProvider(configManager, secretManager),
    ),

    vscode.commands.registerCommand('youcommit.setApiKey', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'YouCommit: 输入新的 API Key',
        password: true,
        ignoreFocusOut: true,
      });
      if (key) {
        await secretManager.setApiKey(key);
        vscode.window.showInformationMessage('YouCommit: API Key 已更新。');
      }
    }),

    vscode.commands.registerCommand('youcommit.buyQuota', () => {
      vscode.env.openExternal(vscode.Uri.parse(SHOP_URL));
    }),

    vscode.commands.registerCommand('youcommit.inputServiceKey', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'YouCommit: 输入购买的服务密钥（YC-开头）',
        placeHolder: 'YC-xxxxxxxxxxxx',
        ignoreFocusOut: true,
      });
      if (!key) return;

      if (!key.startsWith('YC-')) {
        vscode.window.showWarningMessage('YouCommit: 密钥格式不正确，应以 YC- 开头。');
        return;
      }

      try {
        const builtinService = new BuiltinService(configManager, secretManager);
        const quota = await builtinService.activate(key);
        await secretManager.setServiceKey(key);
        vscode.window.showInformationMessage(
          `✅ YouCommit: 密钥激活成功！剩余 ${quota.remaining} 次。`,
        );
        updateStatusBar(configManager, quota.remaining);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const hint = msg.includes('fetch') ? '（请检查内置服务地址是否正确）' : '';
        vscode.window.showErrorMessage(`❌ YouCommit: ${msg}${hint}`);
      }
    }),

    vscode.commands.registerCommand('youcommit.queryQuota', async () => {
      if (!configManager.isBuiltinMode()) {
        vscode.window.showInformationMessage('YouCommit: 当前为 BYOK 模式，无需查询额度。');
        return;
      }

      try {
        const builtinService = new BuiltinService(configManager, secretManager);
        const quota = await builtinService.queryQuota();
        updateStatusBar(configManager, quota.remaining);
        vscode.window.showInformationMessage(
          `YouCommit: 剩余 ${quota.remaining} / ${quota.total} 次`,
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `YouCommit: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),

    getOutputChannel(),
  );

  // Listen for config changes to update status bar visibility
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('youcommit.serviceMode')) {
        refreshStatusBar(configManager, secretManager);
      }
    }),
  );

  // Listen for quota updates from builtin service (after each generation)
  onQuotaUpdate((remaining) => {
    updateStatusBar(configManager, remaining);
  });

  // Check first run & init status bar
  checkFirstRun(configManager, secretManager);
  refreshStatusBar(configManager, secretManager);

  log('YouCommit activated.');
}

function updateStatusBar(configManager: ConfigManager, remaining: number): void {
  if (!configManager.isBuiltinMode()) {
    statusBarItem.hide();
    return;
  }
  statusBarItem.text = `$(sparkle) YC: 剩余 ${remaining} 次`;
  statusBarItem.tooltip = '点击查询最新额度';
  statusBarItem.show();
}

async function refreshStatusBar(
  configManager: ConfigManager,
  secretManager: SecretManager,
): Promise<void> {
  if (!configManager.isBuiltinMode()) {
    statusBarItem.hide();
    return;
  }

  const hasKey = await secretManager.hasServiceKey();
  if (!hasKey) {
    statusBarItem.text = '$(sparkle) YC: 未配置密钥';
    statusBarItem.show();
    return;
  }

  try {
    const builtinService = new BuiltinService(configManager, secretManager);
    const quota = await builtinService.queryQuota();
    updateStatusBar(configManager, quota.remaining);
  } catch {
    statusBarItem.text = '$(sparkle) YC: 内置服务';
    statusBarItem.show();
  }
}

async function checkFirstRun(
  configManager: ConfigManager,
  secretManager: SecretManager,
): Promise<void> {
  if (configManager.isBuiltinMode()) {
    const hasKey = await secretManager.hasServiceKey();
    if (!hasKey) {
      await vscode.commands.executeCommand(
        'workbench.action.openWalkthrough',
        'tardis9527.you-commit#youcommit.setup',
        true,
      );
    }
    return;
  }

  const hasKey = await secretManager.hasApiKey();
  if (!configManager.isProviderConfigured() || !hasKey) {
    await vscode.commands.executeCommand(
      'workbench.action.openWalkthrough',
      'tardis9527.you-commit#youcommit.setup',
      true,
    );
  }
}

export function deactivate(): void {
  log('YouCommit deactivated.');
}
