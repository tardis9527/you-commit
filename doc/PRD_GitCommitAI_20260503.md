# PRD：GitCommitAI

> **版本**：v1.0  
> **日期**：2026-05-03  
> **状态**：草稿  
> **关联文档**：[Product_Brief_GitCommitAI_20260503.md](./Product_Brief_GitCommitAI_20260503.md)

---

## 1. 产品概述

### 1.1 产品定义

GitCommitAI 是一款 VSCode 插件，让个人开发者通过自带 AI 模型（BYOK），在 Source Control 面板一键生成高质量 git commit message。支持多种格式规范、多种生成规则、自定义 prompt 模板，并可选自动 commit/push。

### 1.2 目标用户

个人开发者 / 独立开发者，日常使用 VSCode + Git 工作流，每天高频 commit（数十次），遵循 Git Flow 分支管理和 commit message 规范。

### 1.3 核心价值

| 价值点 | 描述 |
|--------|------|
| **免费 + BYOK** | 插件完全免费，用户自配 AI 模型（BaseUrl + ApiKey + Model），零订阅成本 |
| **开箱即用** | 预置常用默认配置，首次使用仅需引导配置 AI 模型，三步上手 |
| **灵活可控** | 多格式规范、多生成规则、自定义 prompt，适配不同风格偏好 |
| **端到端提效** | diff 分析 → 流式生成 message → 可编辑 → 可选自动 commit/push |

### 1.4 成功指标

| 指标 | 目标 |
|------|------|
| 首次配置完成率 | > 90%（引导流程完成率） |
| 生成消息直接可用率 | > 60%（小改动场景下无需编辑直接提交） |
| 日均使用次数 | 与用户日均 commit 次数持平 |
| 生成耗时 | < 5 秒（小改动）/ < 15 秒（大改动） |

---

## 2. 功能需求详细规格

### 2.1 F01：BYOK 模型配置 + 首次引导

#### 2.1.1 需求描述

用户安装插件后，系统检测到未配置 AI 模型，自动触发引导流程，引导用户完成 BaseUrl + ApiKey + Model 的基础配置。

#### 2.1.2 引导流程

```
步骤1：选择 AI 平台
┌─────────────────────────────────────────┐
│  GitCommitAI: 选择你的 AI 平台           │
│                                         │
│  > 阿里云百炼                            │
│    小米 MiLM                             │
│    OpenAI                               │
│    DeepSeek                             │
│    自定义（手动输入 BaseUrl）              │
└─────────────────────────────────────────┘
↓ 选择平台后自动填入对应 BaseUrl
↓ 选择"自定义"则弹出 InputBox 手动输入

步骤2：输入 API Key
┌─────────────────────────────────────────┐
│  GitCommitAI: 输入你的 API Key           │
│  ┌─────────────────────────────────┐    │
│  │ sk-xxxxxxxxxxxxxxxxxxxxx        │    │
│  └─────────────────────────────────┘    │
│  (输入内容默认密码遮掩)                    │
└─────────────────────────────────────────┘

步骤3：输入模型名称
┌─────────────────────────────────────────┐
│  GitCommitAI: 输入模型名称               │
│  ┌─────────────────────────────────┐    │
│  │ qwen-plus                       │    │
│  └─────────────────────────────────┘    │
│  (根据步骤1选择的平台，给出推荐模型列表)     │
└─────────────────────────────────────────┘

步骤4：连通性验证
┌─────────────────────────────────────────┐
│  ✅ 连接成功！GitCommitAI 已准备就绪。    │
│  ❌ 连接失败：[具体错误信息]。请检查配置。  │
│     [重试]  [修改配置]                    │
└─────────────────────────────────────────┘
```

#### 2.1.3 交互规则

