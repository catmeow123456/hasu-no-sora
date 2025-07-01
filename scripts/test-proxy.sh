#!/bin/bash

echo "测试代理配置..."
echo "代理地址: 127.0.0.1:7890"
echo ""

# 测试代理连接
echo "1. 测试代理连接..."
if curl -x http://127.0.0.1:7890 --connect-timeout 5 -s https://www.google.com > /dev/null; then
    echo "✅ 代理连接正常"
else
    echo "❌ 代理连接失败，请检查代理是否运行在 127.0.0.1:7890"
    exit 1
fi

echo ""
echo "2. 测试 Yarn 仓库访问..."
if curl -x http://127.0.0.1:7890 --connect-timeout 10 -s https://repo.yarnpkg.com > /dev/null; then
    echo "✅ 可以通过代理访问 Yarn 仓库"
else
    echo "❌ 无法通过代理访问 Yarn 仓库"
    exit 1
fi

echo ""
echo "3. 测试 npm 镜像源访问..."
if curl --connect-timeout 10 -s https://registry.npmmirror.com > /dev/null; then
    echo "✅ 可以访问 npm 国内镜像源"
else
    echo "❌ 无法访问 npm 国内镜像源"
    exit 1
fi

echo ""
echo "✅ 所有网络配置测试通过！"
echo ""
echo "🚀 优化说明："
echo "- 使用 npm 替代 yarn，避免 Corepack 网络问题"
echo "- 配置国内镜像源 (registry.npmmirror.com)"
echo "- 添加代理支持 (127.0.0.1:7890)"
echo "- 优化 Docker 构建缓存"
echo ""
echo "现在可以尝试 Docker 构建："
echo "docker-compose build"
