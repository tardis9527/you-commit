# 技术选型与架构方案：YouCommit（柚提）

> **版本**：v1.0  
> **日期**：2026-05-03  
> **关联文档**：[PRD_GitCommitAI_20260503.md](./PRD_GitCommitAI_20260503.md)

---

## 1. 技术选型

### 1.1 核心技术栈

| 项目 | 选型 | 版本要求 | 选型理由 |
|------|------|---------|---------|
| **开发语言** | TypeScript | >= 5.0 | VSCode 插件开发唯一推荐语言，类型安全 |
| **插件框架** | VSCode Extension API | >= 1.85.0 | 官方 API，SCM 相关能力完善 |
| **构建工具** | esbuild | >= 0.20 | VSCode 官方推荐，打包速度极快，支持 tree-shaking |
| **包管理器** | yarn | >= 1.22 | 用户熟悉，生态成熟 |
| **HTTP 客户端** | 原生 fetch（Node 18+） | - | 零依赖，支持 SSE 流式，Node 18 已内置 |
| **测试框架** | Vitest | >= 1.0 | 快速、兼容 TypeScript、API 与 Jest 兼容 |
| **代码规范** | ESLint + Prettier | - | 行业标准 |
| **脚手架** | yo code (Yeoman) | - | VSCode 官方脚手架生成器 |

### 1.2 选型说明

#### 为什么不用 axios？

- Node 18+ 原生 `fetch` 已完全满足需求
- 支持 `ReadableStream`，天然适配 SSE 流式解析
- 减少一个运行时依赖，插件体积更小

#### 为什么用 esbuild 而不是 webpack？

- VSCode 官方 2024 年起推荐 esbuild 替代 webpack
- 打包速度比 webpack 快 10-100 倍
- 配置极简，`yo code` 新版脚手架已默认使用 esbuild

#### 为什么不用 webview 做配置界面？

- 一期用 VSCode 原生 QuickPick / InputBox 实现引导流程
- 配置修改走 VSCode Settings 原生界面
- 避免 webview 的额外开发成本和性能开销
- 二期可根据需要引入 webview 做高级配置面板

### 1.3 依赖清单

```jsonc
{
  // 运行时依赖：零外部依赖（全部使用 VSCode API + Node 原生能力）
  "dependencies": {},

  // 开发依赖
  "devDependencies": {
    "@types/vscode": "^1.85.0",    // VSCode API 类型定义
    "@types/node": "^18.0.0",      // Node 类型定义
    "typescript": "^5.4.0",        // TypeScript 编译器
    "esbuild": "^0.20.0",         // 打包工具
    "@vscode/vsce": "^3.0.0",     // 插件打包发布工具
    "vitest": "^1.6.0",           // 测试框架
    "eslint": "^9.0.0",           // 代码规范
    "prettier": "^3.2.0"          // 代码格式化
  }
}
```

> **零运行时依赖** 是一个关键设计决策——减小插件体积，加快激活速度，避免依赖冲突。

---

## 2. 自定义图标规范

### 2.1 结论：完全支持自定义图标

VSCode 允许插件通过 `contributes.commands` 的 `icon` 字段注册自定义图标，在 SCM 标题栏和输入框旁都会显示。

### 2.2 图标文件要求

| 要求 | 规范 |
|------|------|
| **格式** | **SVG**（官方推荐），也接受 PNG 等格式 |
| **尺寸** | 16x16 像素，实际图形区域 14x14（四周 1px padding） |
| **颜色** | **单色**，不要使用多色（VSCode 会用 CSS 控制颜色适配主题） |
| **主题适配** | 需要提供 **两套 SVG 文件**：`light`（浅色主题用，深色图标）和 `dark`（深色主题用，浅色图标） |
| **命名建议** | `youcommit-icon-light.svg` + `youcommit-icon-dark.svg` |

### 2.3 你需要提供的文件

```
resources/
├── icons/
│   ├── youcommit-generate-light.svg   # 生成按钮图标（浅色主题 → 深色图标）
│   ├── youcommit-generate-dark.svg    # 生成按钮图标（深色主题 → 浅色图标）
│   ├── youcommit-settings-light.svg   # 设置按钮图标（浅色主题 → 深色图标）
│   └── youcommit-settings-dark.svg    # 设置按钮图标（深色主题 → 浅色图标）
│
├── logo/
│   └── youcommit-logo.png             # 插件市场展示 logo（128x128 或 256x256，PNG）
```