| 规则 | 说明 |
|------|------|
| 触发条件 | 首次安装且未配置 API Key 时自动触发；或点击生成按钮时检测到未配置则触发 |
| 平台预设 | 内置常见平台 BaseUrl 映射表，选择平台后自动填入 |
| Key 安全 | InputBox 使用 `password: true` 遮掩输入；Key 存储在 VSCode SecretStorage 中，不写入 settings.json |
| 连通性验证 | 向配置的 API 发送一个轻量测试请求（如 `model list` 或简短 completion），超时 10 秒 |
| 跳过/取消 | 用户可随时按 Esc 取消引导；下次点击生成按钮时重新触发 |

#### 2.1.4 平台预设映射表（初始版本）

| 平台名称 | BaseUrl | 推荐模型 |
|----------|---------|---------|
| 阿里云百炼 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | qwen-plus, qwen-turbo, qwen-max |
| 小米 MiLM | `https://api.milm.xiaomi.com/v1` | milm-1 |
| OpenAI | `https://api.openai.com/v1` | gpt-4o, gpt-4o-mini |
| DeepSeek | `https://api.deepseek.com/v1` | deepseek-chat, deepseek-coder |
| 自定义 | 用户手动输入 | 用户手动输入 |

> 此映射表可通过插件更新持续扩展，不影响已有用户配置。

---

### 2.2 F02：默认配置预置

#### 2.2.1 需求描述

用户完成 AI 模型配置后，无需任何额外设置即可直接使用。插件预置一套"开箱即用"的默认配置。

#### 2.2.2 默认配置表

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `commitFormat` | `conventional` | 格式规范：Conventional Commits |
| `contentRule` | `standard` | 生成规则：标准模式 |
| `language` | `zh-CN` | 消息语言：中文 |
| `autoCommit` | `false` | 不自动 commit |
| `autoPush` | `false` | 不自动 push |
| `streaming` | `true` | 启用流式输出 |
| `maxDiffLength` | `auto` | 自动根据模型 context window 调整 |
| `temperature` | `0.3` | AI 生成温度（低温 = 更确定性） |

---

### 2.3 F03：高级配置入口

#### 2.3.1 需求描述

在 Source Control 面板提供一个配置按钮（⚙️ 图标），点击后打开插件的 VSCode Settings 配置页面，用户可修改所有配置项。

#### 2.3.2 配置按钮位置

注册在 SCM title 区域的工具栏，图标为 ⚙️，tooltip 为"GitCommitAI 设置"。

#### 2.3.3 完整配置项清单

```jsonc
{
  // ===== AI 模型配置 =====
  "gitCommitAI.provider.baseUrl": {
    "type": "string",
    "description": "AI API Base URL",
    "default": ""
  },
  "gitCommitAI.provider.model": {
    "type": "string",
    "description": "模型名称",
    "default": ""
  },
  // ApiKey 不在 settings 中，使用 SecretStorage

  // ===== 生成行为配置 =====
  "gitCommitAI.commitFormat": {
    "type": "string",
    "enum": ["conventional", "gitmoji", "simple", "detailed", "custom"],
    "default": "conventional",
    "description": "Commit message 格式规范"
  },
  "gitCommitAI.contentRule": {
    "type": "string",
    "enum": ["standard", "brief", "verbose", "custom"],
    "default": "standard",
    "description": "内容生成规则"
  },
  "gitCommitAI.language": {
    "type": "string",
    "enum": ["zh-CN", "en-US"],
    "default": "zh-CN",
    "description": "生成消息的语言"
  },
  "gitCommitAI.customPromptPath": {
    "type": "string",
    "default": "",
    "description": "自定义 prompt 模板文件路径（支持 .md 或 .txt）"
  },

  // ===== 自动化配置 =====
  "gitCommitAI.autoCommit": {
    "type": "boolean",
    "default": false,
    "description": "生成消息后自动执行 git commit"
  },
  "gitCommitAI.autoPush": {
    "type": "boolean",
    "default": false,
    "description": "自动 commit 后自动执行 git push"
  },

  // ===== 高级配置 =====
  "gitCommitAI.streaming": {
    "type": "boolean",
    "default": true,
    "description": "启用流式输出（逐字填入输入框）"
  },
  "gitCommitAI.temperature": {
    "type": "number",
    "default": 0.3,
    "minimum": 0,
    "maximum": 2,
    "description": "AI 生成温度"
  },
  "gitCommitAI.maxDiffLength": {
    "type": ["number", "string"],
    "default": "auto",
    "description": "最大 diff 字符数，'auto' 为根据模型自动调整"
  }
}
```

