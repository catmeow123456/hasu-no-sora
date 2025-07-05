import React, { useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0;
`;

const PlaybackControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-size: 16px;
  
  ${props => props.$variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${theme.colors.secondary};
      transform: scale(1.05);
    }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.primary};
    }
  `}
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  min-width: 120px;
`;

const TimeSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.border};
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    
    &:hover {
      background: ${theme.colors.secondary};
      transform: scale(1.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: none;
    transition: all ${theme.transitions.fast};
    
    &:hover {
      background: ${theme.colors.secondary};
      transform: scale(1.2);
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const InsertButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface TimelineControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onInsertLyric: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
  onInsertLyric
}) => {
  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 处理时间滑块变化
  const handleTimeSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    onSeek(newTime);
  }, [onSeek]);

  // 跳转到指定时间偏移
  const seekRelative = useCallback((offset: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + offset));
    onSeek(newTime);
  }, [currentTime, duration, onSeek]);

  return (
    <ControlsContainer>
      <PlaybackControls>
        <ControlButton
          onClick={() => seekRelative(-10)}
          title="后退10秒"
          disabled={duration === 0}
        >
          ⏪
        </ControlButton>
        
        <ControlButton
          $variant="primary"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? '暂停' : '播放'}
          disabled={duration === 0}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </ControlButton>
        
        <ControlButton
          onClick={() => seekRelative(10)}
          title="前进10秒"
          disabled={duration === 0}
        >
          ⏩
        </ControlButton>
      </PlaybackControls>

      <TimeDisplay>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeDisplay>

      <TimeSlider
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={handleTimeSliderChange}
        disabled={duration === 0}
      />

      <ActionButtons>
        <InsertButton
          onClick={onInsertLyric}
          title="在当前播放位置插入歌词 (Ctrl+T)"
          disabled={duration === 0}
        >
          插入歌词
        </InsertButton>
      </ActionButtons>
    </ControlsContainer>
  );
};

TimelineControls.displayName = 'TimelineControls';
