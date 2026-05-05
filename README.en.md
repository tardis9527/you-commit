# YouCommit 🍊✨

> AI-powered Git Commit Message generator. Built-in AI service ready to use, or BYOK. Multi-format, fully customizable.

[中文文档](./README.md)

---

## Features

- **⚡ Built-in AI Service** — No API Key needed, purchase a license key and start using immediately
- **🔑 BYOK Mode** — Bring your own API Key, supports OpenAI / DeepSeek / Qwen / any compatible platform
- **🤖 AI Generation** — Analyze staged diffs and generate standardized commit messages in one click
- **🌊 Streaming Output** — Watch the message appear character by character in the SCM input box
- ** Multiple Formats** — Conventional Commits / Gitmoji / Simple / Detailed / Custom
- **🌍 Bilingual** — Chinese (zh-CN) / English (en-US)
- **⚡ Automation** — Optional auto commit + auto push
- **🔐 Secure Storage** — API Keys and license keys stored via VS Code SecretStorage
- **🎨 Custom Prompts** — Use `.md` / `.txt` templates for full control over generation logic

## Quick Start

### Installation

1. Search for **YouCommit** in the VS Code Extensions Marketplace
2. Or install from a `.vsix` file via Command Palette → `Extensions: Install from VSIX...`

### Configuration

A setup wizard appears automatically on first install. You can also run it manually:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type `YouCommit: 配置 AI 模型`
3. Choose your mode:

#### ⚡ Built-in Service (Recommended for beginners)

- Select "⚡ 内置服务" → Purchase or enter a license key → Ready to go
- Status bar shows remaining quota in real time

#### 🔑 BYOK (Bring Your Own Key)

- Select a platform → Enter API Key → Choose model → Auto-verify connection

### Usage

1. Stage your changes with `git add`
2. Click the ✨ icon in the Source Control title bar, or press `Ctrl+Shift+G Ctrl+Shift+A`
3. Input box shows "✨ Generating..." then AI fills in the commit message

## Supported Platforms (BYOK Mode)

| Platform | Base URL | Recommended Models |
|----------|----------|-------------------|
| **OpenAI** | `https://api.openai.com/v1` | gpt-4o / gpt-4o-mini |
| **DeepSeek** | `https://api.deepseek.com/v1` | deepseek-chat |
| **Qwen** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | qwen-plus / qwen-turbo |
| **Xiaomi MiLM** | `https://api.milm.xiaomi.com/v1` | — |
| **Custom** | Any OpenAI-compatible API URL | — |

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `youcommit.serviceMode` | Service mode: `byok` / `builtin` | `byok` |
| `youcommit.builtinServiceUrl` | Built-in service URL (no need to change) | `https://youcommit.ai-you.top` |
| `youcommit.provider.baseUrl` | AI API endpoint (BYOK mode) | — |
| `youcommit.provider.model` | Model name (BYOK mode) | — |
| `youcommit.commitFormat` | Format: `conventional` / `gitmoji` / `simple` / `detailed` / `custom` | `conventional` |
| `youcommit.contentRule` | Content rule: `standard` / `brief` / `verbose` / `custom` | `standard` |
| `youcommit.language` | Output language: `zh-CN` / `en-US` | `zh-CN` |
| `youcommit.customPromptPath` | Custom prompt template path | — |
| `youcommit.autoCommit` | Auto commit after generation | `false` |
| `youcommit.autoPush` | Auto push after commit | `false` |
| `youcommit.streaming` | Streaming output | `true` |
| `youcommit.temperature` | Generation temperature (0-2) | `0.3` |
| `youcommit.maxDiffLength` | Max diff characters | `8000` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+G Ctrl+Shift+A` | Generate Commit Message |

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feat/xxx`)
3. Commit your changes (`git commit -m 'feat: add xxx'`)
4. Push the branch (`git push origin feat/xxx`)
5. Create a Pull Request

## License

[MIT](./LICENSE)