---

### 2.4 F04：一键生成 Commit Message

#### 2.4.1 需求描述

用户在 Source Control 面板点击 GitCommitAI 专属图标按钮，插件读取 git diff，调用 AI 模型，流式生成 commit message 并填入 SCM 输入框。

#### 2.4.2 按钮注册

| 位置 | VSCode 注册点 | 图标 | tooltip |
|------|--------------|------|---------|
| 输入框旁 | `scm/inputBox` menus | GitCommitAI 专属 SVG | "GitCommitAI: 生成 Commit Message" |
| 标题栏 | `scm/title` menus | GitCommitAI 专属 SVG | "GitCommitAI: 生成 Commit Message" |

#### 2.4.3 生成流程（技术序列）

```
用户点击按钮
    │
    ├─→ [检查] 是否已配置 AI 模型？
    │       否 → 触发首次引导流程（F01）→ 返回
    │
    ├─→ [检查] 是否有已暂存的改动？
    │       否 → 显示提示："请先暂存文件（git add）后再生成"
    │
    ├─→ [获取] git diff --staged
    │
    ├─→ [获取] 当前分支名
    │
    ├─→ [处理] diff 智能截断（如超限）
    │
    ├─→ [组装] prompt = 系统提示词 + 格式规范 + 生成规则 + 分支上下文 + diff
    │
    ├─→ [调用] AI API（stream: true）
    │       │
    │       ├─→ 流式接收 token
    │       │     ├─→ 逐步更新 scm.inputBox.value
    │       │     └─→ 如性能问题 → 降级为分段刷新（按句/按行）
    │       │
    │       └─→ 生成完成
    │             │
    │             ├─→ [autoCommit = false] 消息留在输入框，等待用户编辑/提交
    │             ├─→ [autoCommit = true, autoPush = false] 自动执行 git commit
    │             └─→ [autoCommit = true, autoPush = true] 自动执行 git commit && git push
    │
    └─→ [异常处理] 见 2.4.5
```

#### 2.4.4 按钮状态管理

| 状态 | 按钮表现 | 说明 |
|------|---------|------|
| 空闲 | 专属图标，可点击 | 正常状态 |
| 生成中 | 图标变为 loading 动画（或旋转），不可重复点击 | 防止重复触发 |
| 生成完成 | 恢复空闲状态 | 可再次点击重新生成 |
| 错误 | 恢复空闲状态 + 显示错误通知 | 允许重试 |

#### 2.4.5 异常处理

| 异常场景 | 处理方式 | 提示信息 |
|---------|---------|---------|
| 未配置 AI 模型 | 触发引导流程 | "请先完成 AI 模型配置" |
| 无暂存改动 | 显示 warning 通知 | "没有已暂存的改动。请先使用 git add 暂存文件。" |
| 网络错误 | 显示 error 通知 | "网络连接失败，请检查网络或 API 地址配置。" |
| API Key 无效 | 显示 error 通知 | "API Key 验证失败（401），请检查 Key 配置。" |
| 模型不存在 | 显示 error 通知 | "模型 '{model}' 不存在，请检查模型名称。" |
| 余额不足 | 显示 error 通知 | "API 调用失败（402/429），可能是余额不足或超出限额。" |
| 响应超时 | 显示 error 通知（30 秒超时） | "AI 响应超时，请稍后重试。" |
| 生成内容为空 | 显示 warning 通知 | "AI 返回了空内容，请重试或检查 prompt 配置。" |
| 自动 push 失败 | 显示 warning 通知 | "Commit 成功，但 push 失败：{错误原因}。请手动处理。" |

---

### 2.5 F05：多格式规范选择

#### 2.5.1 需求描述

