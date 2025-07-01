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

const SliderInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #FF9A8B, #FFB3BA);
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: ${theme.shadows.sm};
    position: relative;
    z-index: 2;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #FF9A8B, #FFB3BA);
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: ${theme.shadows.sm};
    border: none;
  }
`;

const VolumeThumb = styled.div<{ $volume: number; $visible: boolean }>`
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
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.md};
  pointer-events: none;
  
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

export const CuteVolumeSlider: React.FC<CuteVolumeSliderProps> = ({
  volume,
  onChange,
  className
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [previousVolume, setPreviousVolume] = React.useState(volume);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onChange(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const handleIconClick = () => {
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
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  // 音量波纹显示逻辑
  const waves = [
    { active: volume > 0.2, delay: 0 },
    { active: volume > 0.4, delay: 0.2 },
    { active: volume > 0.6, delay: 0.4 },
    { active: volume > 0.8, delay: 0.6 },
  ];

  return (
    <VolumeContainer 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VolumeIcon $volume={volume} onClick={handleIconClick}>
        {getVolumeIcon()}
      </VolumeIcon>
      
      <SliderContainer>
        <SliderTrack>
          <SliderFill $volume={volume} />
        </SliderTrack>
        <SliderInput
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
        <VolumeThumb 
          $volume={volume} 
          $visible={isHovered} 
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
};
