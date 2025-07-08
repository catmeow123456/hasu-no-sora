# 🚀 Hasu no Sora 生产模式部署指南

## 📋 概览

本文档介绍如何在生产环境中部署和运行 Hasu no Sora 音乐播放器。

## 🏗️ 生产架构

### 端口配置
- **应用服务**: `http://localhost:8080`
- **API 服务**: `http://localhost:8080/api`
- **音频文件**: `http://localhost:8080/audio`

### 服务架构
```
┌─────────────────────────────────────┐
│         Express 服务器 (8080)        │
├─────────────────────────────────────┤
│  ✅ 前端静态文件服务 (/)             │
│  ✅ API 接口服务 (/api)              │
│  ✅ 音频文件服务 (/audio)            │
│  ✅ 专辑封面服务 (/api/images)       │
└─────────────────────────────────────┘
```

## 🚀 快速部署

### 1. 自动部署（推荐）
```bash
# 完整部署流程
./scripts/deploy.sh

# 部署并启动服务器
./scripts/deploy.sh --start
```

### 2. 手动部署
```bash
# 1. 清理旧构建
yarn clean:dist

# 2. 安装依赖
yarn install

# 3. 类型检查
yarn workspace @hasu/server typecheck
yarn workspace @hasu/ui typecheck

# 4. 构建项目
yarn build:prod

# 5. 启动生产服务器
yarn start:prod
```

## 🎯 生产脚本命令

### 根目录脚本
```bash
# 构建相关
yarn build              # 标准构建
yarn build:prod         # 生产构建（优化）
yarn test:build         # 测试构建

# 启动相关
yarn start              # 启动生产服务器
yarn start:prod         # 启动生产服务器（优化）

# 预览相关
yarn preview            # 构建并预览

# 清理相关
yarn clean              # 清理所有
yarn clean:dist         # 仅清理构建文件
```

### 服务器端脚本
```bash
# 构建
yarn workspace @hasu/server build
yarn workspace @hasu/server build:prod

# 启动
yarn workspace @hasu/server start
yarn workspace @hasu/server start:prod

# 检查
yarn workspace @hasu/server typecheck
yarn workspace @hasu/server test:start
```

### 前端脚本
```bash
# 构建
yarn workspace @hasu/ui build
yarn workspace @hasu/ui build:prod
yarn workspace @hasu/ui build:analyze

# 预览
yarn workspace @hasu/ui preview
yarn workspace @hasu/ui preview:prod

# 检查
yarn workspace @hasu/ui typecheck
yarn workspace @hasu/ui test:build
```

## 🛠️ 部署脚本

### 部署脚本 (`./scripts/deploy.sh`)
```bash
# 完整部署流程
./scripts/deploy.sh

# 部署并启动
./scripts/deploy.sh --start

# 查看帮助
./scripts/deploy.sh --help
```

**功能特性:**
- ✅ 环境检查（Node.js、Yarn 版本）
- ✅ 依赖安装
- ✅ TypeScript 类型检查
- ✅ 生产构建
- ✅ 构建验证
- ✅ 构建统计
- ✅ 可选启动服务器

### 启动脚本 (`./scripts/start-production.sh`)
```bash
# 启动生产服务器
./scripts/start-production.sh

# 仅检查环境
./scripts/start-production.sh --check-only

# 查看帮助
./scripts/start-production.sh --help
```

**功能特性:**
- ✅ 构建文件检查
- ✅ 音乐目录检查
- ✅ 环境验证
- ✅ 生产服务器启动

## ⚙️ 生产优化配置

### Vite 构建优化
- **代码分割**: 按库分离 vendor、router、styled chunks
- **压缩优化**: Terser 压缩，移除 console 和 debugger
- **缓存优化**: 文件名哈希，长期缓存
- **性能优化**: ES2020 目标，CSS 代码分割

### Express 服务器优化
- **静态文件缓存**: 1小时缓存
- **音频文件缓存**: 1天缓存
- **API 响应缓存**: 5-10分钟内存缓存
- **GZIP 压缩**: 自动压缩响应

