import React from 'react';
import styled from 'styled-components';
import { PlayerState } from '../types';
import { theme } from '../styles/theme';

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${theme.colors.surface};
  border-top: 2px solid ${theme.colors.border};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.xl};
  backdrop-filter: blur(10px);
  z-index: 1000;
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
`;

const TrackTitle = styled.h4`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AlbumName = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
        </TrackInfo>

        <Controls>
          <ControlButton 
            onClick={onPrevious}
            disabled={!hasPrevious}
            title="上一首"
          >
            ⏮️
          </ControlButton>
          
          <ControlButton 
            primary 
            onClick={onPlayPause}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </ControlButton>
          
          <ControlButton 
            onClick={onNext}
            disabled={!hasNext}
            title="下一首"
          >
            ⏭️
          </ControlButton>
        </Controls>

        <ProgressSection>
          <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
          <ProgressContainer onClick={handleProgressClick}>
            <ProgressBar progress={progress} />
          </ProgressContainer>
          <TimeDisplay>{formatTime(duration)}</TimeDisplay>
        </ProgressSection>

        <VolumeSection>
          <span style={{ fontSize: theme.fontSizes.sm }}>🔊</span>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </VolumeSection>
      </PlayerContent>
    </PlayerContainer>
  );
};
