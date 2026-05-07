# 项目理解报告 — YouCommit（柚提）

> 生成日期：2026-05-07
> 项目版本：0.2.11
> 分析范围：VS Code 扩展客户端 + NestJS 后端服务

---

## 1. 项目概览

| 项 | 内容 |
|---|------|
| **项目名称** | YouCommit - 柚提 🍊✨ |
| **版本** | 0.2.11（扩展） / 0.1.0（后端） |
| **许可证** | MIT |
| **仓库** | https://github.com/tardis9527/you-commit |
| **发布者** | tardis9527 |

**一句话定位**：一款 VS Code 扩展，利用 AI 分析 Git 暂存区 diff 并一键生成规范的 Commit Message，面向所有使用 Git 的开发者。

**核心价值主张**：
- **双模式运营**：既提供开箱即用的"内置 AI 服务"（按次付费、无需自备 API Key），又支持"AI模型渠道"模式（BYOK，自带 Key 直连 OpenAI / DeepSeek / 通义千问等），兼顾新手与进阶用户。
- **流式输出体验**：生成的 Commit Message 逐字实时填入 SCM 输入框，所见即所得。
- **高度可定制**：5 种提交格式 × 4 种内容规则 × 2 种语言，还支持自定义 Prompt 模板文件。

---

## 2. 产品功能

### 2.1 核心功能清单（按用户使用流程）

1. **首次配置**：安装后自动弹出 Walkthrough 向导，引导用户选择服务模式并完成配置。
2. **选择服务模式**：
   - **内置服务**：购买密钥 → 输入 `YC-` 密钥激活 → 绑定设备，即可使用。
   - **AI模型渠道**：选择 AI 平台 → 输入 API Key → 选择模型 → 自动验证连接。
3. **生成 Commit Message**：暂存改动 → 点击 SCM 标题栏 ✨ 图标或快捷键 → AI 分析 diff → 流式 / 一次性填入输入框。
4. **自动化操作（可选）**：生成后自动 `git commit`，commit 后自动 `git push`。
5. **额度管理（内置服务）**：状态栏实时显示剩余次数，支持查询 / 购买 / 输入新密钥。

### 2.2 用户交互入口

- **VS Code 扩展 UI**：SCM 标题栏按钮（生成 ✨ / 设置 ⚙️）、命令面板（7 条命令）、状态栏（额度显示）、设置页（12 项配置 + 快捷链接）、Walkthrough 向导
- **快捷键**：`Ctrl+Shift+G Ctrl+Shift+A`

### 2.3 输入输出

| 输入 | 输出 |
|------|------|
| 用户暂存的 Git diff + 分支信息 | 规范的 Commit Message（逐字流式填入 SCM 输入框） |
| 用户配置（格式/规则/语言/自定义模板） | 定制化的 Prompt → 定制化的 Commit Message |
| 服务密钥 / API Key | 身份验证 → 服务激活 |

---

## 3. 技术架构

### 3.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **扩展客户端** | TypeScript + VS Code Extension API | 运行在 VS Code 进程中 |
| **构建工具** | esbuild | 打包为单文件 CJS（`dist/extension.js`） |
| **后端服务** | NestJS 10 + TypeORM + PostgreSQL | 内置服务的代理 / 密钥 / 额度管理 |
| **容器化** | Docker + docker-compose | 后端一键部署 |
| **代码规范** | ESLint + Prettier | 半分号、单引号、2 空格 |
| **测试框架** | Vitest（已配置，暂无测试用例） | — |
| **包管理** | Yarn | 客户端和后端各自独立的 `yarn.lock` |
| **发布** | @vscode/vsce + Open VSX | 打包 `.vsix`，分别发布到 VS Code Marketplace 和 Open VSX |

### 3.2 系统分层架构

```
┌──────────────────────────────────────────────────────┐
│                    VS Code 用户界面                      │
│  (SCM 按钮 / 命令面板 / 设置页 / 状态栏 / Walkthrough)    │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│               Commands 层（命令处理器）                   │
│  generateMessage / configureProvider / openSettings    │
└───┬────────────────────┬─────────────────────────────┘
    │                    │
┌───▼────────┐  ┌────────▼─────────────────────────────┐
│ Config 层   │  │            Services 层                 │
│ ConfigMgr  │  │ GitService / DiffProcessor / PromptBuilder │
│ SecretMgr  │  │ AiService (BYOK) / BuiltinService (内置)   │
│ Platforms  │  └────────┬──────────────┬───────────────┘
└────────────┘           │              │
                         │              │
        ┌────────────────▼──┐    ┌──────▼──────────────┐
        │  AI 平台 API       │    │  YouCommit 后端       │
        │ (OpenAI/DeepSeek  │    │  NestJS + PostgreSQL │
        │  /通义千问/自定义)  │    │  (密钥/额度/SSE代理)  │
        └───────────────────┘    └──────────────────────┘
```

