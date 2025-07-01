# 🌸 Hasu no Sora 音乐播放器

一个温暖阳光风格的 Web 音乐播放器，专为 Hasu no Sora 音乐专辑设计。

## ✨ 特性

- 🎵 **专辑浏览**: 美观的专辑网格展示
- 🎶 **音乐播放**: 支持播放/暂停、上一首/下一首
- 🎨 **温暖设计**: 采用暖橙色、金黄色的阳光色彩方案
- 📱 **响应式**: 适配不同设备屏幕
- 🔊 **音量控制**: 可调节播放音量
- ⏱️ **进度控制**: 显示播放进度，支持拖拽跳转
- 🖼️ **专辑封面**: 自动识别并显示专辑封面图片

## 🏗️ 项目结构

```
hasu-no-sora-player/
├── packages/
│   ├── server/          # 后端 Express 服务器
│   │   ├── src/
│   │   │   ├── index.ts        # 服务器入口
│   │   │   ├── types/          # 类型定义
│   │   │   └── utils/          # 工具函数
│   │   └── package.json
│   └── ui/              # 前端 React 应用
│       ├── src/
│       │   ├── components/     # React 组件
│       │   ├── hooks/          # 自定义 Hooks
│       │   ├── services/       # API 服务
│       │   ├── styles/         # 样式和主题
│       │   └── types/          # 类型定义
│       └── package.json
└── package.json         # 根目录配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- Yarn >= 1.22.0

### 安装依赖

```bash
yarn install
```

### 开发模式

启动开发服务器（同时启动前端和后端）：

```bash
yarn dev
```

- 前端开发服务器: http://localhost:3000
- 后端 API 服务器: http://localhost:3000

### 生产构建

```bash
yarn build
```

### 启动生产服务器

```bash
yarn start
```

## 📁 音乐文件组织

将你的音乐文件按以下结构组织在项目的 `music` 文件夹中：

```
hasu-no-sora-player/
├── music/                      # 音乐文件夹
│   ├── Dream believers/
│   │   ├── 01 Dream Believers.mp3
│   │   ├── 02 On your mark.mp3
│   │   └── ...
│   ├── Holiday∞Holiday - Tragic Drops/
│   │   ├── 01 謳歌爛漫.mp3
│   │   ├── 02 スケイプゴート.mp3
│   │   ├── Folder.jpg          # 专辑封面
│   │   └── ...
│   └── Reflection In the mirror/
│       ├── 01 Reflection in the mirror.mp3
│       └── ...
├── packages/
└── ...
```

### 支持的文件格式

**音频文件**: `.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`
**封面图片**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🎨 设计系统

### 色彩方案
- **主色调**: 暖橙色 (#FF8C42)
- **次要色**: 金黄色 (#FFD23F)
- **强调色**: 柔和粉色 (#FF6B9D)
- **背景色**: 奶油白 (#FFF8F0)

### 字体
- **主字体**: Inter, Noto Sans SC
- **标题字体**: Poppins, Noto Sans SC

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express** + **TypeScript**
- **music-metadata** - 音频元数据解析
- **CORS** - 跨域支持

### 前端
- **React 18** + **TypeScript**
- **Styled Components** - CSS-in-JS 样式
- **Vite** - 构建工具
- **Custom Hooks** - 音频播放逻辑

### 开发工具
- **Yarn Workspaces** - Monorepo 管理
- **TSX** - TypeScript 执行器
- **Concurrently** - 并行运行脚本

## 📝 API 接口

### 获取专辑列表
```
GET /api/albums
```

### 获取专辑详情
```
GET /api/albums/:id
```

### 获取音频文件
```
GET /audio/:albumName/:filename
```

### 获取专辑封面
```
GET /api/images/:albumId/:filename
```

### 健康检查
```
GET /api/health
```

## 🎵 使用说明

1. **浏览专辑**: 在主页面查看所有可用的音乐专辑
2. **选择专辑**: 点击专辑卡片进入专辑详情页
3. **播放音乐**: 点击歌曲列表中的任意歌曲开始播放
4. **控制播放**: 使用底部播放器控制播放/暂停、切换歌曲
5. **调节音量**: 使用音量滑块调节播放音量
6. **跳转进度**: 点击进度条跳转到指定位置

## 🔧 自定义配置

### 修改音乐文件路径

编辑 `packages/server/src/index.ts` 中的 `MUSIC_PATH` 变量：

```typescript
const MUSIC_PATH = path.resolve(__dirname, '../../../your-music-folder');
```

### 修改端口配置

- 后端端口: 修改 `packages/server/src/index.ts` 中的 `PORT`
- 前端端口: 修改 `packages/ui/vite.config.ts` 中的 `server.port`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
