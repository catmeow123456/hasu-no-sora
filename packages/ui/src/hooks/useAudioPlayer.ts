import { useState, useRef, useEffect, useCallback } from 'react';
import { Track, Album, PlayerState } from '../types';
import { apiService } from '../services/api';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
  });

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = playerState.volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleDurationChange = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
      }));
      // 自动播放下一首
      playNext();
    };

    const handleLoadStart = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: 0,
        currentTime: 0,
      }));
    };

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
  }, []);

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

  // 格式化时间
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