### 3.3 核心数据流

**BYOK 模式**：
```
用户点击生成 → GitService.getStagedDiff() → DiffProcessor.process()
→ PromptBuilder.buildSystemPrompt() + buildUserPrompt()
→ AiService.generateStream() → fetch SSE 到 AI 平台
→ 逐 token 回调 → GitService.appendCommitMessage() → SCM 输入框
```

**内置服务模式**：
```
用户点击生成 → GitService.getStagedDiff() → DiffProcessor.process()
→ PromptBuilder.buildSystemPrompt() + buildUserPrompt()
→ BuiltinService.generateStream() → POST /api/generate (后端)
→ 后端验证密钥/额度 → 后端 fetch AI 渠道 → SSE 转发回客户端
→ 逐 token 回调 → GitService.appendCommitMessage() → SCM 输入框
```

### 3.4 外部依赖与集成

| 外部服务 | 对接方式 | 用途 |
|----------|----------|------|
| OpenAI / DeepSeek / 通义千问 / 小米 MiLM 等 | OpenAI 兼容 REST API（SSE 流式） | AI 模型推理 |
| YouCommit 后端 (`youcommit.ai-you.top`) | HTTP + SSE | 内置服务：密钥激活、额度查询、AI 生成代理 |
| VS Code Git 扩展 (`vscode.git`) | Extension API | 获取 diff、分支、操作 inputBox、commit、push |
| VS Code SecretStorage | Extension API | 安全存储 API Key / 服务密钥 |
| 购买页面 (`pay.ldxp.cn`) | 外部链接跳转 | 用户购买内置服务额度 |

---

## 4. 代码结构

### 4.1 目录结构概览

```
you-commit/
├── src/                          # VS Code 扩展客户端源码（23 文件）
│   ├── extension.ts              # 扩展入口：activate / deactivate、命令注册、状态栏
│   ├── commands/                  # 命令处理器
│   │   ├── generateMessage.ts    # 核心：生成 Commit Message 完整流程
│   │   ├── configureProvider.ts  # 交互式配置向导（平台/Key/模型）
│   │   └── openSettings.ts      # 打开扩展设置页
│   ├── config/                    # 配置管理
│   │   ├── configManager.ts      # 读取 VS Code 配置项
│   │   ├── secretManager.ts      # API Key / 服务密钥的安全存储
│   │   └── platforms.ts          # 预设 AI 平台列表
│   ├── services/                  # 核心业务服务
│   │   ├── aiService.ts          # BYOK 模式：直连 AI 平台，SSE 流式解析
│   │   ├── builtinService.ts     # 内置服务模式：对接后端 API，密钥激活/额度查询
│   │   ├── gitService.ts         # Git 操作封装（diff/branch/commit/push/inputBox）
│   │   ├── diffProcessor.ts      # Diff 智能处理（过滤/截断/统计）
│   │   └── promptBuilder.ts      # Prompt 构建（格式/规则/语言/自定义模板）
│   ├── types/                     # TypeScript 类型定义
│   │   ├── ai.ts                 # AiError、StreamCallback、AiRequestMessage
│   │   ├── config.ts             # YouCommitConfig、CommitFormat、Language 等
│   │   └── git.ts                # DiffProcessResult、BranchInfo
│   └── utils/                     # 工具函数
│       ├── branchParser.ts       # 分支名 → 类型解析（feature → feat 等）
│       ├── errors.ts             # AI 错误统一处理与用户提示
│       └── logger.ts             # OutputChannel 日志
├── server/                        # NestJS 后端服务（14 文件）
│   ├── src/
│   │   ├── main.ts               # 后端入口：启动 NestJS 应用
│   │   ├── app.module.ts         # 根模块：ConfigModule + TypeORM + 业务模块
│   │   └── modules/
│   │       ├── key/              # 密钥管理模块（激活/额度查询/消费）
│   │       ├── generate/         # 生成模块（SSE 代理转发）
│   │       └── channel/          # AI 渠道管理模块（多渠道/优先级）
│   ├── Dockerfile                # 多阶段构建
│   └── package.json              # 后端独立依赖
├── resources/                     # 静态资源（图标/Walkthrough 文档）
├── scripts/                       # 工具脚本
│   ├── deploy.sh                 # 后端一键部署脚本
│   └── generate-placeholder-logo.mjs  # Logo 生成脚本
├── doc/                           # 项目文档
├── package.json                   # 扩展 manifest + 依赖 + 脚本
├── esbuild.mjs                   # esbuild 构建配置
├── tsconfig.json                  # 客户端 TS 配置
├── docker-compose.yml            # 后端 Docker 编排
└── .env.example                  # 环境变量模板
```

