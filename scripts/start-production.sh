#!/bin/bash

# Hasu no Sora 生产模式启动脚本
set -e

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

# 检查构建文件是否存在
check_build_files() {
    print_status "检查构建文件..."
    
    if [ ! -d "packages/ui/dist" ] || [ ! -f "packages/ui/dist/index.html" ]; then
        print_error "前端构建文件不存在，请先运行构建："
        echo "  yarn build"
        echo "  或者"
        echo "  ./scripts/deploy.sh"
        exit 1
    fi
    
    if [ ! -d "packages/server/dist" ] || [ ! -f "packages/server/dist/index.js" ]; then
        print_error "服务器构建文件不存在，请先运行构建："
        echo "  yarn build"
        echo "  或者"
        echo "  ./scripts/deploy.sh"
        exit 1
    fi
    
    print_success "构建文件检查通过"
}

# 检查音乐目录
check_music_directory() {
    print_status "检查音乐目录..."
    
    if [ ! -d "music" ]; then
        print_warning "音乐目录 'music' 不存在，将创建空目录"
        mkdir -p music
    fi
    
    MUSIC_COUNT=$(find music -name "*.mp3" -o -name "*.wav" -o -name "*.flac" -o -name "*.m4a" -o -name "*.ogg" | wc -l)
    if [ "$MUSIC_COUNT" -eq 0 ]; then
        print_warning "音乐目录中没有找到音频文件"
        echo "  请将音乐文件放入 music/ 目录中"
    else
        print_success "找到 $MUSIC_COUNT 个音频文件"
    fi
}

# 启动服务器
start_server() {
    print_status "启动生产服务器..."
    echo ""
    echo "🎵 Hasu no Sora 音乐播放器"
    echo "=========================="
    echo "🌐 应用地址: http://localhost:3000"
    echo "📡 API 服务: http://localhost:3000/api"
    echo ""
    print_warning "按 Ctrl+C 停止服务器"
    echo ""
    
    # 设置生产环境变量
    export NODE_ENV=production
    export PORT=3000
    
    # 启动后端服务器（静态文件服务）
    yarn workspace @hasu/server start:prod
}

# 显示帮助信息
show_help() {
    echo "🎵 Hasu no Sora 生产模式启动脚本"
    echo ""
    echo "用法:"
    echo "  ./scripts/start-production.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  --check-only   仅检查环境，不启动服务器"
    echo ""
    echo "示例:"
    echo "  ./scripts/start-production.sh          # 启动生产服务器"
    echo "  ./scripts/start-production.sh --check-only  # 仅检查环境"
    echo ""
    echo "注意:"
    echo "  - 请确保已经运行过构建命令: yarn build 或 ./scripts/deploy.sh"
    echo "  - 服务器运行在端口 3000，同时提供前端和 API 服务"
    echo "  - 访问 http://localhost:3000 即可使用应用"
}

# 主执行流程
main() {
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        --check-only)
            print_status "仅执行环境检查..."
            check_build_files
            check_music_directory
            print_success "环境检查完成"
            exit 0
            ;;
        "")
            # 正常启动流程
            check_build_files
            check_music_directory
            start_server
            ;;
        *)
            print_error "未知选项: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
}

# 错误处理
trap 'print_error "启动过程中发生错误"; exit 1' ERR

# 执行主函数
main "$@"