用户可在配置中选择不同的 commit message 格式规范，控制生成消息的结构。

#### 2.5.2 内置格式规范

##### （1）`conventional` — Conventional Commits（默认）

```
<type>(<scope>): <description>

<body>
```

生成示例：
```
feat(auth): 添加用户登录接口

- 新增 /api/login 接口
- 支持手机号+验证码登录方式
- 添加 JWT token 生成逻辑
```

支持的 type：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore` / `ci` / `build` / `revert`

##### （2）`gitmoji` — Gitmoji 格式

```
<emoji> <description>

<body>
```

生成示例：
```
✨ 添加用户登录接口

- 新增 /api/login 接口
- 支持手机号+验证码登录方式
```

##### （3）`simple` — 简洁模式

```
<一行简洁描述，不超过 72 字符>
```

生成示例：
```
添加用户登录接口，支持手机号验证码登录
```

##### （4）`detailed` — 详细模式

```
<标题行>

## 改动内容
<详细列举所有改动>

## 改动原因
<为什么做这个改动>
```

生成示例：
```
添加用户登录功能

## 改动内容
- 新增 /api/login 接口（POST）
- 新增 LoginService 服务类
- 新增 JWT token 生成和验证工具函数
- 添加登录相关单元测试

## 改动原因
为移动端应用提供用户身份认证能力
```

##### （5）`custom` — 自定义格式

使用用户通过 `gitCommitAI.customPromptPath` 指定的自定义 prompt 模板文件。

---

### 2.6 F06：多内容生成规则

#### 2.6.1 需求描述

在格式规范之外，用户可选择不同的内容生成策略，控制 AI "怎么写"。

#### 2.6.2 内置生成规则

| 规则 ID | 名称 | 说明 | 适用场景 |
|---------|------|------|---------|
| `standard` | 标准模式（默认） | 平衡描述：简要说明改了什么、为什么改 | 日常使用 |
| `brief` | 精简模式 | 仅一行核心描述，不写 body | 小改动/快速提交 |
| `verbose` | 详尽模式 | 逐文件列举改动，附带改动原因推测 | 大模块改动/重要提交 |
| `custom` | 自定义 | 使用用户自定义 prompt | 特殊需求 |

#### 2.6.3 规则与格式的组合

格式规范控制**结构**，生成规则控制**内容深度**，两者独立正交：

```
最终 prompt = 系统基础提示 
            + 格式规范指令（结构）
            + 生成规则指令（深度）
            + 语言指令
            + 分支上下文
            + diff 内容
```

---

### 2.7 F07：自定义 Prompt 模板

#### 2.7.1 需求描述

高级用户可编写自己的 prompt 模板文件，完全控制 AI 生成逻辑。

#### 2.7.2 模板变量

模板文件中可使用以下变量占位符，生成时自动替换：

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `{{diff}}` | git diff --staged 的完整内容（或截断后内容） | `+import axios from 'axios'...` |
| `{{branch}}` | 当前分支名 | `feature/user-login` |
| `{{branchType}}` | 从分支名解析的类型 | `feature` |
| `{{branchName}}` | 从分支名解析的名称部分 | `user-login` |
| `{{language}}` | 用户配置的语言 | `zh-CN` |
| `{{filesChanged}}` | 变更文件列表 | `src/auth.ts, src/login.vue` |
| `{{filesStats}}` | 变更文件统计 | `3 files changed, 45 insertions, 12 deletions` |

#### 2.7.3 模板示例

```markdown
# 文件：.vscode/git-commit-prompt.md

你是一个 Git commit message 生成器。请根据以下代码 diff 生成 commit message。

规则：
- 第一行用中文简要概括改动，不超过 50 字
- 空一行后列举具体改动点
- 每个改动点以 "-" 开头
- 如果当前分支是 {{branchType}} 类型，请在首行添加对应前缀

当前分支：{{branch}}
变更文件：{{filesChanged}}

代码 diff：
```
{{diff}}
```