### 4.2 核心模块及其依赖关系

```
extension.ts
  ├── commands/generateMessage ─┬→ services/AiService (BYOK)
  │                             ├→ services/BuiltinService (内置)
  │                             ├→ services/GitService
  │                             ├→ services/DiffProcessor
  │                             └→ services/PromptBuilder
  ├── commands/configureProvider → config/ConfigManager, SecretManager, platforms
  ├── config/ConfigManager ──→ vscode.workspace.getConfiguration
  └── config/SecretManager ──→ vscode.SecretStorage
```

### 4.3 关键入口文件与启动流程

**扩展客户端** — `src/extension.ts`:
1. `activate()` 被 VS Code 在 `onStartupFinished` 时调用
2. 创建 `ConfigManager` 和 `SecretManager` 实例
3. 创建状态栏项（显示内置服务额度）
4. 注册 7 个命令到 `context.subscriptions`
5. 监听 `serviceMode` 配置变化，动态更新状态栏
6. 注册 `onQuotaUpdate` 回调，生成后自动更新额度显示
7. 检查首次运行，决定是否弹出 Walkthrough

**后端服务** — `server/src/main.ts`:
1. `NestFactory.create(AppModule)` 启动
2. 启用 CORS + ValidationPipe
3. 监听 `SERVER_PORT`（默认 19728）

### 4.4 配置管理方式

- **用户配置**：通过 VS Code `settings.json`（`youcommit.*`），由 `ConfigManager` 统一读取
- **敏感信息**：API Key / 服务密钥通过 VS Code `SecretStorage`，由 `SecretManager` 管理
- **后端配置**：通过 `.env` 文件（`SERVER_PORT` / `DATABASE_URL`），NestJS `ConfigModule` 读取
- **AI 渠道配置**：存储在 PostgreSQL `ai_channels` 表中，后端管理

---

## 5. 核心实现逻辑

### 5.1 主流程：生成 Commit Message

**调用链**（`src/commands/generateMessage.ts`）：

```
generateMessage()
  ├─ 检查是否正在生成（防重入锁 isGenerating）
  ├─ 根据 serviceMode 检查配置/密钥
  ├─ new GitService(sourceControl)
  ├─ 选择 StreamProvider: BuiltinService | AiService
  ├─ gitService.hasStagedChanges() → 无则提示返回
  ├─ vscode.window.withProgress() 包裹以下流程：
  │   ├─ gitService.getStagedDiff()       → 获取 staged diff
  │   ├─ gitService.getCurrentBranch()    → 获取当前分支名
  │   ├─ parseBranch(branchName)          → 解析分支类型
  │   ├─ diffProcessor.process(rawDiff, maxLength) → 三级截断策略
  │   ├─ promptBuilder.buildSystemPrompt()  → 组装 system prompt
  │   ├─ promptBuilder.buildUserPrompt()    → 组装 user prompt
  │   ├─ gitService.setCommitMessage("✨ 正在生成中...")
  │   └─ generateStreaming() | generateNonStreaming()
  │       ├─ streamProvider.generateStream(system, user, callback)
  │       │   ├─ onToken(token) → gitService.appendCommitMessage(token) [50ms 节流]
  │       │   ├─ onComplete(text) → handleAutoActions()
  │       │   └─ onError(error)
  │       └─ handleAutoActions()
  │           ├─ gitService.commit(message)   [autoCommit]
  │           └─ gitService.push()            [autoPush]
  └─ catch → handleAiError() → 分类错误提示
```

