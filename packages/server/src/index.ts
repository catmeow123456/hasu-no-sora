import express from 'express';
import cors from 'cors';
import path from 'path';
import { MusicScanner } from './utils/musicScanner';
import { Album } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// 音乐文件路径 - 指向项目根目录的音乐文件夹
const MUSIC_PATH = path.resolve(__dirname, '../../../music');

let musicLibrary: Album[] = [];
let libraryCache: { albums: any[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供音频文件，添加缓存头
app.use('/audio', express.static(MUSIC_PATH, {
  maxAge: '1d', // 音频文件缓存1天
  etag: true,
  lastModified: true
}));

// 初始化音乐库
async function initializeMusicLibrary() {
  console.log('Scanning music library...');
  const scanner = new MusicScanner(MUSIC_PATH);
  musicLibrary = await scanner.scanLibrary();
  console.log(`Found ${musicLibrary.length} albums`);
}

// API 路由

// 获取所有专辑 - 添加缓存
app.get('/api/albums', (req, res) => {
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

// 获取特定专辑详情 - 添加缓存
app.get('/api/albums/:id', (req, res) => {
  // 设置缓存头
  res.set('Cache-Control', 'public, max-age=600'); // 10分钟缓存
  
  const album = musicLibrary.find(a => a.id === req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  res.json(album);
});

// 获取专辑封面图片
app.get('/api/images/:albumId/:filename', (req, res) => {
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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    albums: musicLibrary.length,
    timestamp: new Date().toISOString()
  });
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
