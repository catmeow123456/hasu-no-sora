import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

// 旋转动画
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 弹跳动画
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

// 闪烁动画
const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

// 彩虹渐变动画
const rainbow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

const SpinnerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #FF9A8B, #FFB3BA, #FFAAA5, #FFD1DC);
  background-size: 300% 300%;
  animation: ${spin} 2s linear infinite, ${rainbow} 3s ease infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: ${theme.colors.background};
    border-radius: 50%;
  }
  
  &::after {
    content: '🌸';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    animation: ${bounce} 1.5s ease-in-out infinite;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  pointer-events: none;
`;

const FloatingElement = styled.div<{ 
  $top: string; 
  $left: string; 
  $delay: number; 
  $size: string;
}>`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  font-size: ${props => props.$size};
  animation: ${twinkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

const LoadingText = styled.div`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  background: linear-gradient(45deg, #FF9A8B, #FFB3BA, #FFAAA5);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${rainbow} 3s ease infinite;
  text-align: center;
`;

const SubText = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  opacity: 0.8;
  margin-top: ${theme.spacing.xs};
`;

const DotsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  animation: ${bounce} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

interface CuteLoadingSpinnerProps {
  text?: string;
  subText?: string;
}

export const CuteLoadingSpinner: React.FC<CuteLoadingSpinnerProps> = ({
  text = "加载中...",
  subText = "正在为您准备美妙的音乐 ♪"
}) => {
  const floatingElements = [
    { emoji: '✨', top: '10%', left: '20%', delay: 0, size: '16px' },
    { emoji: '🎵', top: '20%', left: '80%', delay: 0.5, size: '14px' },
    { emoji: '💫', top: '80%', left: '15%', delay: 1, size: '18px' },
    { emoji: '🎶', top: '85%', left: '85%', delay: 1.5, size: '16px' },
    { emoji: '⭐', top: '50%', left: '10%', delay: 0.8, size: '12px' },
    { emoji: '🌟', top: '30%', left: '90%', delay: 1.2, size: '14px' },
  ];

  return (
    <LoadingContainer>
      <SpinnerContainer>
        <MainSpinner />
        <FloatingElements>
          {floatingElements.map((element, index) => (
            <FloatingElement
              key={index}
              $top={element.top}
              $left={element.left}
              $delay={element.delay}
              $size={element.size}
            >
              {element.emoji}
            </FloatingElement>
          ))}
        </FloatingElements>
      </SpinnerContainer>
      
      <div>
        <LoadingText>{text}</LoadingText>
        <SubText>{subText}</SubText>
        <DotsContainer>
          <Dot $delay={0} />
          <Dot $delay={0.2} />
          <Dot $delay={0.4} />
        </DotsContainer>
      </div>
    </LoadingContainer>
  );
};