### 5.2 Diff 处理的三级截断策略

`DiffProcessor.process()` 实现了智能的 diff 长度控制：

1. **full**：过滤忽略文件（lock 文件 / .min.js / .map 等）后，若长度 ≤ `maxDiffLength`，原样输出。
2. **file-truncated**：每文件截取前 100 行，截断部分标注 `[... 截断 N 行]`。
3. **stats-only**：仍超限时，仅输出文件级变更统计（文件名 + 增删行数），引导 AI 生成概要性 commit message。

### 5.3 SSE 流式解析

`AiService` 和 `BuiltinService` 各自实现 `parseSSEStream()`，均采用相同模式：
- `ReadableStream` → `getReader()` + `TextDecoder` 逐块读取
- 按换行符分割，匹配 `data: ` 前缀
- 遇到 `[DONE]` 标记完成
- `BuiltinService` 额外解析 `parsed.remaining` 字段实时更新额度

### 5.4 Prompt 构建

`PromptBuilder` 组装 system prompt 的逻辑：
- **基础指令**：角色定义 + 4 条核心原则
- **格式指令**：根据 `commitFormat`（conventional / gitmoji / simple / detailed）附加格式要求
- **内容规则**：根据 `contentRule`（standard / brief / verbose）附加内容规则
- **语言指令**：根据 `language` 指定输出语言
- **自定义模板**：若 `commitFormat` 或 `contentRule` 为 `custom`，则从文件系统加载用户模板，完全替换系统 prompt

User prompt 包含：当前分支名 + 分支类型提示 + 文件变更统计 + 代码 diff。

### 5.5 后端 SSE 代理

`GenerateService.generate()` 的流程：
1. 验证 `machineId` 对应的密钥有剩余额度
2. 从 `ai_channels` 表获取优先级最高的活跃渠道
3. 设置 SSE 响应头
4. 向 AI 渠道发起 SSE 流式请求
5. **先消费一次额度**，再开始转发
6. 逐 token 转发给客户端（`{ token }` 格式）
7. 完成时查询剩余额度，发送 `{ done: true, remaining: N }`

### 5.6 关键设计模式与架构决策

- **策略模式**：`StreamProvider` 接口统一 `AiService` 和 `BuiltinService`，`generateMessage` 通过 `isBuiltin` 决定使用哪个实现，零分支逻辑。
- **防重入锁**：模块级 `isGenerating` 变量防止并发生成。
- **节流输出**：50ms `THROTTLE_MS` 合并 token 写入，避免 VS Code inputBox 的高频更新性能问题。
- **三级降级**：diff 处理从 full → file-truncated → stats-only 逐级降级，兼顾信息量与 token 限制。
- **设备绑定**：密钥通过 `vscode.env.machineId` 绑定设备，同一密钥不可跨设备使用。

### 5.7 扩展机制

- **添加新 AI 平台**：在 `src/config/platforms.ts` 的 `PLATFORM_PRESETS` 数组中添加条目即可。
- **添加新提交格式**：在 `src/types/config.ts` 的 `CommitFormat` 类型中添加，并在 `promptBuilder.ts` 的 `FORMAT_INSTRUCTIONS` 中补充对应指令，同时更新 `package.json` 的 `configuration`。
- **添加新命令**：在 `package.json` 注册 command，在 `extension.ts` 中 `registerCommand`，视复杂度决定是否抽离到 `commands/` 目录。
- **添加新后端模块**：在 `server/src/modules/` 下新建 NestJS 模块，注册到 `AppModule`。

---

## 6. 构建与部署

### 6.1 本地开发启动

```bash
# 扩展开发
yarn install          # 安装依赖
yarn ext:watch        # watch 模式编译
# 按 F5 启动 Extension Development Host

# 后端开发（可选）
yarn server:install   # 安装后端依赖
cp .env.example .env  # 配置环境变量
yarn server:dev       # watch 模式启动后端
```

### 6.2 依赖安装

- **客户端**：`yarn install`（根目录）
- **后端**：`yarn --cwd server install` 或 `yarn server:install`
- 两套独立的 `yarn.lock`，互不干扰

### 6.3 构建产物

- **扩展**：`yarn ext:package` → `dist/extension.js`（esbuild，production minify + tree shaking）
- **打包**：`npx @vscode/vsce package --no-dependencies` → `.vsix` 文件
- **后端**：`yarn server:build` → `server/dist/`（NestJS/tsc 编译）

