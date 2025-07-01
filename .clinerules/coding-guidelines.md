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
- 使用 `useCallback` 和 `useMemo` 优化性能，但避免过度优化

```typescript
// ✅ 推荐 - 缓存回调函数
const handleClick = useCallback((id: string) => {
  onItemSelect(id);
}, [onItemSelect]);

// ✅ 推荐 - 缓存计算结果
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

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

### 性能优化最佳实践
- **React.memo**: 为所有可能重复渲染的组件添加 memo 包装
- **useCallback**: 缓存事件处理函数，特别是传递给子组件的回调
- **useMemo**: 缓存计算结果，避免重复计算
- **displayName**: 为 memo 组件添加 displayName 便于调试

```typescript
// ✅ 推荐 - 组件 memo 化
export const AlbumCard: React.FC<AlbumCardProps> = React.memo(({ album, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(album.id);
  }, [album.id, onSelect]);

  return <Card onClick={handleClick}>...</Card>;
});

AlbumCard.displayName = 'AlbumCard';
```

### CSS 动画性能优化
- **GPU 加速**: 使用 `transform: translateZ(0)` 和 `backface-visibility: hidden`
- **避免重绘**: 只对 `transform` 和 `opacity` 属性进行动画
- **快速过渡**: 使用 120ms 以下的过渡时间提升响应性
- **单一属性动画**: 避免 `transition: all`，明确指定动画属性

```typescript
// ✅ 推荐 - 高性能悬浮动画
const Card = styled.div`
  /* 极致性能优化 */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  /* 只动画 transform，最快速度 */
  transition: transform 120ms ease-out;

  &:hover {
    /* 只有位移动画，零重绘开销 */
    transform: translateY(-6px) translateZ(0);
  }
`;

// ❌ 避免 - 性能消耗大的动画
const SlowCard = styled.div`
  transition: all 250ms ease-in-out; /* 监听所有属性变化 */
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px rgba(0,0,0,0.15); /* 重绘开销大 */
    border-color: #primary; /* 重绘 */
    background: #surfaceHover; /* 重绘 */
  }
`;
```

### Hooks 使用
- 自定义 Hooks 以 `use` 开头命名
- 将复杂的状态逻辑提取到自定义 Hooks 中
- 使用 `useCallback` 和 `useMemo` 优化性能，但不要过度优化
- 避免在 useEffect 中创建闭包问题，使用 ref 解决

```typescript
// ✅ 推荐 - 避免闭包问题
const useAudioPlayer = () => {
  const playNextRef = useRef<(() => void) | null>(null);
  
  const playNext = useCallback(() => {
    // 逻辑实现
  }, [dependencies]);
  
  // 更新 ref 避免闭包
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);
  
  const handleEnded = useCallback(() => {
    if (playNextRef.current) {
      playNextRef.current();
    }
  }, []);
};
```

### 事件处理优化
- 使用节流（throttle）处理高频事件如 scroll、resize、timeupdate
- 音频时间更新建议节流到 250ms (4fps)
- 避免在渲染函数中创建新的对象和函数

```typescript
// ✅ 推荐 - 时间更新节流
const handleTimeUpdate = useCallback(() => {
  const now = Date.now();
  if (now - timeUpdateThrottleRef.current < 250) return;
  timeUpdateThrottleRef.current = now;
  
  setCurrentTime(audioRef.current?.currentTime || 0);
}, []);
```

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

## 🖼️ 懒加载和资源优化

### 图片懒加载
- 使用 Intersection Observer API 实现懒加载
- 提前 50px 开始加载图片，优化用户体验
- 实现加载状态和错误处理

```typescript
// ✅ 推荐 - LazyImage 组件实现
export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src, alt, placeholder, onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <ImageContainer ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={onError}
          loading="lazy"
        />
      )}
    </ImageContainer>
  );
});
```

### 音频预加载策略
- 设置 `preload="metadata"` 只预加载元数据
- 避免自动预加载完整音频文件
- 实现智能缓存机制

```typescript
// ✅ 推荐 - 音频元素优化
useEffect(() => {
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.volume = playerState.volume;
    audioRef.current.preload = 'metadata'; // 只预加载元数据
  }
}, []);
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

### 缓存策略
- **内存缓存**: 专辑列表缓存 5 分钟
- **HTTP 缓存**: 设置适当的 Cache-Control 头
- **静态资源**: 音频文件缓存 1 天

```typescript
// ✅ 推荐 - API 缓存实现
app.get('/api/albums', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5分钟缓存
  
  const now = Date.now();
  if (libraryCache && (now - libraryCache.timestamp) < CACHE_DURATION) {
    return res.json(libraryCache.albums);
  }
  
  // 处理逻辑...
});

// 静态文件缓存
app.use('/audio', express.static(MUSIC_PATH, {
  maxAge: '1d', // 音频文件缓存1天
  etag: true,
  lastModified: true
}));
```

### 异步文件处理
- 使用 `fs.promises` 替代同步操作
- 实现批量并行处理，控制并发数量
- 添加错误处理和性能监控

```typescript
// ✅ 推荐 - 异步文件扫描
async scanLibrary(): Promise<Album[]> {
  const entries = await fs.promises.readdir(this.musicPath, { withFileTypes: true });
  
  const albumPromises = entries
    .filter(entry => entry.isDirectory())
    .map(async (entry) => {
      const albumPath = path.join(this.musicPath, entry.name);
      return this.scanAlbum(entry.name, albumPath);
    });

  // 分批处理，每批最多5个专辑
  const batchSize = 5;
  const albums: Album[] = [];
  
  for (let i = 0; i < albumPromises.length; i += batchSize) {
    const batch = albumPromises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    albums.push(...batchResults.filter(Boolean));
  }
  
  return albums;
}
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
- 检查端口占用（3000, 3000）
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