### 2.4 图标在 package.json 中的注册方式

```jsonc
{
  "contributes": {
    "commands": [
      {
        "command": "youcommit.generateMessage",
        "title": "YouCommit: 生成 Commit Message",
        "icon": {
          "light": "resources/icons/youcommit-generate-light.svg",
          "dark": "resources/icons/youcommit-generate-dark.svg"
        }
      },
      {
        "command": "youcommit.openSettings",
        "title": "YouCommit: 打开设置",
        "icon": {
          "light": "resources/icons/youcommit-settings-light.svg",
          "dark": "resources/icons/youcommit-settings-dark.svg"
        }
      }
    ],
    "menus": {
      "scm/title": [
        {
          "command": "youcommit.generateMessage",
          "group": "navigation",
          "when": "scmProvider == git"
        },
        {
          "command": "youcommit.openSettings",
          "group": "navigation",
          "when": "scmProvider == git"
        }
      ],
      "scm/inputBox": [
        {
          "command": "youcommit.generateMessage",
          "when": "scmProvider == git"
        }
      ]
    }
  }
}
```

### 2.5 SVG 模板示例

以下是一个符合规范的 SVG 模板（深色主题用的浅色图标）：

```xml
<!-- youcommit-generate-dark.svg -->
<svg width="16" height="16" viewBox="0 0 16 16"
     xmlns="http://www.w3.org/2000/svg"
     fill="#C5C5C5">
  <!-- 14x14 图形区域，1px padding -->
  <!-- 在此绘制你的柚子/提交图标 -->
  <path d="..."/>
</svg>
```

```xml
<!-- youcommit-generate-light.svg -->
<svg width="16" height="16" viewBox="0 0 16 16"
     xmlns="http://www.w3.org/2000/svg"
     fill="#424242">
  <!-- 同样的路径，只是颜色不同 -->
  <path d="..."/>
</svg>
```

| 主题 | SVG fill 颜色建议 |
|------|------------------|
| **dark**（深色主题） | `#C5C5C5`（浅灰白） |
| **light**（浅色主题） | `#424242`（深灰黑） |

> **提示**：你可以用 Figma / Illustrator / Inkscape 设计图标，导出为 SVG 后，确保只有一个 fill 颜色，删除多余属性即可。

---

## 3. 技术架构

### 3.1 整体架构图

```
┌──────────────────────────────────────────────────────────────┐
│                    VSCode Extension Host                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    extension.ts (入口)                    │ │
│  │                  注册命令 / 事件监听                        │ │
│  └──────────────┬──────────────────┬───────────────────────┘ │
│                 │                  │                          │
│     ┌───────────▼──────┐ ┌────────▼────────┐                │
│     │   Commands 层    │ │   Config 层      │                │
│     │                  │ │                  │                │
│     │ generateMessage  │ │ configManager    │                │
│     │ openSettings     │ │ secretManager    │                │
│     │ configureProvider│ │ platforms        │                │
│     └───────┬──────────┘ └────────┬────────┘                │
│             │                     │                          │
│     ┌───────▼─────────────────────▼────────┐                │
│     │            Services 层                │                │
│     │                                      │                │
│     │  ┌──────────┐  ┌──────────────────┐  │                │
│     │  │gitService│  │ promptBuilder    │  │                │
│     │  │          │  │                  │  │                │
│     │  │• diff    │  │• 组装 system     │  │                │
│     │  │• branch  │  │• 组装 user       │  │                │
│     │  │• commit  │  │• 模板变量替换     │  │                │
│     │  │• push    │  │• 格式规范注入     │  │                │
│     │  └──────────┘  └──────────────────┘  │                │
│     │                                      │                │
│     │  ┌──────────────┐  ┌──────────────┐  │                │
│     │  │diffProcessor │  │  aiService   │  │                │
│     │  │              │  │              │  │                │
│     │  │• 智能截断    │  │• SSE 流式    │  │                │
│     │  │• 文件过滤    │  │• 错误处理    │  │                │
│     │  │• 统计生成    │  │• 超时控制    │  │                │
│     │  └──────────────┘  └──────┬───────┘  │                │
│     └───────────────────────────┼──────────┘                │
│                                 │                            │
└─────────────────────────────────┼────────────────────────────┘
                                  │ HTTPS (SSE)
                                  ▼
                    ┌──────────────────────────┐
                    │   AI API (OpenAI 兼容)    │
                    │   阿里 / 小米 / DeepSeek  │
                    │   或任意兼容平台           │
                    └──────────────────────────┘
```

