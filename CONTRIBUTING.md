# 参与贡献

感谢你对 YouCommit 的关注！以下是本地开发环境搭建与调试指南。

## 环境要求

- **Node.js** ≥ 18
- **Yarn**
- **VS Code**
- **PostgreSQL**（仅在需要运行后端服务时）

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

# watch 模式（开发时推荐）
yarn ext:watch
```

### 3. 调试运行

项目已配置好 `.vscode/launch.json`，按 **F5** 即可启动扩展调试宿主窗口（Extension Development Host）。

调试流程：

1. F5 启动后会打开一个新的 VS Code 窗口
2. 在该窗口中打开一个 Git 仓库
3. `git add` 暂存一些改动
4. `Ctrl+Shift+P` → `YouCommit: 配置 AI 模型` 完成配置
5. 点击 SCM 标题栏的 ✨ 图标，或按 `Ctrl+Shift+G Ctrl+Shift+A` 生成 Commit Message

### 4. 常用命令

| 命令 | 说明 |
|------|------|
| `yarn ext:compile` | 单次编译 |
| `yarn ext:watch` | watch 模式编译 |
| `yarn ext:package` | 生产模式打包（minify + tree shaking） |
| `yarn lint` | ESLint 检查 |
| `yarn test` | 运行测试 |
| `yarn test:watch` | watch 模式测试 |

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

确保 PostgreSQL 中已创建对应数据库（TypeORM 会自动建表）。

### 3. 启动

```bash
# 开发模式（watch）
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

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/xxx`)
3. 提交代码 (`git commit -m 'feat: add xxx'`)
4. 推送分支 (`git push origin feat/xxx`)
5. 新建 Pull Request
