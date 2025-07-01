import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

// 音符跳动动画
const noteJump = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-3px) scale(1.1); }
`;

// 音量波纹动画
const volumeWave = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 120px;
  position: relative;
`;

const VolumeIcon = styled.div<{ $volume: number }>`
  font-size: ${theme.fontSizes.base};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  animation: ${props => props.$volume > 0 ? noteJump : 'none'} 2s ease-in-out infinite;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const SliderContainer = styled.div`
  flex: 1;
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 6px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  position: relative;
  overflow: hidden;
`;

const SliderFill = styled.div<{ $volume: number }>`
  height: 100%;
  width: ${props => props.$volume * 100}%;
  background: linear-gradient(90deg, #FF9A8B, #FFB3BA, #FFAAA5);
  border-radius: ${theme.borderRadius.full};
  transition: width ${theme.transitions.fast};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 154, 139, 0.5);
  }
`;

const VolumeThumb = styled.div<{ $volume: number; $visible: boolean; $isDragging: boolean }>`
  position: absolute;
  left: ${props => props.$volume * 100}%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #FF9A8B, #FFB3BA);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: ${props => props.$isDragging 
    ? 'opacity 0.1s ease-out' 
    : 'opacity 0.15s ease-out, left 0.1s ease-out'
  };
  box-shadow: ${theme.shadows.md};
  will-change: transform, left, opacity;
  transform-origin: center;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  &::before {
    content: '🎵';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 6px;
    opacity: 0.8;
  }
`;

const VolumeWaves = styled.div<{ $volume: number }>`
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 2px;
  opacity: ${props => props.$volume > 0 ? 1 : 0.3};
  transition: opacity ${theme.transitions.fast};
`;

const VolumeWave = styled.div<{ $delay: number; $active: boolean }>`
  width: 3px;
  height: ${props => props.$active ? '12px' : '6px'};
  background: ${props => props.$active ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  animation: ${props => props.$active ? volumeWave : 'none'} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  transition: all ${theme.transitions.fast};
`;

interface CuteVolumeSliderProps {
  volume: number; // 0-1
  onChange: (volume: number) => void;
  className?: string;
}

export const CuteVolumeSlider: React.FC<CuteVolumeSliderProps> = React.memo(({
  volume,
  onChange,
  className
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [previousVolume, setPreviousVolume] = React.useState(volume);
  const [thumbPosition, setThumbPosition] = React.useState(volume);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 计算鼠标位置对应的音量值
  const getVolumeFromEvent = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const volumeValue = clickX / rect.width;
    return Math.max(0, Math.min(1, volumeValue));
  }, []);

  // 处理点击调节音量
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const newVolume = getVolumeFromEvent(e);
    onChange(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, [isDragging, getVolumeFromEvent, onChange]);

  // 开始拖拽
  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const newVolume = getVolumeFromEvent(e);
    setThumbPosition(newVolume);
    onChange(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, [getVolumeFromEvent, onChange]);

  // 拖拽中
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newVolume = getVolumeFromEvent(e);
      setThumbPosition(newVolume);
      onChange(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
      }
    } else if (isHovered) {
      // 悬停时更新拖拽球位置预览
      const newVolume = getVolumeFromEvent(e);
      setThumbPosition(newVolume);
    }
  }, [isDragging, isHovered, getVolumeFromEvent, onChange]);

  // 结束拖拽
  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // 鼠标进入
  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    if (!isDragging) {
      setThumbPosition(volume);
    }
  }, [volume, isDragging]);

  // 鼠标离开
  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
    if (!isDragging) {
      setThumbPosition(volume);
    }
  }, [volume, isDragging]);

  // 全局鼠标事件处理
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const volumeValue = mouseX / rect.width;
        const clampedVolume = Math.max(0, Math.min(1, volumeValue));
        setThumbPosition(clampedVolume);
        onChange(clampedVolume);
        if (clampedVolume > 0) {
          setIsMuted(false);
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, onChange]);

  // 同步音量到拖拽球位置
  React.useEffect(() => {
    if (!isDragging && !isHovered) {
      setThumbPosition(volume);
    }
  }, [volume, isDragging, isHovered]);

  // 音量图标点击切换静音
  const handleIconClick = React.useCallback(() => {
    if (isMuted || volume === 0) {
      // 取消静音
      const volumeToRestore = previousVolume > 0 ? previousVolume : 0.5;
      onChange(volumeToRestore);
      setIsMuted(false);
    } else {
      // 静音
      setPreviousVolume(volume);
      onChange(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume, onChange]);

  const getVolumeIcon = React.useCallback(() => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  }, [isMuted, volume]);

  // 音量波纹显示逻辑
  const waves = React.useMemo(() => [
    { active: volume > 0.2, delay: 0 },
    { active: volume > 0.4, delay: 0.2 },
    { active: volume > 0.6, delay: 0.4 },
    { active: volume > 0.8, delay: 0.6 },
  ], [volume]);

  return (
    <VolumeContainer 
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <VolumeIcon $volume={volume} onClick={handleIconClick}>
        {getVolumeIcon()}
      </VolumeIcon>
      
      <SliderContainer
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
      >
        <SliderTrack>
          <SliderFill $volume={volume} />
        </SliderTrack>
        <VolumeThumb 
          $volume={thumbPosition} 
          $visible={isHovered || isDragging}
          $isDragging={isDragging}
        />
      </SliderContainer>
      
      <VolumeWaves $volume={volume}>
        {waves.map((wave, index) => (
          <VolumeWave
            key={index}
            $delay={wave.delay}
            $active={wave.active}
          />
        ))}
      </VolumeWaves>
    </VolumeContainer>
  );
});

CuteVolumeSlider.displayName = 'CuteVolumeSlider';
