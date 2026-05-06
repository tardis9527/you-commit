#!/bin/bash
set -e

# ============================================
# YouCommit Server - 一键更新构建部署脚本
# 用法: bash scripts/deploy.sh
# ============================================

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_NAME="api"

echo "=========================================="
echo " YouCommit Server 部署"
echo "=========================================="
echo "项目目录: $PROJECT_DIR"
echo ""

# 1. 拉取最新代码
echo "[1/5] 拉取最新代码..."
cd "$PROJECT_DIR"
git pull

# 2. 安装后端依赖
echo "[2/5] 安装后端依赖..."
cd "$PROJECT_DIR/server"
yarn install --frozen-lockfile

# 3. 构建 Docker 镜像
echo "[3/5] 构建 Docker 镜像..."
cd "$PROJECT_DIR"
docker compose build --no-cache "$SERVICE_NAME"

# 4. 停止旧容器并启动新容器
echo "[4/5] 重启容器..."
docker compose up -d "$SERVICE_NAME"

# 5. 清理旧镜像
echo "[5/5] 清理旧镜像..."
docker image prune -f

echo ""
echo "=========================================="
echo " 部署完成！"
echo "=========================================="

# 显示容器状态
docker compose ps "$SERVICE_NAME"

# 显示最近日志
echo ""
echo "最近日志:"
docker compose logs --tail=20 "$SERVICE_NAME"
