# 参与贡献

感谢你对 YouCommit 的关注！以下是本地开发环境搭建、调试、打包与提交指南。

## 环境要求

- **Node.js** >= 18
- **Yarn**
- **VS Code**
- **PostgreSQL**：仅在需要运行后端内置服务时使用

## 扩展开发

### 1. 安装依赖

```bash
git clone https://github.com/tardis9527/you-commit.git
cd you-commit
yarn install
```

### 2. 编译

```bash
# 单次编译
yarn ext:compile

# watch 模式，开发时推荐
yarn ext:watch
```

### 3. 插件打包与 VSIX

插件发布或本地安装时，需要先生成生产构建产物，再生成 VSIX 安装包。

```bash
# 生成生产构建产物：src/extension.ts -> dist/extension.js
yarn ext:package

# 生成 VS Code 插件安装包：you-commit-x.y.z.vsix
npx vsce package
```

两条命令的区别：

- `yarn ext:package` 只负责编译和压缩扩展代码，输出到 `dist/` 目录，不会生成 `.vsix` 文件。
- `npx vsce package` 负责读取 `package.json`，收集 `dist/`、`resources/`、README、LICENSE 等文件，最终生成 `.vsix` 安装包。
- `package.json` 中配置了 `vscode:prepublish`，因此直接运行 `npx vsce package` 时通常会自动先执行 `yarn ext:package`。发布前仍建议手动按上面的两步执行，便于区分编译失败和打包失败。

生成的 `.vsix` 可用于本地安装：

```bash
code --install-extension you-commit-x.y.z.vsix
```

### 4. 发布到插件市场

发布前建议先完成生产构建和 VSIX 打包：

```bash
yarn ext:package
npx vsce package
```

#### VS Code Marketplace

首次发布前需要使用 Microsoft Marketplace 的 Personal Access Token 登录 publisher：

```bash
npx vsce login tardis9527
```

直接发布当前版本：

```bash
npx vsce publish
```

也可以发布已经生成好的 VSIX 文件：

```bash
npx vsce publish --packagePath you-commit-x.y.z.vsix
```

项目中也提供了等价脚本：

```bash
yarn ext:publish
```

#### Open VSX Registry

Open VSX 使用 `ovsx` 工具发布。推荐先设置访问令牌环境变量，再发布 VSIX 文件。

PowerShell：

```powershell
$env:OVSX_PAT="your-open-vsx-token"
npx ovsx publish you-commit-x.y.z.vsix -p $env:OVSX_PAT
```

Bash：

```bash
export OVSX_PAT="your-open-vsx-token"
npx ovsx publish you-commit-x.y.z.vsix -p "$OVSX_PAT"
```

#### 发布检查清单

发布前请确认：

- `package.json` 中的 `version` 已递增。
- `CHANGELOG.md` 已补充对应版本说明。
- `README.md` 和 `README.en.md` 内容适合插件市场展示。
- 已执行 `yarn ext:package` 并确认 `dist/extension.js` 为最新产物。
- 已执行 `npx vsce package` 并本地安装 VSIX 做过基础验证。

### 5. 调试运行

项目已配置 `.vscode/launch.json`，按 **F5** 可启动扩展调试宿主窗口（Extension Development Host）。

调试流程：

1. F5 启动后会打开一个新的 VS Code 窗口。
2. 在该窗口中打开一个 Git 仓库。
3. 使用 `git add` 暂存一些改动。
4. `Ctrl+Shift+P` -> `YouCommit: 配置 AI 模型` 完成配置。
5. 点击 SCM 标题栏的 YouCommit 图标，或按 `Ctrl+Shift+G Ctrl+Shift+A` 生成 Commit Message。

### 6. 常用命令

| 命令 | 说明 |
|------|------|
| `yarn ext:compile` | 单次编译扩展代码 |
| `yarn ext:watch` | watch 模式编译扩展代码 |
| `yarn ext:package` | 生产模式编译，生成 `dist/extension.js` |
| `npx vsce package` | 生成 VS Code 插件安装包 `.vsix` |
| `npx vsce publish` | 发布到 VS Code Marketplace |
| `npx ovsx publish you-commit-x.y.z.vsix -p <token>` | 发布到 Open VSX Registry |
| `yarn lint` | 运行 ESLint 检查 |
| `yarn test` | 运行测试 |
| `yarn test:watch` | watch 模式运行测试 |

## 后端服务开发（可选）

后端服务仅在**内置服务模式**下需要，BYOK 模式（自带 API Key）不依赖后端。

### 1. 安装依赖

```bash
yarn server:install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填写 PostgreSQL 连接信息：

```ini
SERVER_PORT=19728
DATABASE_URL=postgresql://youcommit:password@localhost:5432/youcommit
```

确保 PostgreSQL 中已创建对应数据库。当前 TypeORM 配置会自动建表。

### 3. 启动

```bash
# 开发模式，watch
yarn server:dev

# 或使用 Docker
yarn docker:up
```

服务启动后监听 `19728` 端口。

### 4. 插件对接本地后端

在 VS Code 设置中：

- 将 `youcommit.builtinServiceUrl` 改为 `http://localhost:19728`
- 将 `youcommit.serviceMode` 改为 `builtin`

## 提交流程

1. Fork 本仓库。
2. 创建功能分支：`git checkout -b feat/xxx`。
3. 提交代码：`git commit -m 'feat: add xxx'`。
4. 推送分支：`git push origin feat/xxx`。
5. 新建 Pull Request。