### 3.2 目录结构

```
youcommit/
├── .vscode/
│   ├── launch.json                # 调试配置
│   ├── tasks.json                 # 构建任务
│   └── settings.json              # 工作区设置
│
├── resources/
│   ├── icons/
│   │   ├── youcommit-generate-light.svg
│   │   ├── youcommit-generate-dark.svg
│   │   ├── youcommit-settings-light.svg
│   │   └── youcommit-settings-dark.svg
│   └── logo/
│       └── youcommit-logo.png     # 128x128 插件市场 logo
│
├── src/
│   ├── extension.ts               # 插件入口：activate / deactivate
│   │
│   ├── commands/
│   │   ├── generateMessage.ts     # 生成 commit message 主命令
│   │   ├── openSettings.ts        # 打开设置
│   │   └── configureProvider.ts   # AI 模型配置引导
│   │
│   ├── services/
│   │   ├── aiService.ts           # AI API 调用（流式 SSE）
│   │   ├── gitService.ts          # Git 操作封装
│   │   ├── diffProcessor.ts       # Diff 获取与智能截断
│   │   └── promptBuilder.ts       # Prompt 组装引擎
│   │
│   ├── config/
│   │   ├── configManager.ts       # VSCode Settings 读写
│   │   ├── secretManager.ts       # API Key 安全存储
│   │   └── platforms.ts           # 平台预设映射表
│   │
│   ├── templates/
│   │   ├── system-base.md         # 系统基础提示词
│   │   ├── format-conventional.md # Conventional Commits 格式
│   │   ├── format-gitmoji.md      # Gitmoji 格式
│   │   ├── format-simple.md       # 简洁格式
│   │   ├── format-detailed.md     # 详细格式
│   │   ├── rule-standard.md       # 标准生成规则
│   │   ├── rule-brief.md          # 精简生成规则
│   │   └── rule-verbose.md        # 详尽生成规则
│   │
│   ├── utils/
│   │   ├── branchParser.ts        # 分支名解析
│   │   ├── logger.ts              # 输出通道日志
│   │   └── errors.ts              # 错误类型定义
│   │
│   └── types/
│       ├── config.ts              # 配置类型定义
│       ├── ai.ts                  # AI 相关类型
│       └── git.ts                 # Git 相关类型
│
├── test/
│   ├── suite/
│   │   ├── aiService.test.ts
│   │   ├── diffProcessor.test.ts
│   │   ├── promptBuilder.test.ts
│   │   └── branchParser.test.ts
│   └── runTest.ts
│
├── doc/                           # 产品文档（已有）
│
├── .eslintrc.json
├── .prettierrc
├── .vscodeignore                  # 打包排除列表
├── tsconfig.json
├── esbuild.mjs                    # esbuild 构建脚本
├── package.json                   # 插件清单
├── pnpm-lock.yaml
├── CHANGELOG.md
├── LICENSE
└── README.md
```

### 3.3 核心模块设计

#### 3.3.1 extension.ts — 插件入口

```typescript
// 伪代码，展示核心结构
export function activate(context: vscode.ExtensionContext) {
  // 初始化服务
  const secretManager = new SecretManager(context.secrets);
  const configManager = new ConfigManager();
  const gitService = new GitService();
  const aiService = new AiService(configManager, secretManager);
  const promptBuilder = new PromptBuilder(configManager);
  const diffProcessor = new DiffProcessor(configManager);

  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand('youcommit.generateMessage',
      () => generateMessage(gitService, aiService, promptBuilder, diffProcessor, configManager)
    ),
    vscode.commands.registerCommand('youcommit.openSettings',
      () => openSettings()
    ),
    vscode.commands.registerCommand('youcommit.configureProvider',
      () => configureProvider(configManager, secretManager)
    ),
    vscode.commands.registerCommand('youcommit.setApiKey',
      () => setApiKey(secretManager)
    )
  );

  // 首次安装检测
  checkFirstRun(configManager, secretManager);
}
```

