#!/bin/bash
# Wuning-County 部署脚本
# 用法: ./deploy.sh

set -e

WEB_ROOT="/usr/share/nginx/html"
DIST_FILE="dist/index.html"

echo "📦 开始部署 Wuning-County..."

# 1. 构建
echo "🔨 构建中..."
npm run build:web

# 2. 原子替换部署（避免用户拿到截断文件）
echo "🚀 部署到 ${WEB_ROOT}..."

if [ ! -f "${DIST_FILE}" ]; then
    echo "❌ 构建产物不存在: ${DIST_FILE}"
    exit 1
fi

# 先复制到临时文件，再原子移动
install -D "${DIST_FILE}" "${WEB_ROOT}/index.html.new" && mv "${WEB_ROOT}/index.html.new" "${WEB_ROOT}/index.html"

# 3. 验证
SIZE=$(wc -c < "${WEB_ROOT}/index.html")
echo "✅ 部署完成！文件大小: ${SIZE} bytes"

# 4. 验证 HTTP 可访问
HTTP_CODE=$(curl -sI https://wuning.online | head -1)
echo "🔍 HTTP 状态: ${HTTP_CODE}"