请直接输出 commit message，不要包含任何解释。
```

#### 2.7.4 配置方式

- 在 settings 中设置 `gitCommitAI.customPromptPath` 指向模板文件
- 支持工作区相对路径（如 `.vscode/git-commit-prompt.md`）和绝对路径
- 当 `commitFormat` 或 `contentRule` 设为 `custom` 时，使用此模板

---

### 2.8 F08：分支名上下文感知

#### 2.8.1 需求描述

插件读取当前 Git 分支名，解析分支类型，作为上下文信息注入 prompt，辅助 AI 推断 commit 类型。

#### 2.8.2 分支名解析规则

| 分支模式 | 正则 | 解析结果 type | 解析结果 name |
|---------|------|-------------|-------------|
| `feature/xxx` | `^feature[/\-_](.+)` | `feature` → 映射为 `feat` | `xxx` |
| `fix/xxx` 或 `bugfix/xxx` | `^(bug)?fix[/\-_](.+)` | `fix` | `xxx` |
| `hotfix/xxx` | `^hotfix[/\-_](.+)` | `fix` | `xxx` |
| `release/xxx` | `^release[/\-_](.+)` | `release` | `xxx` |
| `chore/xxx` | `^chore[/\-_](.+)` | `chore` | `xxx` |
| `docs/xxx` | `^docs?[/\-_](.+)` | `docs` | `xxx` |
| `refactor/xxx` | `^refactor[/\-_](.+)` | `refactor` | `xxx` |
| 其他 | 不匹配 | `null`（不注入类型提示） | 原始分支名 |

#### 2.8.3 注入行为

- 匹配到分支类型时：在 prompt 中加入 `当前分支类型为 {type}，请优先使用此类型作为 commit 前缀`
- 未匹配时：不注入类型提示，完全由 AI 根据 diff 内容自行判断

---

### 2.9 F09：生成后可编辑

#### 2.9.1 需求描述

AI 生成的 commit message 写入 SCM 输入框后，用户可自由编辑。输入框为 VSCode 原生 SCM input，天然支持编辑。

#### 2.9.2 交互细节

| 场景 | 行为 |
|------|------|
| 生成完成（手动模式） | 消息留在输入框，光标定位到末尾，用户可直接编辑 |
| 输入框已有内容时点击生成 | **覆盖**已有内容（生成前清空输入框） |
| 生成过程中用户手动输入 | 中断生成，保留已生成部分 + 用户输入 |
| 再次点击生成按钮 | 清空当前内容，重新生成 |

---

### 2.10 F10：可选自动 Commit / Push

#### 2.10.1 需求描述

用户可通过配置控制生成消息后是否自动执行 git commit 和 git push。

#### 2.10.2 行为矩阵

| autoCommit | autoPush | 生成完成后的行为 |
|-----------|----------|----------------|
| `false`（默认） | `false` | 消息填入输入框，等待用户手动操作 |
| `true` | `false` | 自动执行 `git commit -m "{message}"`，显示成功通知 |
| `true` | `true` | 自动执行 `git commit` 后自动执行 `git push`，显示成功通知 |
| `false` | `true` | **无效组合**——autoPush 依赖 autoCommit，配置校验时提示 |

#### 2.10.3 自动操作通知

| 操作 | 成功通知 | 失败通知 |
|------|---------|---------|
| auto commit | "✅ 已自动提交：{message 首行}" | "❌ 自动提交失败：{错误原因}" |
| auto push | "✅ 已自动推送到 {remote}/{branch}" | "⚠️ 提交成功，但推送失败：{错误原因}。请手动 push。" |

---

### 2.11 F11：多语言消息

#### 2.11.1 需求描述

用户可配置生成中文或英文的 commit message。

#### 2.11.2 实现方式

在 prompt 中追加语言指令：

| 配置值 | prompt 追加内容 |
|--------|---------------|
| `zh-CN` | `请使用中文生成 commit message。` |
| `en-US` | `Please generate the commit message in English.` |

#### 2.11.3 语言范围

语言指令仅控制 AI 生成的消息正文。格式前缀（如 `feat:` / `fix:`）和 Gitmoji 不受语言影响，始终使用标准写法。

---

### 2.12 F12：大 Diff 智能截断

#### 2.12.1 需求描述

当 git diff 内容超出 AI 模型 context window 限制时，智能截断 diff 并保留最有意义的部分，确保仍能生成有效的 commit message。

#### 2.12.2 截断策略

```
判断 diff 总长度
    │
    ├─→ [未超限] 发送完整 diff
    │
    └─→ [超限] 执行分级截断：
         │
         ├─→ 第一级：移除 lock 文件、自动生成文件的 diff（如 package-lock.json、*.min.js）
         │
         ├─→ 第二级：每个文件 diff 截断至前 100 行，附 "[... 截断 {N} 行]" 标记
         │
         └─→ 第三级：仅保留文件变更统计（文件名 + 增/删行数），不发送具体 diff
              附加说明："以下为文件级变更统计，请据此生成概要性 commit message"
