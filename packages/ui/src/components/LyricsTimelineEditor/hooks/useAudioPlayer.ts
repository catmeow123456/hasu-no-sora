import { useState, useCallback, useEffect, RefObject } from 'react';
import type { AudioPlayerHook, AudioSourceInfo } from '../types';

export const useAudioPlayer = (audioRef: RefObject<HTMLAudioElement>): AudioPlayerHook => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  // 播放
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  }, [audioRef]);

  // 暂停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioRef]);

  // 跳转到指定时间
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [audioRef, duration]);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, [audioRef]);

  // 设置音频文件
  const setAudioFile = useCallback((file: File | null) => {
    if (audioRef.current) {
      if (file) {
        const url = URL.createObjectURL(file);
        audioRef.current.src = url;
        
        // 清理之前的 URL
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        audioRef.current.src = '';
      }
    }
  }, [audioRef]);

  // 设置音频源（支持上传文件和曲库文件）
  const setAudioSource = useCallback((source: AudioSourceInfo | null) => {
    if (!audioRef.current) return;

    if (!source) {
      audioRef.current.src = '';
      return;
    }

    if (source.type === 'upload' && source.file) {
      // 上传文件：使用 File 对象
      const url = URL.createObjectURL(source.file);
      audioRef.current.src = url;
      audioRef.current.load();
      
      // 返回清理函数
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (source.type === 'library' && source.audioUrl) {
      // 曲库文件：使用 API URL
      audioRef.current.src = source.audioUrl;
      audioRef.current.load();
    }
  }, [audioRef]);

  // 设置音频事件监听器
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 时间更新事件
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // 加载元数据事件
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(0);
    };

    // 播放事件
    const handlePlay = () => {
      setIsPlaying(true);
    };

    // 暂停事件
    const handlePause = () => {
      setIsPlaying(false);
    };

    // 结束事件
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // 错误事件
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    // 音量变化事件
    const handleVolumeChange = () => {
      setVolumeState(audio.volume);
    };

    // 添加事件监听器
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('volumechange', handleVolumeChange);

    // 设置初始音量
    audio.volume = volume;

    // 清理函数
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [audioRef, volume]);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seekTo,
    setVolume,
    setAudioFile,
    setAudioSource
  };
};
