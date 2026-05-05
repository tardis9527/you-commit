# 产品简报：GitCommitAI

## 1. 产品定位

- **一句话描述**：一款 VSCode 插件，让个人开发者通过自带 AI 模型（BYOK），在 Source Control 面板一键生成高质量 git commit message，支持多种格式规范和自定义 prompt，可选自动 commit/push
- **目标市场**：个人开发者 / 独立开发者，日常使用 VSCode + Git 工作流
- **核心价值主张**：
  - **免费 + BYOK**：插件免费，用户自配 AI 模型（BaseUrl + ApiKey + Model），零订阅成本
  - **灵活可控**：多种格式规范、多种生成规则、自定义 prompt，适配不同风格
  - **端到端提效**：从 diff 分析 → 生成 message → 可选自动 commit/push，全程不离开 Source Control 面板
  - **开箱即用**：预置常用默认配置，首次使用仅需引导配置 AI 模型

---

## 2. 用户角色

### 角色：个人开发者（高频提交型）

- **是谁**：独立开发者 / 全栈开发者，日常在 VSCode 中开发
- **典型画像**：熟悉 Git 工作流，遵循 Git Flow 规范（分支管理 + commit message 规范），技术熟练度高，习惯使用 Source Control 面板操作
- **核心任务**：每次代码改动后快速生成规范的 commit message 并提交
- **使用频率**：每天数十次 commit，以小改动为主，偶尔有大模块改动
- **当前方案**：Source Control 面板手动输入 commit message
- **最大痛点**：
  - 高频手写 message 重复劳动，小改动时"写什么好"的心智负担
  - 大改动时难以快速组织清晰的 commit 描述
  - 想保持规范（Git Flow / Conventional Commits）但手写容易偷懒或格式不一致
- **AI 模型环境**：持有阿里、小米等国内平台 Token Plan，需要插件支持兼容 OpenAI 格式的自定义 BaseUrl 接入
- **成功标准**：
  - 小改动：点一下按钮，message 直接可用，几乎不用编辑
  - 大改动：AI 给出高质量 message 草稿，微调后提交
  - 全程不离开 Source Control 面板

---

## 3. MVP 功能清单（一期必做）

| 序号 | 功能 | 用户故事 | 为什么是 MVP |
|------|------|---------|------------|
| 1 | **BYOK 模型配置 + 首次引导** | 作为开发者，我安装插件后被引导完成 AI 模型配置（BaseUrl + ApiKey + Model），以便立即可用 | 没有这个，整个插件不可用 |
| 2 | **默认配置预置** | 作为开发者，我配完 Key 就能直接生成，不需要再调任何设置 | 降低上手门槛，核心体验保障 |
| 3 | **高级配置入口** | 作为开发者，我点击配置按钮（⚙️）可以修改格式规范、prompt、自动化行为等 | 满足个性化需求 |
| 4 | **一键生成 commit message** | 作为开发者，我在 Source Control 面板点击专属图标按钮，AI 基于 git diff 生成 message 并流式填入输入框 | 核心功能 |
| 5 | **多格式规范选择** | 作为开发者，我可以选择 Conventional Commits / Gitmoji / 简洁 / 详细等不同格式 | 用户核心需求 |
| 6 | **多内容生成规则** | 作为开发者，我可以选择不同的 prompt 策略来控制生成风格 | 用户核心需求 |
| 7 | **自定义 prompt 模板** | 作为开发者，我可以编写自己的 prompt 来完全控制生成逻辑 | 高级用户核心需求，差异化功能 |
| 8 | **分支名上下文感知** | 作为开发者，AI 能根据我当前分支名（如 `feature/login`）自动推断 commit 类型 | 成本极低但质量提升明显 |
| 9 | **生成后可编辑** | 作为开发者，生成的 message 填入输入框后我可以修改再提交 | 保证用户控制权 |
| 10 | **可选自动 commit/push** | 作为开发者，我可以配置生成后是否自动执行 git commit 和/或 git push | 高频用户提效关键 |
| 11 | **多语言消息** | 作为开发者，我可以选择生成中文或英文 commit message | 国内开发者基本需求 |
| 12 | **大 diff 智能截断** | 作为开发者，大量改动时 AI 仍能生成有意义的 message 而非报错 | 不做则大改动场景完全失效 |

### 二期规划