```

#### 2.12.3 截断阈值

| 配置值 | 行为 |
|--------|------|
| `auto`（默认） | 根据常见模型取保守值：8000 字符（约 2000 token） |
| 数字（如 `16000`） | 用户手动指定最大 diff 字符数 |

> 选择保守默认值而非精确计算 token，是因为不同模型 tokenizer 不同，保守值可确保兼容性。

---

## 3. 插件注册与命令

### 3.1 Commands

| 命令 ID | 标题 | 说明 |
|---------|------|------|
| `gitCommitAI.generateMessage` | GitCommitAI: 生成 Commit Message | 核心生成命令 |
| `gitCommitAI.openSettings` | GitCommitAI: 打开设置 | 打开插件配置页面 |
| `gitCommitAI.configureProvider` | GitCommitAI: 配置 AI 模型 | 重新运行模型配置引导 |
| `gitCommitAI.setApiKey` | GitCommitAI: 设置 API Key | 单独更新 API Key |

### 3.2 Menus

```jsonc
{
  "menus": {
    "scm/title": [
      {
        "command": "gitCommitAI.generateMessage",
        "group": "navigation",
        "when": "scmProvider == git"
      },
      {
        "command": "gitCommitAI.openSettings",
        "group": "navigation",
        "when": "scmProvider == git"
      }
    ],
    "scm/inputBox": [
      {
        "command": "gitCommitAI.generateMessage",
        "when": "scmProvider == git"
      }
    ]
  }
}
```

### 3.3 快捷键

| 快捷键 | 命令 | 条件 |
|--------|------|------|
| `Ctrl+Shift+G Ctrl+Shift+A` | `gitCommitAI.generateMessage` | SCM 面板激活时 |

---

## 4. Prompt 工程设计

### 4.1 Prompt 组装结构

```
┌──────────────────────────────────────┐
│ System Prompt（系统提示词）            │
│ ┌──────────────────────────────────┐ │
│ │ 角色定义                          │ │
│ │ "你是一个专业的 Git commit         │ │
│ │  message 生成器..."              │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 格式规范指令（F05）               │ │
│ │ "请使用 Conventional Commits..."  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 生成规则指令（F06）               │ │
│ │ "使用标准模式：简要概括..."        │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 语言指令（F11）                   │ │
│ │ "请使用中文生成..."               │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 输出约束                          │ │
│ │ "只输出 commit message 本身，     │ │
│ │  不要包含解释、代码块标记..."      │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ User Prompt（用户消息）               │
│ ┌──────────────────────────────────┐ │
│ │ 分支上下文（F08）                 │ │
│ │ "当前分支：feature/user-login     │ │
│ │  分支类型：feat"                  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ 文件变更统计                      │ │
│ │ "变更文件：3 files changed..."    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Diff 内容                        │ │
│ │ "```diff                         │ │
│ │  + import axios...               │ │
│ │  ```"                            │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 4.2 System Prompt 基础模板

```
你是一个专业的 Git commit message 生成器。你的任务是根据用户提供的代码 diff，生成准确、规范的 commit message。

