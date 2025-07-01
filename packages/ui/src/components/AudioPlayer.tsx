import React from 'react';
import styled, { keyframes } from 'styled-components';
import { PlayerState } from '../types';
import { theme } from '../styles/theme';
import { CuteButton } from './CuteButton';
import { CuteProgressBar } from './CuteProgressBar';
import { CuteVolumeSlider } from './CuteVolumeSlider';

// 优化的发光动画 - 使用 transform 替代 box-shadow
const glow = keyframes`
  0%, 100% { 
    transform: translateY(0px);
    filter: brightness(1);
  }
  50% { 
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
`;

// 简化的音符动画 - 只使用 transform 和 opacity
const noteFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) scale(1); 
    opacity: 0.7; 
  }
  50% { 
    transform: translateY(-6px) scale(1.1); 
    opacity: 1; 
  }
`;

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.surfaceHover});
  border-top: 3px solid transparent;
  border-image: ${theme.gradients.primary} 1;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  animation: ${glow} 8s ease-in-out infinite;
  backdrop-filter: blur(15px);
  z-index: 1000;
  overflow: hidden;
  will-change: transform, filter;
  box-shadow: ${theme.shadows.xl};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      rgba(255, 154, 139, 0.05) 0%, 
      rgba(255, 179, 186, 0.05) 50%, 
      rgba(255, 154, 139, 0.05) 100%
    );
    pointer-events: none;
  }
`;

const PlayerContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  max-width: 1200px;
  margin: 0 auto;
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

const TrackTitle = styled.h4`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: linear-gradient(45deg, ${theme.colors.text.primary}, ${theme.colors.primary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AlbumName = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
`;

const FloatingNote = styled.div<{ $isPlaying: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: ${props => props.$isPlaying ? 1 : 0};
  animation: ${props => props.$isPlaying ? noteFloat : 'none'} 2.5s ease-in-out infinite;
  pointer-events: none;
  will-change: transform, opacity;
  transition: opacity ${theme.transitions.normal};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;


const ProgressSection = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 200px;
`;

const TimeDisplay = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  min-width: 40px;
  text-align: center;
`;



interface AudioPlayerProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  formatTime: (seconds: number) => string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = React.memo(({
  playerState,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  formatTime
}) => {
  const { currentTrack, currentAlbum, isPlaying, currentTime, duration, volume } = playerState;

  // 缓存计算结果
  const progress = React.useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // 缓存导航状态
  const navigationState = React.useMemo(() => {
    if (!currentTrack || !currentAlbum) {
      return { hasPrevious: false, hasNext: false, currentIndex: -1 };
    }
    
    const currentIndex = currentAlbum.tracks.findIndex(track => track.id === currentTrack.id);
    return {
      currentIndex,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < currentAlbum.tracks.length - 1
    };
  }, [currentTrack, currentAlbum]);

  // 缓存事件处理器
  const handleSeek = React.useCallback((percentage: number) => {
    onSeek((percentage / 100) * duration);
  }, [onSeek, duration]);

  if (!currentTrack || !currentAlbum) {
    return null;
  }

  return (
    <PlayerContainer>
      <PlayerContent>
        <TrackInfo>
          <TrackTitle>{currentTrack.title}</TrackTitle>
          <AlbumName>{currentAlbum.name}</AlbumName>
          <FloatingNote $isPlaying={isPlaying}>🎵</FloatingNote>
        </TrackInfo>

        <Controls>
          <CuteButton 
            onClick={onPrevious}
            disabled={!navigationState.hasPrevious}
            title="上一首"
            size="small"
            variant="cute"
          >
            🎀⬅️
          </CuteButton>
          
          <CuteButton 
            onClick={onPlayPause}
            title={isPlaying ? '暂停' : '播放'}
            size="large"
            variant="primary"
            isPlaying={isPlaying}
          >
            {isPlaying ? '💖' : '🌸'}
          </CuteButton>
          
          <CuteButton 
            onClick={onNext}
            disabled={!navigationState.hasNext}
            title="下一首"
            size="small"
            variant="cute"
          >
            ➡️🎀
          </CuteButton>
        </Controls>

        <ProgressSection>
          <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
          <CuteProgressBar
            progress={progress}
            onSeek={handleSeek}
            isPlaying={isPlaying}
          />
          <TimeDisplay>{formatTime(duration)}</TimeDisplay>
        </ProgressSection>

        <CuteVolumeSlider
          volume={volume}
          onChange={onVolumeChange}
        />
      </PlayerContent>
    </PlayerContainer>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