| 序号 | 功能 | 说明 |
|------|------|------|
| B1 | **改动摘要（Change Summary）** | commit 前可选生成轻量改动摘要，帮助确认 AI 理解了什么 |
| B2 | **多候选消息** | 一次生成 2-3 条候选 message 供选择 |
| B3 | **多模型配置快速切换** | 保存多套模型配置，一键切换 |
| B4 | **历史 prompt 模板管理** | 收藏/管理常用 prompt 模板 |

---

## 4. 核心用户旅程

### 旅程一：首次使用（安装 → 配置 → 首次生成）

角色：个人开发者
目标：安装插件后完成配置并成功生成第一条 commit message

步骤：
1. 用户 → 在 VSCode 扩展市场搜索并安装 GitCommitAI
2. 系统 → 检测到首次安装，弹出引导面板
3. 系统 → 引导步骤①：输入 BaseUrl（预填常见平台地址供选择，如阿里百炼、小米等）
4. 用户 → 填入 BaseUrl 或从下拉选择平台
5. 系统 → 引导步骤②：输入 ApiKey
6. 用户 → 粘贴 ApiKey
7. 系统 → 引导步骤③：输入或选择 Model 名称
8. 用户 → 填入 Model
9. 系统 → 验证连通性（发一个测试请求）
10. 系统 → ✅ 验证通过，提示"配置完成，可以开始使用" / ❌ 验证失败，提示具体错误，允许修改重试
11. 用户 → 回到 Source Control 面板，暂存改动
12. 用户 → 点击 GitCommitAI 专属图标按钮
13. 系统 → 流式生成 commit message，逐字填入输入框
14. 用户 → 确认或编辑后提交
15. ✅ 首次使用完成

异常分支：
- 步骤9验证失败 → 显示错误原因（Key 无效 / URL 不通 / 模型不存在），停留在引导页
- 步骤11无暂存改动 → 提示"请先暂存文件（git add）"
- 用户关闭引导 → 下次点击 AI Commit 按钮时重新触发引导

### 旅程二：日常使用（高频场景）

角色：个人开发者
目标：代码改动后快速生成 message 并提交

步骤：
1. 用户 → 在 VSCode 中完成代码修改
2. 用户 → 在 Source Control 面板暂存改动
3. 用户 → 点击 GitCommitAI 专属图标按钮（输入框旁或标题栏均可）
4. 系统 → 读取 git diff（已暂存内容）
5. 系统 → 读取当前分支名（如 `feature/login`）
6. 系统 → 根据当前格式规范 + 生成规则 + 分支上下文，组装 prompt
7. 系统 → 调用 AI 模型，流式输出逐字填入 SCM 输入框
8a. 【手动模式（默认）】用户 → 查看/编辑 message → 手动点击 ✓ 提交
8b. 【自动 commit 模式】系统 → 自动执行 git commit
8c. 【自动 commit+push 模式】系统 → 自动执行 git commit && git push
9. ✅ 提交完成

异常分支：
- 无暂存改动 → 提示"请先暂存文件"
- AI 调用失败 → 显示错误（网络 / Key 过期 / 余额不足），输入框保持空
- diff 过大 → 智能截断后发送，正常生成
- push 失败 → 提示远程冲突，commit 已完成但 push 需手动处理

### 旅程三：切换配置

角色：个人开发者
目标：修改生成规则或模型配置

步骤：
1. 用户 → 点击 Source Control 面板上的配置按钮（⚙️ 图标）
2. 系统 → 打开插件设置面板
3. 用户 → 修改所需配置项（格式规范 / prompt 模板 / 语言 / 自动 commit-push 开关 / AI 模型）
4. 系统 → 实时保存配置
5. 用户 → 返回 Source Control，下次生成即用新配置
6. ✅ 配置切换完成

异常分支：
- 修改 AI 模型配置后 → 自动触发连通性验证
- 自定义 prompt 格式错误 → 提示模板语法要求

---

## 5. 可行性评估与技术约束

### 技术栈

| 项目 | 选型 |
|------|------|
| 开发语言 | TypeScript |
| 插件框架 | VSCode Extension API |
| AI 调用 | HTTP 直接请求 OpenAI 兼容接口（fetch/axios），支持 SSE 流式 |
| 配置存储 | VSCode Settings（`contributes.configuration`） |
| Prompt 模板 | 内置模板打包在插件 + 用户自定义模板存储在 `.vscode/` 或全局配置目录 |

### 功能可行性