### TypeScript 编译优化
- **增量编译**: `--build` 模式
- **详细输出**: `--verbose` 模式
- **内存限制**: Node.js 512MB 内存限制

## 🔧 环境变量配置

### 生产环境变量 (`.env.production`)
```bash
# 基础配置
NODE_ENV=production
PORT=8080

# API 配置
API_BASE_URL=http://localhost:8080
MUSIC_PATH=./music

# 性能优化
ENABLE_GZIP=true
ENABLE_CACHE=true
CACHE_DURATION=300000

# 安全配置
CORS_ORIGIN=http://localhost:8080
TRUST_PROXY=false

# 日志配置
LOG_LEVEL=info
ENABLE_ACCESS_LOG=true
```

## 📁 构建输出结构

```
packages/
├── server/dist/           # 服务器构建输出
│   ├── index.js          # 服务器入口文件
│   ├── types/            # 类型定义
│   └── utils/            # 工具函数
└── ui/dist/              # 前端构建输出
    ├── index.html        # 入口 HTML
    ├── assets/           # 静态资源
    │   ├── js/          # JavaScript 文件
    │   ├── css/         # CSS 文件
    │   └── [ext]/       # 其他资源文件
    └── ...
```

## 🎵 音乐文件管理

### 目录结构
```
music/
├── Album Name 1/
│   ├── 01 Track Name.mp3
│   ├── 02 Track Name.mp3
│   ├── Folder.jpg        # 专辑封面
│   └── ...
├── Album Name 2/
│   └── ...
└── ...
```

### 支持格式
- **音频**: `.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`
- **封面**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🚨 故障排除

### 常见问题

**1. 构建失败**
```bash
# 检查 Node.js 版本
node -v  # 需要 >= 16.0.0

# 检查 Yarn 版本
yarn -v  # 需要 >= 1.22.0

# 清理并重新安装
yarn clean
yarn install
```

**2. 服务器启动失败**
```bash
# 检查端口占用
lsof -i :8080

# 检查构建文件
ls -la packages/server/dist/
ls -la packages/ui/dist/

# 验证服务器文件
node --check packages/server/dist/index.js
```

**3. 音乐文件无法播放**
```bash
# 检查音乐目录
ls -la music/

# 检查文件权限
chmod -R 755 music/

# 检查文件格式
file music/*/*.mp3
```

### 性能监控

**构建性能**
```bash
# 分析构建大小
yarn workspace @hasu/ui build:analyze

# 检查构建时间
time yarn build:prod
```

**运行时性能**
```bash
# 内存使用监控
ps aux | grep node

# 网络请求监控
curl -w "@curl-format.txt" http://localhost:8080/api/health
```

## 📊 生产部署检查清单

### 部署前检查
- [ ] Node.js >= 16.0.0
- [ ] Yarn >= 1.22.0
- [ ] 音乐文件已放置在 `music/` 目录
- [ ] 环境变量配置正确

### 构建检查
- [ ] TypeScript 编译无错误
- [ ] 前端构建成功 (`packages/ui/dist/`)
- [ ] 服务器构建成功 (`packages/server/dist/`)
- [ ] 构建文件语法验证通过

### 运行时检查
- [ ] 服务器成功启动在端口 8080
- [ ] 前端页面可正常访问
- [ ] API 接口响应正常
- [ ] 音频文件可正常播放
- [ ] 专辑封面正常显示

### 性能检查
- [ ] 页面加载时间 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 音频文件加载正常
- [ ] 内存使用合理 (< 512MB)

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新部署
./scripts/deploy.sh

# 3. 重启服务器
./scripts/start-production.sh
```

## 📞 技术支持

如遇到部署问题，请检查：
1. 系统要求是否满足
2. 构建日志中的错误信息
3. 服务器启动日志
4. 网络和端口配置

---

🎵 **Hasu no Sora 音乐播放器** - 温暖阳光的音乐体验
