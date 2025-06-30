import React from 'react';
import styled, { keyframes } from 'styled-components';
import { PlayerState } from '../types';
import { theme } from '../styles/theme';
import { CuteButton } from './CuteButton';
import { CuteProgressBar } from './CuteProgressBar';
import { CuteVolumeSlider } from './CuteVolumeSlider';

// 发光动画
const glow = keyframes`
  0%, 100% { box-shadow: ${theme.shadows.xl}; }
  50% { box-shadow: ${theme.shadows.xl}, 0 0 20px rgba(255, 154, 139, 0.3); }
`;

// 音符飘动动画
const noteFloat = keyframes`
  0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
  100% { transform: translateY(0px) rotate(360deg); opacity: 0.7; }
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
  animation: ${glow} 4s ease-in-out infinite;
  backdrop-filter: blur(15px);
  z-index: 1000;
  overflow: hidden;
  
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
  animation: ${props => props.$isPlaying ? noteFloat : 'none'} 3s ease-in-out infinite;
  pointer-events: none;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ControlButton = styled.button<{ primary?: boolean }>`
  width: ${props => props.primary ? '48px' : '40px'};
  height: ${props => props.primary ? '48px' : '40px'};
  border-radius: ${theme.borderRadius.full};
  border: none;
  background: ${props => props.primary ? theme.gradients.primary : theme.colors.surfaceHover};
  color: ${props => props.primary ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.primary ? theme.fontSizes.lg : theme.fontSizes.base};
  transition: all ${theme.transitions.fast};
  box-shadow: ${props => props.primary ? theme.shadows.md : 'none'};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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

const ProgressContainer = styled.div`
  flex: 1;
  height: 6px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.full};
  width: ${props => props.progress}%;
  transition: width 0.1s ease-out;
`;

const VolumeSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 120px;
`;

const VolumeSlider = styled.input`
  flex: 1;
  height: 4px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
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

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  playerState,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  formatTime
}) => {
  const { currentTrack, currentAlbum, isPlaying, currentTime, duration, volume } = playerState;

  if (!currentTrack || !currentAlbum) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  // 检查是否有上一首/下一首
  const currentIndex = currentAlbum.tracks.findIndex(track => track.id === currentTrack.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < currentAlbum.tracks.length - 1;

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
            disabled={!hasPrevious}
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
            disabled={!hasNext}
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
            onSeek={(percentage) => onSeek((percentage / 100) * duration)}
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
};