**激活策略**：使用 `onCommand` 按需激活，不在 VSCode 启动时加载：

```jsonc
{
  "activationEvents": [
    "onCommand:youcommit.generateMessage",
    "onCommand:youcommit.configureProvider"
  ]
}
```

#### 3.3.2 aiService.ts — AI 调用核心

```typescript
// 关键接口设计
interface AiServiceOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  stream: boolean;
}

interface StreamCallback {
  onToken: (token: string) => void;    // 每次收到 token
  onComplete: (fullText: string) => void;  // 生成完成
  onError: (error: AiError) => void;       // 错误回调
}

class AiService {
  /**
   * 流式调用 AI API
   * 使用原生 fetch + ReadableStream 解析 SSE
   */
  async generateStream(
    systemPrompt: string,
    userPrompt: string,
    callback: StreamCallback,
    abortSignal?: AbortSignal
  ): Promise<void>;

  /**
   * 连通性测试（用于首次引导验证）
   */
  async testConnection(): Promise<{ success: boolean; error?: string }>;
}
```

**SSE 流式解析核心逻辑**：

```typescript
// 使用原生 fetch 的 ReadableStream 处理 SSE
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model, messages, stream: true, temperature
  }),
  signal: abortSignal,  // 支持用户取消
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') { callback.onComplete(fullText); return; }
      const parsed = JSON.parse(data);
      const token = parsed.choices[0]?.delta?.content || '';
      if (token) {
        fullText += token;
        callback.onToken(token);
      }
    }
  }
}
```

#### 3.3.3 gitService.ts — Git 操作封装

```typescript
class GitService {
  /**
   * 获取 Git 扩展 API（VSCode 内置 Git 扩展）
   */
  private getGitApi(): GitExtension;

  /**
   * 获取已暂存文件的 diff
   */
  async getStagedDiff(): Promise<string>;

  /**
   * 获取当前分支名
   */
  async getCurrentBranch(): Promise<string>;

  /**
   * 获取变更文件统计
   */
  async getChangedFilesStats(): Promise<FileStats[]>;

  /**
   * 写入 SCM 输入框
   */
  setCommitMessage(message: string): void;

  /**
   * 执行 git commit
   */
  async commit(message: string): Promise<void>;

  /**
   * 执行 git push
   */
  async push(): Promise<void>;
}
```

**获取 VSCode 内置 Git API 的方式**：

```typescript
import * as vscode from 'vscode';

function getGitExtension() {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    throw new Error('Git extension not found');
  }
  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }
  return gitExtension.exports.getAPI(1);  // Git API v1
}
```

#### 3.3.4 diffProcessor.ts — Diff 智能截断

```typescript
interface DiffProcessResult {
  diff: string;          // 处理后的 diff 内容
  filesStats: string;    // 文件变更统计
  truncated: boolean;    // 是否被截断
  strategy: 'full' | 'file-truncated' | 'stats-only';  // 使用的策略
}

class DiffProcessor {
  // 忽略的文件模式
  private ignorePatterns = [
    'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
    '*.min.js', '*.min.css', '*.map',
    '*.generated.*'
  ];

  /**
   * 处理 diff，根据长度决定截断策略
   * 
   * 策略优先级：
   * 1. full — 完整发送（未超限）
   * 2. file-truncated — 过滤忽略文件 + 每文件截断至 100 行
   * 3. stats-only — 仅发送文件级统计
   */
  process(rawDiff: string, maxLength: number): DiffProcessResult;
}
```

#### 3.3.5 promptBuilder.ts — Prompt 组装引擎

```typescript
interface PromptContext {
  diff: string;
  branch: string;
  branchType: string | null;
  branchName: string | null;
  filesChanged: string;
  filesStats: string;
  language: string;
}

class PromptBuilder {
  /**
   * 组装完整的 system prompt
   * = 基础提示 + 格式指令 + 规则指令 + 语言指令 + 输出约束
   */
  buildSystemPrompt(): string;

  /**
   * 组装 user prompt
   * = 分支上下文 + 文件统计 + diff 内容
   */
  buildUserPrompt(context: PromptContext): string;

  /**
   * 加载自定义模板并替换变量
   */
  loadCustomTemplate(templatePath: string, context: PromptContext): string;

  /**
   * 替换模板变量 {{diff}} {{branch}} 等
   */
  private replaceVariables(template: string, context: PromptContext): string;
}
```

