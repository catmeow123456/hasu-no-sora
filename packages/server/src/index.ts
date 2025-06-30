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

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供音频文件
app.use('/audio', express.static(MUSIC_PATH));

// 初始化音乐库
async function initializeMusicLibrary() {
  console.log('Scanning music library...');
  const scanner = new MusicScanner(MUSIC_PATH);
  musicLibrary = await scanner.scanLibrary();
  console.log(`Found ${musicLibrary.length} albums`);
}

// API 路由

// 获取所有专辑
app.get('/api/albums', (req, res) => {
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
  
  res.json(albumsWithoutTracks);
});

// 获取特定专辑详情
app.get('/api/albums/:id', (req, res) => {
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
