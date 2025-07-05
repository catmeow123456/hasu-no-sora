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
| `hime` | 安养寺姬芽 | #9d8de2 | `hasunosora` | 主题色 | #FB8A9B |

**小组**: `cerise` (#da645f), `dollche` (#163bca), `miracra` (#F3B171)

## 🛠️ 歌词时间轴生成工具

### 核心功能
- **音频源选择**: 支持上传文件和从项目曲库选择音频
- **自动歌词加载**: 选择曲库音频时自动加载对应歌词文件
- **音频波形**: Canvas 绘制，支持点击跳转
- **实时编辑**: 双击编辑歌词，拖拽调整时间
- **多歌手支持**: 完整的歌手标记和彩虹效果
- **导出格式**: LRC, Enhanced LRC, JSON, SRT, TXT
- **键盘快捷键**: Space(播放), Ctrl+T(插入), Ctrl+S(保存)
- **状态恢复**: 自动保存工作进度，支持跨会话恢复

### 组件架构
```
LyricsTimelineEditor/
├── TimelineEditor.tsx      # 主界面
├── AudioWaveform.tsx       # 波形可视化
├── LyricLineEditor.tsx     # 歌词行编辑
├── SingerTagEditor.tsx     # 歌手标记编辑
├── PreviewPanel.tsx        # 实时预览
├── ExportDialog.tsx        # 导出功能
├── RestoreDialog.tsx       # 状态恢复对话框
├── AudioSourceSelector.tsx # 音频源选择主界面
├── LibraryBrowser.tsx      # 曲库浏览组件
├── TrackSelector.tsx       # 曲目选择组件
├── utils/
│   └── audioCache.ts       # 音频文件缓存管理
└── hooks/                  # 自定义 Hooks
    ├── useTimelineProject.ts  # 项目状态管理（含恢复功能）
    ├── useAudioPlayer.ts      # 音频播放控制
    ├── useKeyboardShortcuts.ts # 键盘快捷键
    └── useLibraryData.ts      # 曲库数据管理
```

### 🎵 音频源选择系统 (核心特性)

#### 支持的音频源类型
- **上传文件**: 支持 MP3, WAV, FLAC, M4A, OGG 格式
- **曲库选择**: 从项目音乐库中选择已收录的音频文件

#### 自动歌词加载功能
- **智能检测**: 选择曲库音频时自动检测对应的 `.lrc` 歌词文件
- **无缝转换**: 自动将标准歌词格式转换为可编辑的时间轴格式
- **多歌手保留**: 完整保留歌手标记 `@歌手@文本` 和彩虹效果 `@歌手1,歌手2@文本`
- **优雅降级**: 如果没有歌词文件，继续使用空歌词进行编辑

#### 用户交互流程
```
点击"选择音频" → 选择音频源类型 → 浏览/选择文件 → 自动加载歌词 → 开始编辑
```

#### 技术实现要点
- **AudioSourceInfo**: 统一的音频源信息类型，支持两种音频源
- **双重存储策略**: 上传文件使用 IndexedDB 缓存，曲库文件直接使用 API URL
- **状态恢复兼容**: 完整支持两种音频源的项目状态恢复
- **API 集成**: 通过 `apiService.getLyrics()` 自动获取歌词文件

#### 开发注意事项
- 使用 `setPlayerAudioSource()` 而非 `setPlayerAudioFile()` 设置音频
- 曲库音频不需要 File 对象，直接使用 `audioSource.audioUrl`
- 自动歌词加载在 `handleAudioSourceSelected()` 中实现
- 歌词转换需要生成唯一的 `id` 和设置 `isSelected`, `isDraft` 状态

### 🔄 状态恢复系统

#### 存储架构
- **localStorage**: 项目元数据、歌词数据、设置信息、音频源信息
  - 键名: `timeline_last_project`
  - 内容: 序列化的项目数据（不含 File 对象）
- **IndexedDB**: 上传音频文件缓存
  - 数据库: `TimelineEditorCache`
  - 存储: 音频文件的 ArrayBuffer 数据

#### 恢复流程
1. 编辑器启动时检查 `timeline_last_project`
2. 如果存在保存的项目，显示 `RestoreDialog`
3. 用户选择恢复或开始新项目
4. 恢复时从 localStorage 加载项目数据
5. 根据音频源类型恢复音频：
   - **上传文件**: 从 IndexedDB 恢复 File 对象
   - **曲库文件**: 直接使用 API URL，无需缓存

#### 关键实现
- **音频缓存**: `audioCacheManager` 单例管理 IndexedDB 操作
- **序列化处理**: File 对象转换为可序列化的元数据
- **音频源处理**: 区分上传文件和曲库文件的不同恢复策略
- **错误处理**: 音频文件丢失时优雅降级
- **用户反馈**: 保存成功/失败的实时提示

#### 开发注意事项
- 不要在 `App.tsx` 中传入 `initialProject` 参数，会跳过恢复检查
- 上传文件通过 `audioCacheManager.cacheAudioFile()` 缓存
- 曲库文件不需要缓存，直接使用 `audioSource.audioUrl`
- 恢复时需要调用 `setPlayerAudioSource()` 而非 `setPlayerAudioFile()`
- 使用 `checkForSavedProject()` 检查是否有保存的项目

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
