# 代码规范与开发指导

## 📋 TypeScript 规范

### 类型定义
- 使用 `interface` 定义对象类型，使用 `type` 定义联合类型或复杂类型
- 前后端共享的类型定义保持同步（`packages/server/src/types/` 和 `packages/ui/src/types/`）
- 避免使用 `any`，优先使用具体类型或泛型
- 导出的接口和类型使用 PascalCase 命名

```typescript
// ✅ 推荐
interface Track {
  id: string;
  title: string;
  filename: string;
  duration?: number;
  albumId: string;
}

// ❌ 避免
const track: any = { ... };
```

### 函数和变量
- 使用 `const` 声明不可变变量，`let` 声明可变变量
- 函数优先使用箭头函数，除非需要 `this` 绑定
- 异步函数使用 `async/await` 而非 Promise 链

## ⚛️ React 规范

### 组件结构
- 使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名（如 `AlbumList.tsx`）
- 每个组件文件只导出一个主组件
- 组件内部按以下顺序组织：imports → types → component → export

```typescript
// ✅ 推荐的组件结构
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Album } from '../types';

interface AlbumListProps {
  onAlbumSelect: (albumId: string) => void;
}

const Container = styled.div`
  // styles
`;

export const AlbumList: React.FC<AlbumListProps> = ({ onAlbumSelect }) => {
  // component logic
  return <Container>...</Container>;
};
```

### Hooks 使用
- 自定义 Hooks 以 `use` 开头命名
- 将复杂的状态逻辑提取到自定义 Hooks 中
- 使用 `useCallback` 和 `useMemo` 优化性能，但不要过度优化

### Styled Components
- 样式组件使用 PascalCase 命名
- 将样式组件定义在组件文件底部或单独的样式文件中
- 使用主题系统 (`theme.ts`) 中的颜色和字体变量
- 避免内联样式，优先使用 styled-components

```typescript
// ✅ 推荐
const PlayButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;
```

## 🚀 Express 后端规范

### 路由组织
- API 路由使用 RESTful 设计
- 路由处理函数使用 async/await
- 统一的错误处理和响应格式
- 使用中间件处理通用逻辑（CORS、JSON 解析等）

```typescript
// ✅ 推荐的路由结构
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await getAlbums();
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 文件处理
- 音乐文件路径使用 `path.resolve()` 处理
- 文件存在性检查和错误处理
- 支持的音频格式：`.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`
- 支持的图片格式：`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 📁 项目结构规范

### 文件命名
- 组件文件：PascalCase（`AlbumDetail.tsx`）
- 工具函数文件：camelCase（`musicScanner.ts`）
- 类型定义文件：`index.ts`
- 样式文件：camelCase（`theme.ts`）

### 目录组织
```
packages/
├── server/src/
│   ├── index.ts          # 服务器入口
│   ├── types/index.ts    # 类型定义
│   └── utils/            # 工具函数
└── ui/src/
    ├── components/       # React 组件
    ├── hooks/           # 自定义 Hooks
    ├── services/        # API 服务
    ├── styles/          # 样式和主题
    └── types/           # 类型定义
```

## 🔧 开发工作流

### Yarn Workspaces 命令
```bash
# 在根目录安装依赖
yarn install

# 为特定包添加依赖
yarn workspace @hasu/server add express
yarn workspace @hasu/ui add react

# 运行特定包的脚本
yarn workspace @hasu/server dev
yarn workspace @hasu/ui build
```

### 开发模式
- 使用 `yarn dev` 同时启动前后端开发服务器
- 前端通过 Vite 代理访问后端 API
- 热重载：前端使用 Vite HMR，后端使用 TSX watch 模式

### 构建和部署
- 前端构建：`yarn build` 生成静态文件到 `packages/ui/dist/`
- 后端构建：TypeScript 编译到 `packages/server/dist/`
- 生产启动：`yarn start` 启动编译后的服务器

## 🎨 设计系统遵循

### 颜色使用
- 主色调：暖橙色 (#FF8C42) - 用于主要按钮和强调元素
- 次要色：金黄色 (#FFD23F) - 用于次要按钮和装饰
- 强调色：柔和粉色 (#FF6B9D) - 用于特殊状态和提示
- 背景色：奶油白 (#FFF8F0) - 主背景色

### 组件设计原则
- 保持温暖阳光的视觉风格
- 使用圆角和柔和的阴影
- 响应式设计，适配移动端和桌面端
- 一致的间距和字体大小

## 🚨 常见问题和解决方案

### 类型同步问题
- 前后端类型定义不一致时，优先以后端类型为准
- 定期检查 `packages/server/src/types/` 和 `packages/ui/src/types/` 的一致性

### 音频播放问题
- 使用 HTML5 Audio API
- 处理不同浏览器的音频格式兼容性
- 实现音频预加载和缓存策略

### 性能优化
- 图片懒加载和压缩
- 音频文件流式传输
- React 组件的 memo 化
- API 响应缓存

### 开发环境问题
- 确保 Node.js >= 16.0.0
- 使用 Yarn >= 1.22.0
- 检查端口占用（3000, 3001）
- 音乐文件路径配置正确

## 📝 代码审查清单

- [ ] TypeScript 类型定义完整且准确
- [ ] React 组件遵循 Hooks 最佳实践
- [ ] API 接口设计符合 RESTful 规范
- [ ] 样式使用主题系统变量
- [ ] 错误处理和边界情况考虑
- [ ] 性能优化措施到位
- [ ] 代码注释清晰易懂
- [ ] 测试覆盖关键功能
