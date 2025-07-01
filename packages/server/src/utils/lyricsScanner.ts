import fs from 'fs';
import path from 'path';
import { LyricLine, Lyrics, Track } from '../types/index.js';

export class LyricsScanner {
  private musicPath: string;

  constructor(musicPath: string) {
    this.musicPath = musicPath;
  }

  /**
   * 解析 LRC 文件内容
   */
  parseLrcFile(content: string): LyricLine[] {
    const lines: LyricLine[] = [];
    const lrcLines = content.split('\n');
    
    // LRC 时间戳正则: [mm:ss.xx] 或 [mm:ss]
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2}))?\]/g;
    
    for (const line of lrcLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // 跳过元数据行 (如 [ti:], [ar:], [al:] 等)
      if (trimmedLine.match(/^\[[a-z]+:/i)) continue;
      
      const matches = [...trimmedLine.matchAll(timeRegex)];
      if (matches.length === 0) continue;
      
      // 提取歌词文本（移除所有时间戳）
      const text = trimmedLine.replace(timeRegex, '').trim();
      
      // 处理每个时间戳（一行可能有多个时间戳）
      for (const match of matches) {
        const [originalTime, minutes, seconds, centiseconds = '0'] = match;
        
        const time = parseInt(minutes) * 60 + 
                    parseInt(seconds) + 
                    parseInt(centiseconds.padEnd(2, '0')) / 100;
        
        lines.push({
          time,
          text,
          originalTime
        });
      }
    }
    
    // 按时间排序
    lines.sort((a, b) => a.time - b.time);
    
    return lines;
  }

  /**
   * 获取歌词文件路径
   */
  private getLyricsFilePath(albumName: string, trackFilename: string): string {
    const nameWithoutExt = trackFilename.replace(/\.[^/.]+$/, '');
    return path.join(this.musicPath, albumName, `${nameWithoutExt}.lrc`);
  }

  /**
   * 检查歌词文件是否存在
   */
  async hasLyrics(albumName: string, trackFilename: string): Promise<boolean> {
    const lyricsPath = this.getLyricsFilePath(albumName, trackFilename);
    try {
      await fs.promises.access(lyricsPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取指定歌曲的歌词
   */
  async getLyrics(albumName: string, trackFilename: string, trackId: string): Promise<Lyrics | null> {
    const lyricsPath = this.getLyricsFilePath(albumName, trackFilename);
    
    try {
      const content = await fs.promises.readFile(lyricsPath, 'utf-8');
      const lines = this.parseLrcFile(content);
      
      return {
        trackId,
        lines,
        hasLyrics: lines.length > 0
      };
    } catch (error) {
      console.warn(`No lyrics found for ${albumName}/${trackFilename}`);
      return {
        trackId,
        lines: [],
        hasLyrics: false
      };
    }
  }

  /**
   * 扫描专辑目录中的歌词文件，更新 tracks 的 hasLyrics 属性
   */
  async scanAlbumLyrics(albumName: string, tracks: Track[]): Promise<void> {
    const promises = tracks.map(async (track) => {
      track.hasLyrics = await this.hasLyrics(albumName, track.filename);
    });
    
    await Promise.all(promises);
  }
}
