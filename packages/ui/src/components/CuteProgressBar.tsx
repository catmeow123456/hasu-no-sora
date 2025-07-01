import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';

// 优化的彩虹流动动画 - 使用 transform 替代 background-position
const rainbowFlow = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// 简化的闪烁动画
const sparkle = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

// 优化的脉冲动画 - 减小缩放幅度
const pulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.15); }
`;

const ProgressContainer = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  will-change: height;
  
  &:hover {
    height: 10px;
    transition: height ${theme.transitions.fast};
  }
`;

const ProgressTrack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 179, 186, 0.3),
    rgba(255, 170, 165, 0.3),
    rgba(255, 209, 220, 0.3)
  );
  border-radius: ${theme.borderRadius.full};
`;

const ProgressBar = styled.div<{ $progress: number; $isPlaying?: boolean }>`
  height: 100%;
  background: linear-gradient(90deg, #FF9A8B, #FFB3BA, #FFAAA5);
  border-radius: ${theme.borderRadius.full};
  width: ${props => props.$progress}%;
  transition: width 0.1s ease-out;
  position: relative;
  overflow: hidden;
  will-change: width;
  
  ${props => props.$isPlaying && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.3), 
        rgba(255, 255, 255, 0.1), 
        rgba(255, 255, 255, 0.3)
      );
      animation: ${rainbowFlow} 2s linear infinite;
    }
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -2px;
    width: 4px;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent);
    border-radius: 50%;
    animation: ${sparkle} 1.5s ease-in-out infinite;
  }
`;

const ProgressThumb = styled.div<{ $position: number; $visible: boolean; $isDragging: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => props.$position}%;
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
    animation: ${pulse} 0.8s ease-in-out infinite;
  }
  
  &::before {
    content: '🌸';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 8px;
    opacity: 0.8;
  }
`;

const FloatingNotes = styled.div<{ $progress: number; $isPlaying?: boolean }>`
  position: absolute;
  top: -20px;
  left: ${props => Math.max(0, props.$progress - 5)}%;
  width: 40px;
  height: 20px;
  pointer-events: none;
  opacity: ${props => props.$isPlaying ? 1 : 0};
  transition: all ${theme.transitions.normal};
`;

const MusicNote = styled.div<{ $delay: number }>`
  position: absolute;
  font-size: 12px;
  color: ${theme.colors.primary};
  animation: ${sparkle} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  
  &:nth-child(1) { left: 0; top: 0; }
  &:nth-child(2) { left: 15px; top: 5px; }
  &:nth-child(3) { left: 30px; top: 2px; }
`;

interface CuteProgressBarProps {
  progress: number; // 0-100
  onSeek?: (percentage: number) => void;
  isPlaying?: boolean;
  className?: string;
}

export const CuteProgressBar: React.FC<CuteProgressBarProps> = React.memo(({
  progress,
  onSeek,
  isPlaying = false,
  className
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [thumbPosition, setThumbPosition] = React.useState(progress);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragStartRef = React.useRef<number>(0);

  // 计算鼠标位置对应的百分比
  const getPercentageFromEvent = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    return Math.max(0, Math.min(100, percentage));
  }, []);

  // 处理点击跳转
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || isDragging) return;
    const percentage = getPercentageFromEvent(e);
    onSeek(percentage);
  }, [onSeek, isDragging, getPercentageFromEvent]);

  // 开始拖拽
  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = Date.now();
    const percentage = getPercentageFromEvent(e);
    setThumbPosition(percentage);
  }, [getPercentageFromEvent]);

  // 拖拽中
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const percentage = getPercentageFromEvent(e);
      setThumbPosition(percentage);
      // 拖拽时实时更新音频位置
      if (onSeek) {
        onSeek(percentage);
      }
    } else if (isHovered) {
      // 悬停时更新拖拽球位置，但不跳转音频
      const percentage = getPercentageFromEvent(e);
      setThumbPosition(percentage);
    }
  }, [isDragging, isHovered, getPercentageFromEvent, onSeek]);

  // 结束拖拽
  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      const dragDuration = Date.now() - dragStartRef.current;
      // 如果拖拽时间很短，视为点击
      if (dragDuration < 150) {
        // 点击逻辑已在 mousedown 中处理
      }
      setIsDragging(false);
    }
  }, [isDragging]);

  // 鼠标进入
  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    if (!isDragging) {
      setThumbPosition(progress);
    }
  }, [progress, isDragging]);

  // 鼠标离开
  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
    if (!isDragging) {
      setThumbPosition(progress);
    }
  }, [progress, isDragging]);

  // 全局鼠标事件处理
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const percentage = (mouseX / rect.width) * 100;
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        setThumbPosition(clampedPercentage);
        if (onSeek) {
          onSeek(clampedPercentage);
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, onSeek]);

  // 同步播放进度到拖拽球位置
  React.useEffect(() => {
    if (!isDragging && !isHovered) {
      setThumbPosition(progress);
    }
  }, [progress, isDragging, isHovered]);

  return (
    <ProgressContainer
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <ProgressTrack />
      <ProgressBar $progress={progress} $isPlaying={isPlaying} />
      <ProgressThumb 
        $position={thumbPosition} 
        $visible={isHovered || isDragging}
        $isDragging={isDragging}
      />
      <FloatingNotes $progress={progress} $isPlaying={isPlaying}>
        <MusicNote $delay={0}>🎵</MusicNote>
        <MusicNote $delay={0.3}>🎶</MusicNote>
        <MusicNote $delay={0.6}>♪</MusicNote>
      </FloatingNotes>
    </ProgressContainer>
  );
});

CuteProgressBar.displayName = 'CuteProgressBar';
