import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

// 彩虹流动动画
const rainbowFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 闪烁动画
const sparkle = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// 脉冲动画
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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
  background: linear-gradient(
    90deg,
    #FF9A8B,
    #FFB3BA,
    #FFAAA5,
    #FFD1DC,
    #FF9A8B
  );
  background-size: 300% 100%;
  border-radius: ${theme.borderRadius.full};
  width: ${props => props.$progress}%;
  transition: width 0.1s ease-out;
  position: relative;
  overflow: hidden;
  
  animation: ${props => props.$isPlaying ? rainbowFlow : 'none'} 3s ease infinite;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -4px;
    width: 8px;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
    border-radius: 50%;
    animation: ${sparkle} 2s ease-in-out infinite;
  }
`;

const ProgressThumb = styled.div<{ $progress: number; $visible: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => props.$progress}%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #FF9A8B, #FFB3BA);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.md};
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
    animation: ${pulse} 0.6s ease infinite;
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

export const CuteProgressBar: React.FC<CuteProgressBarProps> = ({
  progress,
  onSeek,
  isPlaying = false,
  className
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !onSeek) return;
    handleClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  return (
    <ProgressContainer
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <ProgressTrack />
      <ProgressBar $progress={progress} $isPlaying={isPlaying} />
      <ProgressThumb 
        $progress={progress} 
        $visible={isHovered || isDragging} 
      />
      <FloatingNotes $progress={progress} $isPlaying={isPlaying}>
        <MusicNote $delay={0}>🎵</MusicNote>
        <MusicNote $delay={0.3}>🎶</MusicNote>
        <MusicNote $delay={0.6}>♪</MusicNote>
      </FloatingNotes>
    </ProgressContainer>
  );
};
