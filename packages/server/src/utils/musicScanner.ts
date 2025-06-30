import fs from 'fs';
import path from 'path';
import { Album, Track } from '../types';

interface AlbumDates {
  [albumName: string]: string;
}

export class MusicScanner {
  private musicPath: string;
  private albumDates: AlbumDates = {};

  constructor(musicPath: string) {
    this.musicPath = musicPath;
    this.loadAlbumDates();
  }

  private loadAlbumDates(): void {
    try {
      const albumDatesPath = path.resolve(__dirname, '../../../../albumDates.json');
      if (fs.existsSync(albumDatesPath)) {
        const data = fs.readFileSync(albumDatesPath, 'utf-8');
        this.albumDates = JSON.parse(data);
        console.log('Album dates loaded successfully');
      } else {
        console.warn('albumDates.json not found, albums will not have release dates');
      }
    } catch (error) {
      console.error('Error loading album dates:', error);
      this.albumDates = {};
    }
  }

  async scanLibrary(): Promise<Album[]> {
    const albums: Album[] = [];
    
    try {
      const entries = fs.readdirSync(this.musicPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const albumPath = path.join(this.musicPath, entry.name);
          const album = await this.scanAlbum(entry.name, albumPath);
          if (album && album.tracks.length > 0) {
            albums.push(album);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning music library:', error);
    }

    return albums;
  }

  private async scanAlbum(albumName: string, albumPath: string): Promise<Album | null> {
    try {
      const files = fs.readdirSync(albumPath);
      const tracks: Track[] = [];
      let coverImage: string | undefined;

      // 查找封面图片
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      if (imageFiles.length > 0) {
        // 优先选择常见的封面文件名，album.jpg 为最高优先级
        const preferredNames = ['album.jpg', 'folder.jpg', 'cover.jpg', 'albumart.jpg'];
        coverImage = preferredNames.find(name => 
          imageFiles.some(file => file.toLowerCase() === name.toLowerCase())
        ) || imageFiles[0];
      }

      // 扫描音频文件 (跳过 wav 文件)
      const audioFiles = files.filter(file => 
        /\.(mp3|flac|m4a|ogg)$/i.test(file)
      );

      for (const audioFile of audioFiles) {
        const filePath = path.join(albumPath, audioFile);
        const track = await this.parseAudioFile(audioFile, filePath, albumName);
        if (track) {
          tracks.push(track);
        }
      }

      // 按文件名排序
      tracks.sort((a, b) => a.filename.localeCompare(b.filename));

      return {
        id: this.generateId(albumName),
        name: albumName,
        coverImage,
        tracks,
        path: albumPath,
        releaseDate: this.albumDates[albumName]
      };
    } catch (error) {
      console.error(`Error scanning album ${albumName}:`, error);
      return null;
    }
  }

  private async parseAudioFile(filename: string, filePath: string, albumName: string): Promise<Track | null> {
    try {
      // 动态导入 music-metadata ES 模块
      const { parseFile } = await import('music-metadata');
      const metadata = await parseFile(filePath, { 
        skipCovers: true,
        skipPostHeaders: true 
      });
      
      let title = metadata.common.title;
      
      // 简化处理：如果标题存在且不是明显乱码，就使用它；否则使用文件名
      if (title && !this.isGarbledText(title)) {
        // 直接使用元数据中的标题
      } else {
        // 使用文件名作为标题
        title = this.extractTitleFromFilename(filename);
        if (metadata.common.title) {
          console.warn(`Using filename as title for ${filename} (original: ${metadata.common.title})`);
        }
      }
      
      return {
        id: this.generateId(`${albumName}-${filename}`),
        title,
        filename,
        duration: metadata.format.duration,
        albumId: this.generateId(albumName)
      };
    } catch (error) {
      // 检查是否是 Buffer 相关错误或其他解析错误
      if (error instanceof Error) {
        console.warn(`Warning: Could not parse metadata for ${filename}: ${error.message}`);
      } else {
        console.warn(`Warning: Could not parse metadata for ${filename}:`, error);
      }
      
      // 如果解析失败，仍然创建基本的 track 信息
      return {
        id: this.generateId(`${albumName}-${filename}`),
        title: this.extractTitleFromFilename(filename),
        filename,
        albumId: this.generateId(albumName)
      };
    }
  }

  private extractTitleFromFilename(filename: string): string {
    // 移除文件扩展名
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // 移除常见的编号前缀 (如 "01 ", "01. ", "1 - ")
    const cleanName = nameWithoutExt.replace(/^\d+[\s\-\.]*/, '');
    
    return cleanName || nameWithoutExt;
  }

  private isGarbledText(text: string): boolean {
    // 检查是否包含明显的乱码字符模式
    // 这些模式通常出现在字符编码错误时
    const garbledPatterns = [
      // Latin-1 编码错误导致的中文乱码
      /[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{2,}/,
      // Shift-JIS 编码错误导致的日文乱码
      /[¥©`]{2,}/,
      // 其他常见乱码模式
      /[Ë®²ÊÊÀ½ç|ÓÀßh¤Î|Ö¸è|¥¹¥±¥¤¥×¥´|¥Ä¥Ð¥µ|¥¸¥Ö¥ó¥À¥¤¥¢¥ê|¥Õ¥©|ÏÄ¤á¤­¥Ú¥¤¥ó|¥³¥³¥ó|²Ðê|Çà´º¤Î|¥Ï¥¯¥Á¥å|¥Ñ¥é¥ì¥ë¥À¥ó¥µ|Ã÷ÈÕ¤Î|±§¤­¤·¤á¤ë]/
    ];
    
    return garbledPatterns.some(pattern => pattern.test(text));
  }


  private generateId(input: string): string {
    return input.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