#### 3.3.6 secretManager.ts — API Key 安全存储

```typescript
class SecretManager {
  private secrets: vscode.SecretStorage;

  constructor(secrets: vscode.SecretStorage) {
    this.secrets = secrets;
  }

  async getApiKey(): Promise<string | undefined> {
    return this.secrets.get('youcommit.apiKey');
  }

  async setApiKey(key: string): Promise<void> {
    await this.secrets.store('youcommit.apiKey', key);
  }

  async deleteApiKey(): Promise<void> {
    await this.secrets.delete('youcommit.apiKey');
  }

  /**
   * 脱敏显示：sk-****abcd
   */
  async getMaskedApiKey(): Promise<string | undefined> {
    const key = await this.getApiKey();
    if (!key || key.length < 8) return key;
    return key.slice(0, 3) + '****' + key.slice(-4);
  }
}
```

---

## 4. 核心流程时序图

### 4.1 生成 Commit Message 主流程

```
用户                    extension          gitService      diffProcessor    promptBuilder      aiService        SCM InputBox
 │                        │                   │                │                │                │                │
 │  点击生成按钮           │                   │                │                │                │                │
 ├───────────────────────>│                   │                │                │                │                │
 │                        │                   │                │                │                │                │
 │                        │ 检查配置是否完成    │                │                │                │                │
 │                        ├──(未配置)─────────>│ 触发引导        │                │                │                │
 │                        │                   │                │                │                │                │
 │                        │ getStagedDiff()   │                │                │                │                │
 │                        ├──────────────────>│                │                │                │                │
 │                        │    diff 内容       │                │                │                │                │
 │                        │<──────────────────┤                │                │                │                │
 │                        │                   │                │                │                │                │
 │                        │ getCurrentBranch() │                │                │                │                │
 │                        ├──────────────────>│                │                │                │                │
 │                        │    branch name     │                │                │                │                │
 │                        │<──────────────────┤                │                │                │                │
 │                        │                   │                │                │                │                │
 │                        │ process(diff)     │                │                │                │                │
 │                        ├──────────────────────────────────>│                │                │                │
 │                        │  processedDiff    │                │                │                │                │
 │                        │<──────────────────────────────────┤                │                │                │
 │                        │                   │                │                │                │                │
 │                        │ buildSystemPrompt() + buildUserPrompt()             │                │                │
 │                        ├────────────────────────────────────────────────────>│                │                │
 │                        │     system + user prompt                            │                │                │
 │                        │<────────────────────────────────────────────────────┤                │                │
 │                        │                   │                │                │                │                │
 │                        │ generateStream(system, user, callback)              │                │                │
 │                        ├────────────────────────────────────────────────────────────────────>│                │
 │                        │                   │                │                │                │                │
 │                        │                   │                │                │     onToken     │                │
 │                        │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤                │
 │                        │                   │                │                │                │  更新 value     │
 │                        ├────────────────────────────────────────────────────────────────────────────────────>│
 │                        │                   │                │                │                │                │
 │                        │                   │                │                │     onToken     │                │
 │                        │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤                │
 │                        │                   │                │                │                │  更新 value     │
 │                        ├────────────────────────────────────────────────────────────────────────────────────>│
 │                        │                   │                │                │                │                │
 │                        │                   │                │                │   onComplete    │                │
 │                        │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤                │
 │                        │                   │                │                │                │                │
 │                        │  [autoCommit?]    │                │                │                │                │
 │                        ├──(是)────────────>│ commit()       │                │                │                │
 │                        │                   │                │                │                │                │
 │                        │  [autoPush?]      │                │                │                │                │
 │                        ├──(是)────────────>│ push()         │                │                │                │
 │                        │                   │                │                │                │                │
 │  显示完成通知           │                   │                │                │                │                │
 │<───────────────────────┤                   │                │                │                │                │
```

### 4.2 流式输出节流策略

