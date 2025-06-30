import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Track, Album, PlayerState } from '../types';
import { apiService } from '../services/api';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateThrottleRef = useRef<number>(0);
  const playNextRef = useRef<(() => void) | null>(null);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
  });

  // 节流的时间更新处理器 - 从60fps降到4fps
  const handleTimeUpdate = useCallback(() => {
    const now = Date.now();
    if (now - timeUpdateThrottleRef.current < 250) return; // 250ms节流
    timeUpdateThrottleRef.current = now;
    
    if (audioRef.current) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  }, []);

  const handleDurationChange = useCallback(() => {
    if (audioRef.current) {
      setPlayerState(prev => ({
        ...prev,
        duration: audioRef.current!.duration || 0,
      }));
    }
  }, []);

  const handleEnded = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: false,
    }));
    // 使用ref避免闭包问题
    if (playNextRef.current) {
      playNextRef.current();
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      duration: 0,
      currentTime: 0,
    }));
  }, []);

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = playerState.volume;
      audioRef.current.preload = 'metadata'; // 只预加载元数据
    }

    const audio = audioRef.current;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [handleTimeUpdate, handleDurationChange, handleEnded, handleLoadStart]);

  // 播放指定曲目
  const playTrack = useCallback(async (track: Track, album: Album) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const audioUrl = apiService.getAudioUrl(album.name, track.filename);

    try {
      audio.src = audioUrl;
      await audio.load();
      await audio.play();

      setPlayerState(prev => ({
        ...prev,
        currentTrack: track,
        currentAlbum: album,
        isPlaying: true,
      }));
    } catch (error) {
      console.error('Error playing track:', error);
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    }
  }, []);

  // 播放/暂停
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !playerState.currentTrack) return;

    const audio = audioRef.current;

    try {
      if (playerState.isPlaying) {
        audio.pause();
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audio.play();
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [playerState.isPlaying, playerState.currentTrack]);

  // 跳转到指定时间
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  }, []);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    
    setPlayerState(prev => ({
      ...prev,
      volume: clampedVolume,
    }));
  }, []);

  // 播放下一首
  const playNext = useCallback(() => {
    if (!playerState.currentAlbum || !playerState.currentTrack) return;

    const currentIndex = playerState.currentAlbum.tracks.findIndex(
      track => track.id === playerState.currentTrack!.id
    );

    if (currentIndex < playerState.currentAlbum.tracks.length - 1) {
      const nextTrack = playerState.currentAlbum.tracks[currentIndex + 1];
      playTrack(nextTrack, playerState.currentAlbum);
    }
  }, [playerState.currentAlbum, playerState.currentTrack, playTrack]);

  // 播放上一首
  const playPrevious = useCallback(() => {
    if (!playerState.currentAlbum || !playerState.currentTrack) return;

    const currentIndex = playerState.currentAlbum.tracks.findIndex(
      track => track.id === playerState.currentTrack!.id
    );

    if (currentIndex > 0) {
      const previousTrack = playerState.currentAlbum.tracks[currentIndex - 1];
      playTrack(previousTrack, playerState.currentAlbum);
    }
  }, [playerState.currentAlbum, playerState.currentTrack, playTrack]);

  // 更新 playNext ref
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  // 格式化时间 - 使用 useMemo 缓存
  const formatTime = useMemo(() => {
    return (seconds: number): string => {
      if (!isFinite(seconds)) return '0:00';
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
  }, []);

  return {
    playerState,
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    formatTime,
  };
};
