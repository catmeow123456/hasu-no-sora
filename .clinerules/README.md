# Hasu no Sora 音乐播放器 - AI 助手指南

## 🎵 项目概述
温暖阳光风格的 Web 音乐播放器，专为 Hasu no Sora 音乐设计。TypeScript 全栈 + Yarn Workspaces Monorepo。

## 🏗️ 技术栈
- **后端**: Node.js + Express + TypeScript
- **前端**: React 18 + TypeScript + Styled Components + Vite
- **开发**: Yarn Workspaces + TSX

## 📁 核心结构
```
packages/
├── server/src/           # 后端服务
│   ├── index.ts         # 服务器入口
│   ├── types/           # 后端类型
│   └── utils/           # musicScanner, lyricsScanner
└── ui/src/              # 前端应用
    ├── components/      # React 组件
    │   ├── LyricsTimelineEditor/  # 歌词时间轴生成工具
    │   └── shared/      # 共享组件
    ├── hooks/           # 自定义 Hooks
    ├── styles/theme.ts  # 设计系统
    └── types/           # 前端类型
music/                   # 音乐文件存储
```

## 🚀 开发命令
```bash
yarn dev     # 开发模式 (前后端同时启动)
yarn build   # 构建前端
yarn start   # 生产服务器
```

## 🎨 设计系统
- **主色**: #FF8C42 (暖橙) | **次色**: #FFD23F (金黄) | **强调**: #FF6B9D (粉色)
- **背景**: #FFF8F0 (奶油白) | **字体**: Inter/Poppins + Noto Sans SC

## 🎤 多歌手歌词系统 (核心特性)

### 支持格式
```lrc
[00:12.34]@kozue@单歌手歌词
[01:05.44]@kozue@混合 @kaho@歌手 @kozue@标记
[02:05.00]@kaho,tsuzuri,megumi@彩虹渐变效果
```

### 歌手配色 (关键信息)
| 简称 | 角色 | 颜色 | 简称 | 角色 | 颜色 |
|------|------|------|------|------|------|
| `kozue` | 乙宗梢 | #68be8d | `rurino` | 大泽瑠璃乃 | #e7609e |
| `kaho` | 日野下花帆 | #f8b500 | `megumi` | 藤岛慈 | #c8c2c6 |
| `sayaka` | 村野沙耶香 | #5383c3 | `ginko` | 百生吟子 | #a2d7dd |
| `tsuzuri` | 夕雾缀理 | #ba2636 | `kosuzu` | 徒町小铃 | #fad764 |
| `himena` | 安养寺姬芽 | #9d8de2 | `hasunosora` | 主题色 | #FB8A9B |

**小组**: `cerise` (#da645f), `dollche` (#163bca), `miracra` (#F3B171)

## 🛠️ 歌词时间轴生成工具

### 核心功能
- **音频波形**: Canvas 绘制，支持点击跳转
- **实时编辑**: 双击编辑歌词，拖拽调整时间
- **多歌手支持**: 完整的歌手标记和彩虹效果
- **导出格式**: LRC, Enhanced LRC, JSON, SRT, TXT
- **键盘快捷键**: Space(播放), Ctrl+T(插入), Ctrl+S(保存)

### 组件架构
```
LyricsTimelineEditor/
├── TimelineEditor.tsx      # 主界面
├── AudioWaveform.tsx       # 波形可视化
├── LyricLineEditor.tsx     # 歌词行编辑
├── SingerTagEditor.tsx     # 歌手标记编辑
├── PreviewPanel.tsx        # 实时预览
├── ExportDialog.tsx        # 导出功能
└── hooks/                  # 自定义 Hooks
```

## 📡 API 接口
- **认证**: 密码 `hasu-no-sora`
- **核心接口**: `/api/albums`, `/api/albums/:id`, `/audio/:albumName/:filename`, `/api/lyrics/:albumName/:trackFilename`

## 🎯 开发指导

### 代码规范
- **TypeScript**: 严格类型，避免 `any`
- **React**: 函数组件 + Hooks，使用 `React.memo` 优化
- **样式**: Styled Components + 主题系统
- **性能**: `useCallback`/`useMemo` 缓存

### 歌词组件开发
- 使用 `packages/ui/src/components/shared/LyricsSegments.tsx` 共享渲染逻辑
- 支持 `@歌手@文本` 和 `@歌手1,歌手2@文本` 格式
- 保持前后端类型定义同步

### 注意事项
- 音乐文件路径配置在 `packages/server/src/index.ts`
- 前端通过 Vite 代理访问后端 API
- 使用 Yarn Workspaces，注意包管理命令
- 保持设计系统的一致性，遵循温暖阳光风格
