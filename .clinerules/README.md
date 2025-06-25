# Hasu no Sora 音乐播放器 - 项目概览

## 🎵 项目简介

Hasu no Sora 是一个温暖阳光风格的 Web 音乐播放器，专为 Hasu no Sora 音乐专辑设计。采用 TypeScript 全栈开发，使用 Yarn Workspaces 管理 Monorepo 结构。

## 🏗️ 技术栈

### 后端 (packages/server)
- **Node.js** + **Express** + **TypeScript**
- **music-metadata** - 音频元数据解析
- **CORS** - 跨域支持
- **TSX** - TypeScript 执行器

### 前端 (packages/ui)
- **React 18** + **TypeScript**
- **Styled Components** - CSS-in-JS 样式
- **Vite** - 构建工具和开发服务器
- **React Router DOM** - 路由管理

### 开发工具
- **Yarn Workspaces** - Monorepo 管理
- **Concurrently** - 并行运行脚本

## 📁 项目结构

```
hasu-no-sora/
├── packages/
│   ├── server/              # Express 后端服务器
│   │   ├── src/
│   │   │   ├── index.ts     # 服务器入口
│   │   │   ├── types/       # 类型定义
│   │   │   └── utils/       # 工具函数 (musicScanner)
│   │   └── package.json
│   └── ui/                  # React 前端应用
│       ├── src/
│       │   ├── components/  # React 组件
│       │   ├── hooks/       # 自定义 Hooks
│       │   ├── services/    # API 服务
│       │   ├── styles/      # 样式和主题
│       │   └── types/       # 类型定义
│       └── package.json
├── music/                   # 音乐文件存储
└── package.json            # 根目录配置
```

## 🚀 开发命令

```bash
# 安装依赖
yarn install

# 开发模式 (同时启动前后端)
yarn dev

# 构建前端
yarn build

# 启动生产服务器
yarn start

# 清理构建文件
yarn clean
```

## 🌐 服务端口

- **前端开发服务器**: http://localhost:5173
- **后端 API 服务器**: http://localhost:3001

## 📡 API 接口

### 核心接口
- `GET /api/albums` - 获取专辑列表
- `GET /api/albums/:id` - 获取专辑详情
- `GET /api/images/:albumId/:filename` - 获取专辑封面
- `GET /audio/:albumName/:filename` - 获取音频文件
- `GET /api/health` - 健康检查

## 🎨 设计系统

### 色彩方案
- **主色调**: 暖橙色 (#FF8C42)
- **次要色**: 金黄色 (#FFD23F)
- **强调色**: 柔和粉色 (#FF6B9D)
- **背景色**: 奶油白 (#FFF8F0)

### 字体
- **主字体**: Inter, Noto Sans SC
- **标题字体**: Poppins, Noto Sans SC

## 🎵 音乐文件组织

音乐文件按专辑文件夹组织在 `music/` 目录下：

```
music/
├── Dream believers/
│   ├── 01 Dream Believers.mp3
│   └── ...
├── Holiday∞Holiday - Tragic Drops/
│   ├── 01 謳歌爛漫.mp3
│   ├── Folder.jpg          # 专辑封面
│   └── ...
└── Reflection In the mirror/
    └── ...
```

### 支持格式
- **音频**: `.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`
- **封面**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🔧 核心功能

1. **专辑浏览** - 网格展示所有专辑
2. **音乐播放** - 支持播放/暂停、上一首/下一首
3. **音量控制** - 可调节播放音量
4. **进度控制** - 显示播放进度，支持拖拽跳转
5. **专辑封面** - 自动识别并显示专辑封面
6. **响应式设计** - 适配不同设备屏幕

## 🎯 AI 助手工作指导

### 开发重点
- 保持 TypeScript 类型安全
- 遵循 React Hooks 最佳实践
- 使用 Styled Components 进行样式管理
- 确保前后端类型定义同步
- 维护温暖阳光的设计风格

### 常见任务
- 添加新的音乐播放功能
- 优化音频加载和播放性能
- 扩展专辑和音轨元数据支持
- 改进 UI/UX 交互体验
- 添加新的 API 接口

### 注意事项
- 音乐文件路径配置在 `packages/server/src/index.ts`
- 前端通过 Vite 代理访问后端 API
- 使用 Yarn Workspaces，注意包管理命令
- 保持设计系统的一致性
