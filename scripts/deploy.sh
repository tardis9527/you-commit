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
echo "[1/4] 拉取最新代码..."
cd "$PROJECT_DIR"
git pull

# 2. 构建 Docker 镜像（依赖安装与构建均在镜像内完成）
echo "[2/4] 构建 Docker 镜像..."
docker compose build --no-cache "$SERVICE_NAME"

# 3. 停止旧容器并启动新容器
echo "[3/4] 重启容器..."
docker compose up -d "$SERVICE_NAME"

# 4. 清理旧镜像
echo "[4/4] 清理旧镜像..."
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
