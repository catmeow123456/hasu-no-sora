import { useState, useEffect, useCallback, useMemo } from 'react';
import { Track, Album, Lyrics } from '../types';
import { apiService } from '../services/api';

export const useLyrics = (currentTrack: Track | null, currentAlbum: Album | null) => {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载歌词
  const loadLyrics = useCallback(async (track: Track, album: Album) => {
    setIsLoading(true);
    setError(null);

    try {
      const lyricsData = await apiService.getLyrics(album.name, track.filename);
      setLyrics(lyricsData);
    } catch (err) {
      console.warn('Failed to load lyrics:', err);
      // 如果是 404 错误，说明没有歌词文件，不显示错误
      if (err instanceof Error && err.message.includes('404')) {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load lyrics');
      }
      setLyrics({
        trackId: track.id,
        lines: [],
        hasLyrics: false
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当前歌曲变化时加载歌词
  useEffect(() => {
    if (currentTrack && currentAlbum) {
      loadLyrics(currentTrack, currentAlbum);
    } else {
      setLyrics(null);
      setError(null);
    }
  }, [currentTrack, currentAlbum, loadLyrics]);

  // 根据当前播放时间计算当前歌词行索引
  const getCurrentLineIndex = useCallback((currentTime: number): number => {
    if (!lyrics || lyrics.lines.length === 0) return -1;

    // 二分查找优化性能
    let left = 0;
    let right = lyrics.lines.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (lyrics.lines[mid].time <= currentTime) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }, [lyrics]);

  // 获取当前行及其上下文
  const getLyricsContext = useCallback((currentTime: number, contextLines: number = 2) => {
    if (!lyrics || lyrics.lines.length === 0) {
      return {
        currentLineIndex: -1,
        visibleLines: [],
        currentLine: null
      };
    }

    const currentLineIndex = getCurrentLineIndex(currentTime);
    const currentLine = currentLineIndex >= 0 ? lyrics.lines[currentLineIndex] : null;

    // 计算可见行范围
    const startIndex = Math.max(0, currentLineIndex - contextLines);
    const endIndex = Math.min(lyrics.lines.length - 1, currentLineIndex + contextLines);
    
    const visibleLines = lyrics.lines.slice(startIndex, endIndex + 1).map((line, index) => ({
      ...line,
      index: startIndex + index,
      isCurrent: startIndex + index === currentLineIndex
    }));

    return {
      currentLineIndex,
      visibleLines,
      currentLine
    };
  }, [lyrics, getCurrentLineIndex]);

  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // 检查是否有歌词
  const hasLyrics = useMemo(() => {
    return lyrics?.hasLyrics && lyrics.lines.length > 0;
  }, [lyrics]);

  return {
    lyrics,
    isLoading,
    error,
    hasLyrics,
    getCurrentLineIndex,
    getLyricsContext,
    formatTime,
    reload: () => {
      if (currentTrack && currentAlbum) {
        loadLyrics(currentTrack, currentAlbum);
      }
    }
  };
};
