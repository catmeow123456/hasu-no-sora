import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { MusicScanner } from './utils/musicScanner';
import { Album } from './types';

// 扩展 session 类型
declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
  }
}

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;

// 音乐文件路径 - 指向项目根目录的音乐文件夹
const MUSIC_PATH = path.resolve(__dirname, '../../../music');

// 前端静态文件路径
const STATIC_PATH = path.resolve(__dirname, '../../ui/dist');

let musicLibrary: Album[] = [];
let libraryCache: { albums: any[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 中间件
app.use(cors({
  credentials: true, // 允许携带 cookie
  origin: true
}));
app.use(express.json({ limit: '10mb' }));

// 设置默认字符编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Session 配置
app.use(session({
  secret: 'hasu-no-sora-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 开发环境设为 false，生产环境应设为 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}) as any);

// 认证中间件
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// 音频文件服务 - 添加认证保护
app.get('/audio/:albumName/:filename', requireAuth, (req, res) => {
  const { albumName, filename } = req.params;
  const audioPath = path.join(MUSIC_PATH, albumName, filename);
  
  // 设置缓存头
  res.set('Cache-Control', 'public, max-age=86400'); // 1天缓存
  
  res.sendFile(audioPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Audio file not found' });
    }
  });
});

// 初始化音乐库
async function initializeMusicLibrary() {
  console.log('Scanning music library...');
  const scanner = new MusicScanner(MUSIC_PATH);
  musicLibrary = await scanner.scanLibrary();
  console.log(`Found ${musicLibrary.length} albums`);
}

// API 路由

// 登录接口
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (password === 'hasu-no-sora') {
    req.session.authenticated = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// 登出接口
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// 检查认证状态
app.get('/api/auth/status', (req, res) => {
  const isAuthenticated = req.session && req.session.authenticated;
  res.json({ authenticated: isAuthenticated });
});

// 获取所有专辑 - 添加缓存和认证保护
app.get('/api/albums', requireAuth, (req, res) => {
  // 设置缓存头
  res.set('Cache-Control', 'public, max-age=300'); // 5分钟缓存
  
  // 检查内存缓存
  const now = Date.now();
  if (libraryCache && (now - libraryCache.timestamp) < CACHE_DURATION) {
    return res.json(libraryCache.albums);
  }
  
  const albumsWithoutTracks = musicLibrary.map(album => ({
    id: album.id,
    name: album.name,
    coverImage: album.coverImage,
    trackCount: album.tracks.length,
    releaseDate: album.releaseDate
  }));
  
  // 按发售日期排序，最新的在前面
  albumsWithoutTracks.sort((a, b) => {
    if (!a.releaseDate && !b.releaseDate) return 0;
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  });
  
  // 更新缓存
  libraryCache = {
    albums: albumsWithoutTracks,
    timestamp: now
  };
  
  res.json(albumsWithoutTracks);
});

// 获取特定专辑详情 - 添加缓存和认证保护
app.get('/api/albums/:id', requireAuth, (req, res) => {
  // 设置缓存头
  res.set('Cache-Control', 'public, max-age=600'); // 10分钟缓存
  
  const album = musicLibrary.find(a => a.id === req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  res.json(album);
});

// 获取专辑封面图片 - 添加认证保护
app.get('/api/images/:albumId/:filename', requireAuth, (req, res) => {
  const { albumId, filename } = req.params;
  const album = musicLibrary.find(a => a.id === albumId);
  
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }

  const imagePath = path.join(album.path, filename);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// API 根路径 - 提供 API 信息
app.get('/api', (req, res) => {
  res.json({
    name: 'Hasu no Sora Music API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        status: 'GET /api/auth/status'
      },
      albums: {
        list: 'GET /api/albums',
        detail: 'GET /api/albums/:id',
        cover: 'GET /api/images/:albumId/:filename'
      },
      audio: 'GET /audio/:albumName/:filename',
      health: 'GET /api/health'
    },
    albums: musicLibrary.length,
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    albums: musicLibrary.length,
    timestamp: new Date().toISOString()
  });
});

// 强制重新扫描音乐库 - 开发用途
app.post('/api/rescan', requireAuth, async (req, res) => {
  try {
    console.log('Force rescanning music library...');
    
    // 清除缓存
    libraryCache = null;
    
    // 重新扫描
    await initializeMusicLibrary();
    
    res.json({ 
      success: true, 
      message: 'Music library rescanned successfully',
      albums: musicLibrary.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rescanning music library:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to rescan music library',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 静态文件服务 - 提供前端文件
app.use('/', express.static(STATIC_PATH, {
  maxAge: '1h', // 静态文件缓存1小时
  etag: true,
  lastModified: true
}));

// SPA 路由回退 - 处理前端路由
app.get('*', (req, res) => {
  // 排除 API 路由和音频文件路由
  if (req.path.startsWith('/api') || req.path.startsWith('/audio')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

// 启动服务器
async function startServer() {
  try {
    await initializeMusicLibrary();
    
    app.listen(PORT, () => {
      console.log(`🎵 Hasu no Sora Music Server running on port ${PORT}`);
      console.log(`📁 Music path: ${MUSIC_PATH}`);
      console.log(`🎼 Albums loaded: ${musicLibrary.length}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