核心原则：
1. 只描述"做了什么改动"和"为什么改"，不描述代码实现细节
2. 第一行（标题行）不超过 72 个字符
3. 如果改动较多，用列表形式概括关键改动点
4. 只输出 commit message 本身，不要添加任何解释、注释或 markdown 代码块标记

{FORMAT_INSTRUCTION}

{CONTENT_RULE_INSTRUCTION}

{LANGUAGE_INSTRUCTION}
```

---

## 5. 技术架构

### 5.1 模块划分

```
src/
├── extension.ts              # 插件入口，注册命令和事件
├── commands/
│   ├── generateMessage.ts    # 生成 commit message 主命令
│   ├── openSettings.ts       # 打开设置命令
│   └── configureProvider.ts  # AI 模型配置引导命令
├── services/
│   ├── aiService.ts          # AI API 调用封装（支持流式）
│   ├── gitService.ts         # Git 操作封装（diff、branch、commit、push）
│   ├── diffProcessor.ts      # Diff 获取与智能截断
│   └── promptBuilder.ts      # Prompt 组装引擎
├── config/
│   ├── configManager.ts      # 配置读取/写入管理
│   ├── secretManager.ts      # API Key 安全存储（SecretStorage）
│   └── platforms.ts          # 平台预设映射表
├── templates/
│   ├── conventional.md       # Conventional Commits prompt 模板
│   ├── gitmoji.md            # Gitmoji prompt 模板
│   ├── simple.md             # 简洁模式 prompt 模板
│   └── detailed.md           # 详细模式 prompt 模板
├── utils/
│   ├── branchParser.ts       # 分支名解析
│   ├── logger.ts             # 日志工具
│   └── errors.ts             # 错误类型定义
└── test/
    └── ...                   # 单元测试
```

### 5.2 AI 调用接口规范

采用 OpenAI 兼容的 Chat Completions API：

```typescript
// 请求
POST {baseUrl}/chat/completions
Headers: {
  "Authorization": "Bearer {apiKey}",
  "Content-Type": "application/json"
}
Body: {
  "model": "{model}",
  "messages": [
    { "role": "system", "content": "{systemPrompt}" },
    { "role": "user", "content": "{userPrompt}" }
  ],
  "stream": true,
  "temperature": 0.3
}

