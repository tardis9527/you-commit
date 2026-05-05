# YouCommit - 柚提 🍊✨

> AI 驱动的 Git Commit Message 生成器。内置 AI 服务开箱即用，也支持自带 API Key，多种格式、高度可定制。

---

## 功能特性

- **⚡ 内置 AI 服务** — 无需 API Key，购买密钥即用，开箱即用
- **🔑 AI模型渠道** — 自带 API Key，支持 OpenAI / DeepSeek / 通义千问 / 任意兼容平台
- **🤖 AI 智能生成** — 分析暂存区 diff，一键生成规范的 Commit Message
- **🌊 流式输出** — 生成内容实时逐字填入 SCM 输入框
- ** 多种提交格式** — Conventional Commits / Gitmoji / 简洁 / 详细 / 自定义
- **🌍 双语输出** — 中文 (zh-CN) / English (en-US)
- **⚡ 自动化** — 可选自动 commit + 自动 push
- **🔐 安全存储** — API Key / 密钥均使用 VS Code SecretStorage，不写入配置文件
- **🎨 自定义 Prompt** — 支持 `.md` / `.txt` 模板，完全控制生成逻辑

## 快速开始

### 安装

1. 在 VS Code 扩展商店搜索 **YouCommit** 安装
2. 或下载 `.vsix` 文件，通过命令面板 `Extensions: Install from VSIX...` 安装

### 配置

首次安装后会自动弹出配置向导，也可以手动执行：

1. 打开命令面板（`Ctrl+Shift+P`）
2. 输入 `YouCommit: 配置 AI 模型`
3. 选择使用方式：

#### ⚡ 内置服务（推荐新手）

无需配置 API Key，购买密钥即可立即使用，适合不想折腾的用户。

**第一步：购买密钥**

前往 [购买额度](https://pay.ldxp.cn/shop/FRW82VJ7) 下单，支付后会收到一个 `YC-` 开头的服务密钥（如 `YC-xxxxxxxxxxxx`）。不同档位次数越多越优惠，额度可叠加购买。

**第二步：切换服务模式**

- 打开命令面板 → `YouCommit: 配置 AI 模型` → 选择 **「⚡ 内置服务（无需 API Key，购买密钥即用）」**
- 或在设置中将 `youcommit.serviceMode` 改为 `builtin`

**第三步：输入密钥激活**

- 在上一步弹出的操作提示中点击 **「输入密钥」**
- 或打开命令面板 → `YouCommit: 输入服务密钥`
- 粘贴你的 `YC-` 密钥，回车即可激活

激活成功后会提示剩余次数，状态栏也会实时显示 `YC: 剩余 xxx 次`。

**查询剩余次数**

- 点击状态栏的 `YC: 剩余 xxx 次` 即可刷新
- 或打开命令面板 → `YouCommit: 查询剩余次数`
- 也可在设置页 `youcommit.serviceMode` 旁的快捷链接中点击「📊 查询剩余次数」

> **注意：** 密钥首次激活时会绑定当前设备，同一密钥不可在其他设备使用。如需在多台设备使用，请分别购买。多次购买的额度会自动叠加到同一设备。

#### 🔑 AI模型渠道（自带密钥）

适合已有 AI 平台账号的用户，支持 OpenAI / DeepSeek / 通义千问等兼容平台。

1. 打开命令面板 → `YouCommit: 配置 AI 模型`
2. 选择 AI 平台（如 DeepSeek）→ 输入你的 API Key → 选择模型
3. 自动验证连接，成功后即可使用

**更换 API Key**

- 在设置页 `youcommit.provider.baseUrl` 下方点击「🔑 更换 API Key」
- 或打开命令面板 → `YouCommit: 设置 API Key`

### 使用

1. 使用 `git add` 暂存你的代码改动
2. 点击源代码管理标题栏的 ✨ 图标，或按快捷键 `Ctrl+Shift+G Ctrl+Shift+A`
3. 输入框显示「✨ 正在生成中...」，随后 AI 逐字填入 Commit Message

### 常用命令一览

| 命令 | 说明 |
|------|------|
| `YouCommit: 配置 AI 模型` | 切换服务模式 / 配置 AI 平台 |
| `YouCommit: 输入服务密钥` | 输入并激活 `YC-` 密钥（内置服务） |
| `YouCommit: 查询剩余次数` | 查询内置服务剩余额度 |
| `YouCommit: 购买额度` | 打开购买页面 |
| `YouCommit: 设置 API Key` | 更换 AI模型渠道的 API Key |
| `YouCommit: 打开设置` | 打开扩展设置页 |

## 支持的平台（AI模型渠道）

| 平台 | Base URL | 推荐模型 |
|------|----------|---------|
| **OpenAI** | `https://api.openai.com/v1` | gpt-4o / gpt-4o-mini |
| **DeepSeek** | `https://api.deepseek.com/v1` | deepseek-chat |
| **通义千问** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | qwen-plus / qwen-turbo |
| **小米 MiLM** | `https://api.milm.xiaomi.com/v1` | — |
| **自定义** | 任意兼容 OpenAI 的 API 地址 | — |

## 配置项

| 配置 | 说明 | 默认值 |
|------|------|--------|
| `youcommit.serviceMode` | 服务模式：AI模型渠道（自带密钥） / 内置服务 | AI模型渠道 |
| `youcommit.builtinServiceUrl` | 内置服务地址（一般无需修改） | `https://youcommit.ai-you.top` |
| `youcommit.provider.baseUrl` | AI API 地址（AI模型渠道模式） | — |
| `youcommit.provider.model` | 模型名称 | — |
| `youcommit.commitFormat` | 提交格式：约定式提交 / Gitmoji 表情 / 简洁模式 / 详细模式 / 自定义模板 | 约定式提交 |
| `youcommit.contentRule` | 内容规则：标准 / 精简 / 详尽 / 自定义 | 标准 |
| `youcommit.language` | 输出语言：中文 / English | 中文 |
| `youcommit.customPromptPath` | 自定义 Prompt 模板路径 | — |
| `youcommit.autoCommit` | 生成后自动 commit | `false` |
| `youcommit.autoPush` | commit 后自动 push | `false` |
| `youcommit.streaming` | 流式输出 | `true` |
| `youcommit.temperature` | 生成温度 (0-2) | `0.3` |
| `youcommit.maxDiffLength` | 最大 diff 字符数 | `8000` |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+G Ctrl+Shift+A` | 生成 Commit Message |

## 参与贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/xxx`)
3. 提交代码 (`git commit -m 'feat: add xxx'`)
4. 推送分支 (`git push origin feat/xxx`)
5. 新建 Pull Request

## 开源协议

MIT
