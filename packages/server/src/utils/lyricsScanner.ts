import fs from 'fs';
import path from 'path';
import { LyricLine, LyricSegment, Lyrics, Track, SingerType } from '../types/index.js';

export class LyricsScanner {
  private musicPath: string;

  constructor(musicPath: string) {
    this.musicPath = musicPath;
  }

  /**
   * 解析歌词文本中的歌手标记
   * 支持格式：@kozue@歌词文本 或 @kozue@部分1 @kaho@部分2
   */
  private parseSegments(text: string): LyricSegment[] {
    const segments: LyricSegment[] = [];
    
    // 歌手标记正则: @歌手名@文本内容
    const singerRegex = /@([^@]+)@([^@]*?)(?=@|$)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = singerRegex.exec(text)) !== null) {
      const [fullMatch, singer, segmentText] = match;
      const matchStart = match.index;
      
      // 如果匹配前有未标记的文本，添加为无歌手片段
      if (matchStart > lastIndex) {
        const unmarkedText = text.slice(lastIndex, matchStart).trim();
        if (unmarkedText) {
          segments.push({ text: unmarkedText });
        }
      }
      
      // 添加带歌手标记的片段
      if (segmentText.trim()) {
        const trimmedSinger = singer.trim();
        segments.push({
          text: segmentText.trim(),
          singer: trimmedSinger as SingerType
        });
      }
      
      lastIndex = matchStart + fullMatch.length;
    }
    
    // 如果没有找到任何歌手标记，或者最后还有未处理的文本
    if (segments.length === 0 || lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText) {
        segments.push({ text: remainingText });
      }
    }
    
    // 如果没有任何片段，返回整个文本作为无歌手片段
    if (segments.length === 0 && text.trim()) {
      segments.push({ text: text.trim() });
    }
    
    return segments;
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
      
      // 解析歌词文本中的歌手标记
      const segments = this.parseSegments(text);
      
      // 重新构建完整文本（去除歌手标记）
      const cleanText = segments.map(segment => segment.text).join(' ').trim();
      
      // 处理每个时间戳（一行可能有多个时间戳）
      for (const match of matches) {
        const [originalTime, minutes, seconds, centiseconds = '0'] = match;
        
        const time = parseInt(minutes) * 60 + 
                    parseInt(seconds) + 
                    parseInt(centiseconds.padEnd(2, '0')) / 100;
        
        lines.push({
          time,
          text: cleanText,
          originalTime,
          segments
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