```typescript
// 防止高频更新 SCM inputBox 导致 UI 卡顿
// 使用 50ms 节流批量更新

class ThrottledWriter {
  private buffer = '';
  private timer: NodeJS.Timeout | null = null;
  private readonly interval = 50; // ms

  constructor(private inputBox: vscode.SourceControlInputBox) {}

  append(token: string) {
    this.buffer += token;
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.inputBox.value += this.buffer;
        this.buffer = '';
        this.timer = null;
      }, this.interval);
    }
  }

  flush() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.buffer) {
      this.inputBox.value += this.buffer;
      this.buffer = '';
    }
  }
}
```

---

## 5. package.json 核心结构

```jsonc
{
  "name": "youcommit",
  "displayName": "YouCommit - 柚提",
  "description": "AI-powered git commit message generator. BYOK, multi-format, customizable.",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "icon": "resources/logo/youcommit-logo.png",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["SCM Providers", "Other"],
  "keywords": [
    "git", "commit", "ai", "conventional-commits",
    "gitmoji", "source-control", "youcommit"
  ],
  "activationEvents": [],
  "main": "./dist/extension.js",

  "contributes": {
    "commands": [
      {
        "command": "youcommit.generateMessage",
        "title": "YouCommit: 生成 Commit Message",
        "category": "YouCommit",
        "icon": {
          "light": "resources/icons/youcommit-generate-light.svg",
          "dark": "resources/icons/youcommit-generate-dark.svg"
        }
      },
      {
        "command": "youcommit.openSettings",
        "title": "YouCommit: 打开设置",
        "category": "YouCommit",
        "icon": {
          "light": "resources/icons/youcommit-settings-light.svg",
          "dark": "resources/icons/youcommit-settings-dark.svg"
        }
      },
      {
        "command": "youcommit.configureProvider",
        "title": "YouCommit: 配置 AI 模型",
        "category": "YouCommit"
      },
      {
        "command": "youcommit.setApiKey",
        "title": "YouCommit: 设置 API Key",
        "category": "YouCommit"
      }
    ],

    "menus": {
      "scm/title": [
        {
          "command": "youcommit.generateMessage",
          "group": "navigation",
          "when": "scmProvider == git"
        },
        {
          "command": "youcommit.openSettings",
          "group": "navigation",
          "when": "scmProvider == git"
        }
      ],
      "scm/inputBox": [
        {
          "command": "youcommit.generateMessage",
          "when": "scmProvider == git"
        }
      ]
    },

    "keybindings": [
      {
        "command": "youcommit.generateMessage",
        "key": "ctrl+shift+g ctrl+shift+a",
        "mac": "cmd+shift+g cmd+shift+a"
      }
    ],

    "configuration": {
      "title": "YouCommit",
      "properties": {
        "youcommit.provider.baseUrl": {
          "type": "string",
          "default": "",
          "description": "AI API Base URL"
        },
        "youcommit.provider.model": {
          "type": "string",
          "default": "",
          "description": "AI 模型名称"
        },
        "youcommit.commitFormat": {
          "type": "string",
          "enum": ["conventional", "gitmoji", "simple", "detailed", "custom"],
          "default": "conventional",
          "enumDescriptions": [
            "Conventional Commits (feat/fix/chore...)",
            "Gitmoji (✨/🐛/🔥...)",
            "简洁模式（一行描述）",
            "详细模式（标题 + 详细列表）",
            "自定义 Prompt 模板"
          ],
          "description": "Commit message 格式规范"
        },
        "youcommit.contentRule": {
          "type": "string",
          "enum": ["standard", "brief", "verbose", "custom"],
          "default": "standard",
          "enumDescriptions": [
            "标准模式：平衡描述",
            "精简模式：一行核心描述",
            "详尽模式：逐文件列举",
            "自定义规则"
          ],
          "description": "内容生成规则"
        },
        "youcommit.language": {
          "type": "string",
          "enum": ["zh-CN", "en-US"],
          "default": "zh-CN",
          "enumDescriptions": ["中文", "English"],
          "description": "生成消息的语言"
        },
        "youcommit.customPromptPath": {
          "type": "string",
          "default": "",
          "description": "自定义 Prompt 模板文件路径"
        },
        "youcommit.autoCommit": {
          "type": "boolean",
          "default": false,
          "description": "生成后自动执行 git commit"
        },
        "youcommit.autoPush": {
          "type": "boolean",
          "default": false,
          "description": "自动 commit 后自动执行 git push"
        },
        "youcommit.streaming": {
          "type": "boolean",
          "default": true,
          "description": "启用流式输出"
        },
        "youcommit.temperature": {
          "type": "number",
          "default": 0.3,
          "minimum": 0,
          "maximum": 2,
          "description": "AI 生成温度（越低越确定）"
        },
        "youcommit.maxDiffLength": {
          "type": ["number", "string"],
          "default": "auto",
          "description": "最大 diff 字符数，'auto' 为自动调整"
        }
      }
    }
  }
}
```