// 响应（SSE 流式）
data: {"choices":[{"delta":{"content":"feat"}}]}
data: {"choices":[{"delta":{"content":"(auth)"}}]}
data: {"choices":[{"delta":{"content":": 添加登录接口"}}]}
data: [DONE]
```

### 5.3 安全设计

| 安全项 | 方案 |
|--------|------|
| API Key 存储 | VSCode `SecretStorage` API，加密存储在系统密钥链中，不写入 settings.json |
| API Key 显示 | 配置界面中 Key 以 `sk-****xxxx` 格式脱敏显示 |
| 网络请求 | 仅向用户配置的 BaseUrl 发起请求，不向任何第三方上报数据 |
| diff 数据 | 仅在 AI 调用时发送，不做本地持久化，不上传到除 AI API 外的任何服务 |

---

## 6. 非功能需求

### 6.1 性能要求

| 指标 | 目标 |
|------|------|
| 插件激活时间 | < 500ms（使用 `onCommand` 按需激活，不在启动时加载） |
| diff 获取 + prompt 组装 | < 200ms |
| AI 流式首 token 到达 | 取决于 AI 服务商，插件侧无额外延迟 |
| 流式更新输入框频率 | 每 50ms 批量更新一次（防止高频更新卡顿） |

### 6.2 兼容性

| 项目 | 要求 |
|------|------|
| VSCode 版本 | >= 1.85.0 |
| Node.js | >= 18 |
| 操作系统 | Windows / macOS / Linux |
| Git 版本 | >= 2.0 |

### 6.3 国际化

- 一期插件 UI 文本支持中英双语（VSCode `nls` 标准方案）
- AI 生成消息的语言由 `language` 配置控制

---

## 7. 排除项（Not Doing）

| 排除项 | 原因 |
|--------|------|
| 团队协作 / 规范同步 | 定位为个人开发者工具 |
| 重型 Code Review | 超出核心定位，二期考虑轻量改动摘要 |
| PR 描述生成 | 超出 commit 流程范围 |
| Gitee / GitHub 平台集成 | 不依赖特定平台 |
| 内置 AI 模型 / 付费功能 | BYOK 模式，零成本 |
| 多 repo / monorepo 支持 | 一期仅处理单 Git 仓库 |

---

## 8. 开放问题与待决策项

| # | 问题 | 影响范围 | 建议决策时间 |
|---|------|---------|------------|
| 1 | 流式输出到 SCM inputBox 的性能验证 | F04 核心体验 | 开发第一周做 prototype spike |
| 2 | 专属图标设计（深/浅主题 SVG） | 品牌辨识 | 开发前完成 |
| 3 | 各内置 prompt 模板的精确文本 | F05/F06 | 开发 prompt 模块时定稿 |
| 4 | 插件名称最终确认（GitCommitAI） | 发布 | 发布前确认 |
| 5 | 发布平台（Marketplace / Open VSX） | 分发渠道 | 发布前确认 |
| 6 | 小米 MiLM 等平台 API 兼容性验证 | F01 平台预设 | 开发前验证 |

---

## 9. 里程碑与排期建议

| 阶段 | 内容 | 建议时长 |
|------|------|---------|
| **M0：技术验证** | 流式输出 spike + 平台 API 兼容性测试 | 2 天 |
| **M1：基础框架** | 插件脚手架 + 命令注册 + 配置体系 + 图标 | 2 天 |
| **M2：核心链路** | Git 操作封装 + AI 调用 + Prompt 引擎 + 流式生成 | 3 天 |
| **M3：配置引导** | 首次引导流程 + 平台预设 + 连通性验证 | 1 天 |
| **M4：模板体系** | 4 套内置模板 + 自定义 prompt + 分支感知 | 2 天 |
| **M5：自动化** | 自动 commit/push + 大 diff 截断 + 异常处理 | 2 天 |
| **M6：打磨发布** | 自测 + 修 bug + README + 发布 Marketplace | 2 天 |
| **合计** | | **约 14 天** |

---

## 10. 附录

### 附录 A：竞品对比

| 竞品 | 定位 | 优势 | 劣势 | GitCommitAI 差异化 |
|------|------|------|------|-------------------|
| **GitHub Copilot** | 付费订阅，内置 commit 生成 | 深度集成，无需配置 | 付费 $10-19/月，模型不可选 | 免费 + BYOK + 多模型 |
| **AI Commit (Sitoi)** | 免费，BYOK，多模型 | Gitmoji、多语言、Conventional Commits | 不支持流式输出，不支持自动 commit/push | 流式输出 + 端到端自动化 + 引导体验 |
| **Commit AI Generator** | 免费，仅 OpenAI | 简单易用 | 仅 OpenAI，功能单一 | 多平台模型 + 多规范 + 自定义 |
| **Conventional Commits** | 免费，非 AI | 结构化选择，可自动 commit | 无 AI 能力 | AI 智能生成 + 上下文感知 |

### 附录 B：配置项速查表

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `provider.baseUrl` | string | `""` | AI API 地址 |
| `provider.model` | string | `""` | 模型名称 |
| `commitFormat` | enum | `conventional` | 格式规范 |
| `contentRule` | enum | `standard` | 生成规则 |
| `language` | enum | `zh-CN` | 消息语言 |
| `autoCommit` | boolean | `false` | 自动 commit |
| `autoPush` | boolean | `false` | 自动 push |
| `streaming` | boolean | `true` | 流式输出 |
| `temperature` | number | `0.3` | 生成温度 |
| `maxDiffLength` | number/string | `auto` | 最大 diff 长度 |
| `customPromptPath` | string | `""` | 自定义 prompt 路径 |
