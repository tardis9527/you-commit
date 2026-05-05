import * as vscode from 'vscode';
import { ConfigManager, SecretManager, PLATFORM_PRESETS } from '../config';
import { log } from '../utils';

export async function configureProvider(
  configManager: ConfigManager,
  secretManager: SecretManager,
): Promise<boolean> {
  // Step 1: Select platform
  const BUILTIN_LABEL = '⚡ 内置服务（无需 API Key，购买密钥即用）';

  const platformItems = [
    {
      label: BUILTIN_LABEL,
      description: '开箱即用，按次付费',
      baseUrl: '__builtin__',
      models: [] as string[],
    },
    ...PLATFORM_PRESETS.map((p) => ({
      label: p.label,
      description: p.baseUrl,
      baseUrl: p.baseUrl,
      models: p.models,
    })),
    {
      label: '自定义（手动输入 BaseUrl）',
      description: '',
      baseUrl: '',
      models: [] as string[],
    },
  ];

  const selectedPlatform = await vscode.window.showQuickPick(platformItems, {
    placeHolder: 'YouCommit: 选择你的 AI 平台',
    ignoreFocusOut: true,
  });

  if (!selectedPlatform) {
    return false;
  }

  // Handle builtin service mode
  if (selectedPlatform.baseUrl === '__builtin__') {
    const config = vscode.workspace.getConfiguration('youcommit');
    await config.update('serviceMode', 'builtin', vscode.ConfigurationTarget.Global);

    // Try to show current quota
    let quotaMsg = 'YouCommit: 已切换到内置服务模式。';
    try {
      const { BuiltinService } = await import('../services/builtinService');
      const builtinService = new BuiltinService(configManager, secretManager);
      const quota = await builtinService.queryQuota();
      quotaMsg = `YouCommit: 内置服务模式 | 剩余 ${quota.remaining} / ${quota.total} 次`;
    } catch {
      quotaMsg += '请输入密钥或购买额度。';
    }

    const action = await vscode.window.showInformationMessage(
      quotaMsg,
      '输入密钥',
      '购买额度',
      '刷新额度',
    );

    if (action === '输入密钥') {
      await vscode.commands.executeCommand('youcommit.inputServiceKey');
    } else if (action === '购买额度') {
      await vscode.commands.executeCommand('youcommit.buyQuota');
    } else if (action === '刷新额度') {
      await vscode.commands.executeCommand('youcommit.queryQuota');
    }

    return true;
  }

  // Step 2: Get BaseUrl
  let baseUrl = selectedPlatform.baseUrl;
  if (!baseUrl) {
    const inputUrl = await vscode.window.showInputBox({
      prompt: 'YouCommit: 输入 AI API Base URL',
      placeHolder: 'https://api.example.com/v1',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return 'Base URL 不能为空';
        }
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return 'URL 必须以 http:// 或 https:// 开头';
        }
        return null;
      },
    });

    if (!inputUrl) {
      return false;
    }
    baseUrl = inputUrl;
  }

  // Step 3: Get API Key
  const apiKey = await vscode.window.showInputBox({
    prompt: 'YouCommit: 输入你的 API Key',
    placeHolder: 'sk-xxxxxxxxxxxxxxxx',
    password: true,
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value) {
        return 'API Key 不能为空';
      }
      return null;
    },
  });

  if (!apiKey) {
    return false;
  }

  // Step 4: Get Model
  let model: string | undefined;
  if (selectedPlatform.models.length > 0) {
    const modelItems = [
      ...selectedPlatform.models.map((m) => ({ label: m })),
      { label: '手动输入其他模型' },
    ];

    const selectedModel = await vscode.window.showQuickPick(modelItems, {
      placeHolder: 'YouCommit: 选择模型',
      ignoreFocusOut: true,
    });

    if (!selectedModel) {
      return false;
    }

    if (selectedModel.label === '手动输入其他模型') {
      model = await vscode.window.showInputBox({
        prompt: 'YouCommit: 输入模型名称',
        placeHolder: 'model-name',
        ignoreFocusOut: true,
      });
    } else {
      model = selectedModel.label;
    }
  } else {
    model = await vscode.window.showInputBox({
      prompt: 'YouCommit: 输入模型名称',
      placeHolder: 'model-name',
      ignoreFocusOut: true,
    });
  }

  if (!model) {
    return false;
  }

  // Save configuration (switch to BYOK mode)
  const config = vscode.workspace.getConfiguration('youcommit');
  await config.update('serviceMode', 'byok', vscode.ConfigurationTarget.Global);
  await configManager.updateProvider(baseUrl, model);
  await secretManager.setApiKey(apiKey);

  log(`Provider configured: ${selectedPlatform.label} / ${model}`);

  // Step 5: Test connection
  const testing = vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'YouCommit: 正在验证连接...',
      cancellable: false,
    },
    async () => {
      const { AiService } = await import('../services/aiService');
      const aiService = new AiService(configManager, secretManager);
      return aiService.testConnection();
    },
  );

  const result = await testing;

  if (result.success) {
    vscode.window.showInformationMessage('✅ YouCommit: 连接成功！配置已保存，可以开始使用。');
    return true;
  } else {
    const retry = await vscode.window.showWarningMessage(
      `❌ YouCommit: 连接失败 - ${result.error}`,
      '重新配置',
      '仍然保存',
    );

    if (retry === '重新配置') {
      return configureProvider(configManager, secretManager);
    }

    return true;
  }
}