### 6.4 部署方式

- **VS Code Marketplace**：手动上传 `.vsix` 文件
- **Open VSX**：`npx ovsx publish <vsix文件> -p <token>`
- **后端**：`docker compose up -d` 或 `bash scripts/deploy.sh`（一键 git pull → 安装依赖 → 构建镜像 → 重启容器 → 清理旧镜像）

### 6.5 CI/CD

**暂无自动化 CI/CD 流程**。发布和部署均为手动操作。

---

## 7. 代码质量与技术债评估

### 7.1 代码规范一致性

| 维度 | 评估 |
|------|------|
| **命名风格** | ✅ 优秀。TypeScript 严格模式；类用 PascalCase，函数用 camelCase，常量用 UPPER_SNAKE_CASE，一致性很好。 |
| **目录组织** | ✅ 优秀。按职责分层（commands / config / services / types / utils），每层有 `index.ts` 统一导出，清晰明了。 |
| **注释质量** | ⚠️ 一般。代码本身可读性高、函数命名清晰，但几乎无 JSDoc 注释。关键函数（如 `DiffProcessor.process`、`parseSSEStream`）缺少参数和返回值文档。 |
| **Prettier 配置** | ✅ 统一配置，代码风格一致。 |
| **类型安全** | ✅ 开启 `strict: true`；自定义 `AiError` 类型错误码枚举覆盖完善。 |

### 7.2 测试覆盖情况

| 维度 | 状况 |
|------|------|
| **单元测试** | ❌ 无。Vitest 已配置（`devDependencies` + `scripts`），但项目中 **不存在任何测试文件**。 |
| **集成测试** | ❌ 无 |
| **E2E 测试** | ❌ 无 |
| **覆盖率** | 0% |

这是当前最大的质量短板。`DiffProcessor`、`branchParser`、`PromptBuilder` 等纯逻辑模块非常适合编写单元测试。

### 7.3 已知问题与技术债

| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | **SSE 解析代码重复** | 中 | `AiService.parseSSEStream()` 和 `BuiltinService.parseSSEStream()` 逻辑高度相似（约 50 行），可抽取为公共 SSE 解析工具。 |
| 2 | **无测试** | 高 | 如上所述，0% 覆盖率。 |
| 3 | **`tasks.json` 命令错误** | 低 | `watch` 任务使用 `yarn run watch`，但 `package.json` 中定义的脚本名为 `ext:watch`，实际运行会报错。 |
| 4 | **TypeORM `synchronize: true` 用于生产** | 中 | 后端 `app.module.ts` 中 `synchronize: true` 在生产环境可能导致数据丢失，应改用 migration。 |
| 5 | **后端额度扣减时序** | 中 | `GenerateService.generate()` 在 AI 请求成功返回首个 chunk 后（response.ok 之后）就立即 `consumeOne()`，若后续流式传输中断，用户损失一次额度。可考虑在完整成功后再扣减。 |
| 6 | **后端缺少认证中间件** | 中 | `/api/quota` 和 `/api/generate` 仅靠 `key + machineId` 验证，无 rate limiting、无 HMAC 签名，`machineId` 可被伪造。 |
| 7 | **模块级状态** | 低 | `quotaUpdateListener` 是模块级单例变量，仅支持一个监听器。若未来需要多处监听，需改为事件发射器模式。 |
| 8 | **硬编码购买链接** | 低 | `SHOP_URL` 硬编码在 `extension.ts` 中，若链接变更需改代码重新发布。可考虑从后端动态获取。 |
| 9 | **TODO/FIXME 统计** | — | 源码中 **无 TODO/FIXME/HACK** 标记。 |

### 7.4 安全隐患

| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | **API Key 存储** | ✅ 安全 | 使用 VS Code SecretStorage，不写入配置文件。 |
| 2 | **后端 `ai_channels` 表中 API Key 明文存储** | ⚠️ 中 | `channel.entity.ts` 中 `apiKey` 为明文 VARCHAR 列。建议加密存储。 |
| 3 | **CORS 全开** | ⚠️ 中 | `app.enableCors()` 未限制 origin，生产环境应配置白名单。 |
| 4 | **无 rate limiting** | ⚠️ 中 | 后端 API 无请求频率限制，可能被滥用。 |
| 5 | **`machineId` 可伪造** | ⚠️ 低 | `machineId` 由客户端传入，恶意用户可伪造以绑定他人密钥。但由于密钥本身是一次性绑定，风险有限。 |