---

## 6. 构建与发布

### 6.1 构建流程

```
pnpm install          # 安装依赖
pnpm run build        # esbuild 打包 → dist/extension.js
pnpm run test         # 运行测试
pnpm run package      # vsce package → youcommit-x.x.x.vsix
pnpm run publish      # vsce publish → 发布到 Marketplace
```

### 6.2 esbuild 构建配置

```javascript
// esbuild.mjs
import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],           // vscode 模块由宿主环境提供
  format: 'cjs',                  // VSCode 要求 CommonJS
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
});
```

### 6.3 .vscodeignore

```
.vscode/**
src/**
test/**
node_modules/**
doc/**
.eslintrc.json
.prettierrc
tsconfig.json
esbuild.mjs
**/*.map
```

---

## 7. 开发与调试

### 7.1 调试配置

```jsonc
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "npm: watch"
    }
  ]
}
```

### 7.2 开发命令

```bash
yarn watch             # esbuild watch 模式，修改后自动重新打包
# 然后 F5 启动 Extension Development Host 调试窗口
```

---

## 8. 后期扩展评估（付费内置模型）

> 一期为纯客户端 BYOK 插件，不需要后端。以下为二期付费功能的扩展性评估，确认一期架构不会成为后期瓶颈。

### 8.1 扩展策略

| 阶段 | 内容 | 是否需要后端 |
|------|------|------------|
| **Phase 1（一期）** | 纯 BYOK，用户自带 API Key | ❌ 不需要 |
| **Phase 2** | 新增免费内置模型（引流） | ✅ 需要后端 |
| **Phase 3** | 三档付费套餐 + 支付 | ✅ 需要后端 + 支付 |
| **Phase 4** | 管理后台 + 运营工具 | ✅ 需要后端 |

### 8.2 一期对二期的影响评估

| 评估项 | 结论 |
|--------|------|
| 插件端改动量 | **低**（2-3 天）。仅 `aiService.ts` 新增内置模式分支 |
| 其他模块影响 | **无**。prompt / diff / git 模块完全复用 |
| 架构风险 | **无**。aiService 独立封装已预留扩展空间 |

### 8.3 关键设计原则（一期须遵守）

**AI 调用封装隔离**：所有 AI 请求统一通过 `aiService.generate()` 接口，调用方不感知底层是直连用户 API 还是走后端代理。

```typescript
// 一期
aiService.generate() → 直连用户自配 API

// 二期（仅 aiService 内部新增分支）
aiService.generate()
    ├─→ BYOK 模式 → 直连用户 API（不变）
    └─→ 内置模式 → 请求后端服务 → 后端代理转发到 AI API
```

### 8.4 二期后端技术栈预判

| 项目 | 预判选型 | 理由 |
|------|---------|------|
| 后端框架 | Node.js（Express / Hono） | 用户熟悉 Node.js，TypeScript 全栈 |
| 数据库 | PostgreSQL / MySQL | 关系型，适合订阅/用量 |
| 认证 | GitHub OAuth + JWT | 开发者自然登录方式 |
| 支付 | 微信/支付宝 SDK | 国内用户为主 |

> 以上仅为预判，Phase 2 启动时再最终确定。

---

## 9. 需你确认/提供的事项

| # | 事项 | 说明 |
|---|------|------|
| 1 | **专属图标 SVG 文件** | 需提供 4 个 SVG：生成按钮（light/dark）+ 设置按钮（light/dark），规格 16x16 单色 |
| 2 | **插件市场 Logo** | 128x128 PNG，用于 Marketplace 展示 |
| 3 | **publisher 名称** | 发布到 Marketplace 时需要的发布者 ID |
| 4 | **小米 MiLM 平台 API 地址** | 需确认实际 BaseUrl，我预填的地址可能不准确 |
| 5 | **LICENSE 类型** | 建议 MIT，你确认？ |
| 6 | **包管理器确认** | 已更新为 yarn |
