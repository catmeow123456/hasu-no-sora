#!/bin/bash

# Hasu no Sora 生产部署脚本
set -e

echo "🚀 开始生产部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印彩色消息
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Node.js 版本
check_node_version() {
    print_status "检查 Node.js 版本..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="16.0.0"
    
    # 简单的版本比较：提取主版本号
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
    REQUIRED_MAJOR=$(echo "$REQUIRED_VERSION" | cut -d'.' -f1)
    
    if [ "$NODE_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
        print_error "Node.js 版本需要 >= $REQUIRED_VERSION，当前版本: v$NODE_VERSION"
        exit 1
    fi
    
    print_success "Node.js 版本检查通过: v$NODE_VERSION"
}

# 检查 Yarn 版本
check_yarn_version() {
    print_status "检查 Yarn 版本..."
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn 未安装"
        exit 1
    fi
    
    YARN_VERSION=$(yarn -v)
    print_success "Yarn 版本: $YARN_VERSION"
}

# 清理旧构建文件
clean_build() {
    print_status "清理旧构建文件..."
    if [ -d "packages/ui/dist" ] || [ -d "packages/server/dist" ]; then
        yarn clean:dist
        print_success "清理完成"
    else
        print_status "没有找到需要清理的构建文件"
    fi
}

# 安装依赖
install_dependencies() {
    print_status "安装生产依赖..."
    yarn install --immutable
    print_success "依赖安装完成"
}

# 类型检查
type_check() {
    print_status "执行 TypeScript 类型检查..."
    
    # 检查服务器端类型
    print_status "检查服务器端类型..."
    yarn workspace @hasu/server typecheck
    
    # 检查前端类型
    print_status "检查前端类型..."
    yarn workspace @hasu/ui typecheck
    
    print_success "类型检查通过"
}

# 构建项目
build_project() {
    print_status "构建生产版本..."
    
    # 设置生产环境变量
    export NODE_ENV=production
    
    # 构建项目
    yarn build:prod
    
    print_success "构建完成"
}

# 验证构建结果
verify_build() {
    print_status "验证构建结果..."
    
    # 检查前端构建文件
    if [ ! -d "packages/ui/dist" ]; then
        print_error "前端构建失败：dist 目录不存在"
        exit 1
    fi
    
    if [ ! -f "packages/ui/dist/index.html" ]; then
        print_error "前端构建失败：index.html 不存在"
        exit 1
    fi
    
    # 检查服务器构建文件
    if [ ! -d "packages/server/dist" ]; then
        print_error "服务器构建失败：dist 目录不存在"
        exit 1
    fi
    
    if [ ! -f "packages/server/dist/index.js" ]; then
        print_error "服务器构建失败：index.js 不存在"
        exit 1
    fi
    
    # 验证服务器文件语法
    yarn workspace @hasu/server test:start
    
    print_success "构建验证通过"
}

# 显示构建统计
show_build_stats() {
    print_status "构建统计信息："
    
    # 前端构建大小
    if [ -d "packages/ui/dist" ]; then
        UI_SIZE=$(du -sh packages/ui/dist | cut -f1)
        echo "  📦 前端构建大小: $UI_SIZE"
    fi
    
    # 服务器构建大小
    if [ -d "packages/server/dist" ]; then
        SERVER_SIZE=$(du -sh packages/server/dist | cut -f1)
        echo "  🖥️  服务器构建大小: $SERVER_SIZE"
    fi
    
    # 显示主要文件
    echo "  📄 主要文件："
    if [ -f "packages/ui/dist/index.html" ]; then
        echo "    ✅ packages/ui/dist/index.html"
    fi
    if [ -f "packages/server/dist/index.js" ]; then
        echo "    ✅ packages/server/dist/index.js"
    fi
}

# 启动生产服务器（可选）
start_production() {
    if [ "$1" = "--start" ]; then
        print_status "启动生产服务器..."
        print_warning "按 Ctrl+C 停止服务器"
        yarn start:prod
    else
        print_status "使用以下命令启动生产服务器："
        echo "  yarn start:prod"
        echo "  或者"
        echo "  NODE_ENV=production PORT=3000 yarn start"
    fi
}

# 主执行流程
main() {
    echo "🎵 Hasu no Sora 音乐播放器 - 生产部署"
    echo "=================================="
    
    # 检查环境
    check_node_version
    check_yarn_version
    
    # 构建流程
    clean_build
    install_dependencies
    type_check
    build_project
    verify_build
    
    # 显示结果
    show_build_stats
    
    print_success "🎉 生产部署完成！"
    echo ""
    
    # 启动服务器（如果指定）
    start_production "$1"
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查上述输出"; exit 1' ERR

# 执行主函数
main "$@"