| 功能 | 可行性 | 潜在风险 | 建议 |
|------|--------|---------|------|
| BYOK 模型配置 | ✅ 常规实现 | 国内平台 API 兼容性差异 | 采用 OpenAI 兼容接口标准，首次做连通性验证 |
| 首次引导流程 | ✅ 常规实现 | 无 | 一期用 QuickPick/InputBox 多步向导，轻量实现 |
| 一键生成 commit message | ✅ 常规实现 | 无 | VSCode Git Extension API + SCM inputBox |
| 流式输出到输入框 | ⚠️ 有挑战 | SCM inputBox 高频更新可能卡顿 | 先尝试直接更新 `scm.inputBox.value`；性能不佳则降级为分段刷新 |
| 多格式规范 + 多生成规则 | ✅ 常规实现 | 无 | 内置 4-5 套预设模板 |
| 自定义 prompt 模板 | ✅ 常规实现 | 用户 prompt 质量参差 | 提供模板变量文档（`{{diff}}`、`{{branch}}`、`{{language}}`） |
| 分支名上下文感知 | ✅ 常规实现 | 分支命名不规范时无效 | 正则匹配常见模式，匹配不到则忽略 |
| 可选自动 commit/push | ✅ 常规实现 | push 失败需良好错误处理 | commit 保留不回滚，push 失败明确提示 |
| 大 diff 智能截断 | ⚠️ 有挑战 | 截断策略影响生成质量 | 优先发送文件变更统计 + 关键文件 diff；根据模型 context window 动态调整 |
| 专属图标 + 双位置按钮 | ✅ 常规实现 | 需设计 SVG 图标（深/浅主题各一套） | SCM title menu + SCM inputBox button 两个注册点 |

### 关键风险

| 风险等级 | 说明 |
|---------|------|
| 🟢 低风险 | 整体技术栈成熟，VSCode 插件生态完善，核心功能实现路径清晰 |
| 🟡 中风险 | 流式输出到 SCM 输入框的性能表现，需早期技术验证（prototype spike） |

---

## 6. 明确排除项（Not Doing）

- ❌ 不做团队协作 / 规范同步
- ❌ 不做重型 code review（逐行审查 / 质量评分 / 安全扫描）
- ❌ 不做 PR 描述生成
- ❌ 不做 Gitee / GitHub 等平台集成
- ❌ 不做付费功能 / 内置 AI 模型（用户自带 Key）

---

## 7. 开放问题

- [ ] 流式输出到 SCM inputBox 的性能验证——需要尽早做 prototype spike
- [ ] 专属图标设计——需准备深色/浅色主题两套 SVG
- [ ] 内置预设模板的具体内容——需要定义 4-5 套格式规范的 prompt 文本
- [ ] 大 diff 截断阈值——不同模型 context window 不同，是否需要用户可配置
- [ ] 插件名称确认——GitCommitAI 还是其他名称
- [ ] 发布平台——VSCode Marketplace 还是同时发布到 Open VSX

---

## 8. 下一步行动

- [ ] 基于本简报编写完整 PRD
- [ ] 确认技术选型并搭建项目脚手架（`yo code` 初始化 VSCode 插件项目）
- [ ] 流式输出到 SCM inputBox 的 prototype spike
- [ ] 设计专属图标（深色/浅色主题）
- [ ] 编写内置 prompt 模板（Conventional Commits / Gitmoji / 简洁 / 详细）
- [ ] 实现核心功能 MVP
- [ ] 内部测试（作者自用）
- [ ] 发布到 VSCode Marketplace

---

## 竞品参考

| 竞品 | 定位 | 优势 | 劣势 | GitCommitAI 差异化 |
|------|------|------|------|-------------------|
| **GitHub Copilot** | 付费订阅，内置 commit 生成 | 深度集成，无需配置 | 付费 $10-19/月，模型不可选 | 免费 + BYOK + 多模型 |
| **AI Commit (Sitoi)** | 免费，BYOK，多模型 | 支持 Gitmoji、多语言、Conventional Commits | 不支持流式输出，不支持自动 commit/push，无首次引导 | 流式输出 + 端到端自动化 + 引导体验 + 自定义 prompt |
| **Commit AI Generator** | 免费，仅 OpenAI | 简单易用 | 仅 OpenAI，功能单一 | 多平台模型 + 多规范 + 自定义 |
| **Conventional Commits** | 免费，非 AI | 结构化选择，可自动 commit | 无 AI 能力，纯手动 | AI 智能生成 + 上下文感知 |
