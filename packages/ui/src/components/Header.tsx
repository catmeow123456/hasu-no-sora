import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

// 樱花飘落动画
const sakuraFall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

// 星星闪烁动画
const sparkle = keyframes`
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
const rainbowGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 轻微浮动动画
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const HeaderContainer = styled.div`
  position: relative;
  padding: ${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg};
  background: ${theme.gradients.background};
  overflow: hidden;
  text-align: center;
`;

const SakuraContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const SakuraPetal = styled.div<{ delay: number; duration: number; left: number }>`
  position: absolute;
  top: -20px;
  left: ${props => props.left}%;
  font-size: 20px;
  animation: ${sakuraFall} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 0.7;
`;

const TitleWrapper = styled.div`
  position: relative;
  display: inline-block;
  animation: ${float} 3s ease-in-out infinite;
`;

const MainTitle = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes['4xl']};
  font-weight: 700;
  margin: 0;
  background: linear-gradient(
    45deg,
    #FF9A8B,
    #FFB3BA,
    #FFAAA5,
    #FF9A8B,
    #FFD1DC,
    #FFB3BA
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${rainbowGlow} 3s ease infinite;
  text-shadow: 0 0 20px rgba(255, 154, 139, 0.3);
  position: relative;
  
  @media (max-width: 768px) {
    font-size: ${theme.fontSizes['3xl']};
  }
  
  @media (max-width: 480px) {
    font-size: ${theme.fontSizes['2xl']};
  }
`;

const DecorationLeft = styled.div`
  position: absolute;
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: 0.5s;
  
  @media (max-width: 768px) {
    left: -40px;
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    left: -30px;
    font-size: 16px;
  }
`;

const DecorationRight = styled.div`
  position: absolute;
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: 1s;
  
  @media (max-width: 768px) {
    right: -40px;
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    right: -30px;
    font-size: 16px;
  }
`;

const StarDecoration = styled.div<{ top: string; left: string; delay: number }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  font-size: 16px;
  animation: ${sparkle} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  pointer-events: none;
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing.sm} 0 0 0;
  font-weight: 500;
  opacity: 0.8;
`;

export const Header: React.FC = () => {
  // 生成樱花花瓣
  const sakuraPetals = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
    left: Math.random() * 100,
    emoji: ['🌸', '🌺', '💮', '🌷'][Math.floor(Math.random() * 4)]
  }));

  return (
    <HeaderContainer>
      <SakuraContainer>
        {sakuraPetals.map(petal => (
          <SakuraPetal
            key={petal.id}
            delay={petal.delay}
            duration={petal.duration}
            left={petal.left}
          >
            {petal.emoji}
          </SakuraPetal>
        ))}
      </SakuraContainer>

      <TitleWrapper>
        <DecorationLeft>✨🎵</DecorationLeft>
        <MainTitle>🌸 Hasu no Sora 音乐播放器</MainTitle>
        <DecorationRight>🎵✨</DecorationRight>
        
        <StarDecoration top="10%" left="20%" delay={0}>⭐</StarDecoration>
        <StarDecoration top="15%" left="80%" delay={0.8}>💫</StarDecoration>
        <StarDecoration top="80%" left="15%" delay={1.2}>✨</StarDecoration>
        <StarDecoration top="85%" left="85%" delay={1.8}>⭐</StarDecoration>
      </TitleWrapper>
      
      <Subtitle>いま、この瞬間を大切に。Bloom the smile, Bloom the dream. ♪</Subtitle>
    </HeaderContainer>
  );
};