---

## 8. 改进建议

### 🔴 高优先级

| # | 问题 | 影响范围 | 建议方案 |
|---|------|----------|----------|
| 1 | **无测试覆盖** | 全局质量、回归风险 | 优先为 `DiffProcessor`、`branchParser`、`PromptBuilder` 编写单元测试（纯逻辑，无需 mock VS Code API）；再为 `AiService` 和 `BuiltinService` 编写集成测试（mock fetch）。目标：核心模块 80%+ 覆盖率。 |
| 2 | **SSE 解析逻辑重复** | `aiService.ts` + `builtinService.ts` | 抽取公共 `parseSSEStream(body, tokenExtractor, callback)` 工具函数到 `utils/`，两个 service 复用。减少约 100 行重复代码。 |
| 3 | **TypeORM `synchronize: true`** | 后端数据安全 | 生产环境关闭 `synchronize`，引入 TypeORM migration 管理数据库 schema 变更。 |

### 🟡 中优先级

| # | 问题 | 影响范围 | 建议方案 |
|---|------|----------|----------|
| 4 | **后端安全加固** | 内置服务安全 | 1) 添加 rate limiting（`@nestjs/throttler`）；2) CORS 配置 origin 白名单；3) 考虑对 `key + machineId` 添加 HMAC 签名验证。 |
| 5 | **额度扣减时序优化** | 用户体验 | 将 `consumeOne()` 移到流式传输完成后（`[DONE]` 事件时）扣减，避免传输中断导致用户白白损失额度。 |
| 6 | **AI 渠道 API Key 加密** | 后端数据安全 | 使用 AES 加密存储 `ai_channels.apiKey`，运行时解密。 |
| 7 | **CI/CD 自动化** | 开发效率、发布质量 | 配置 GitHub Actions：PR 时自动跑 lint + test；tag 时自动打包 `.vsix` 并发布到 Marketplace / Open VSX。 |
| 8 | **`tasks.json` 修复** | 开发体验 | 将 `yarn run watch` 改为 `yarn run ext:watch`。 |

### 🟢 低优先级

| # | 问题 | 影响范围 | 建议方案 |
|---|------|----------|----------|
| 9 | **JSDoc 注释** | 代码可维护性 | 为核心公共 API（`DiffProcessor.process`、`PromptBuilder.build*`、`AiService.generateStream` 等）添加 JSDoc。 |
| 10 | **购买链接可配置化** | 运营灵活性 | `SHOP_URL` 改为从后端 API 动态获取，或至少放入配置项中。 |
| 11 | **国际化（i18n）** | 用户体验 | 当前 UI 文案全部硬编码中文。若面向国际用户，可引入 VS Code 的 `vscode-nls` 或 `l10n` 机制。 |
| 12 | **后端管理界面** | 运营效率 | 为密钥管理、渠道管理、额度查看等添加简单的管理后台 API 或 Web UI。当前只能直接操作数据库。 |

### ⚡ Quick Wins（可快速实施）

1. **修复 `tasks.json`**：一行改动，`yarn run watch` → `yarn run ext:watch`。
2. **为 `branchParser` 写测试**：纯函数，10 分钟可完成，建立测试基础设施。
3. **抽取 SSE 解析工具**：约 30 分钟，消除最明显的代码重复。
4. **关闭生产 `synchronize`**：添加环境变量判断，`synchronize: process.env.NODE_ENV !== 'production'`。

### 🗺️ 中长期优化方向

1. **测试体系建设**：从核心纯逻辑模块开始，逐步扩展到 mock VS Code API 的命令测试，最终引入 `@vscode/test-electron` 做 E2E 测试。
2. **后端架构演进**：引入 Redis 做 rate limiting 和缓存；添加请求日志 / 监控；考虑添加管理后台。
3. **多模型支持增强**：支持用户配置多个 AI 模型并快速切换；支持 fallback（主模型失败时自动切换备用模型）。
4. **Prompt 工程优化**：建立 prompt 版本管理，A/B 测试不同 prompt 对生成质量的影响；支持用户反馈（赞/踩），收集数据优化 prompt。
5. **离线 / 本地模型支持**：支持 Ollama 等本地模型运行时，满足对数据隐私有要求的企业用户。
