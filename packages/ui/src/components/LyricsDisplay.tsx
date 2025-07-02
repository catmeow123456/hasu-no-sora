import React, { useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { Lyrics, LyricLine, LyricSegment } from '../types';
import { theme, getSingerColorForState } from '../styles/theme';
import { CuteLoadingSpinner } from './CuteLoadingSpinner';

// 歌词行淡入动画
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LyricsContainer = styled.div<{ $isEmbedded?: boolean }>`
  ${props => props.$isEmbedded ? css`
    position: relative;
    height: 100%;
  ` : css`
    position: fixed;
    top: 80px; /* Header 下方 */
    left: 0;
    right: 0;
    bottom: 120px; /* AudioPlayer 上方 */
    z-index: 100;
  `}
  
  /* 明亮清新的背景设计 */
  background: linear-gradient(135deg, 
    ${theme.colors.surface}f8, 
    ${theme.colors.background}fa,
    ${theme.colors.surfaceHover}f8
  );
  backdrop-filter: blur(15px) saturate(1.1);
  border-top: 2px solid ${theme.colors.primary}50;
  border-bottom: 2px solid ${theme.colors.primary}50;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 20px rgba(255, 122, 89, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const LyricsHeader = styled.div`
  padding: ${theme.spacing.md};
  background: linear-gradient(90deg, 
    ${theme.colors.primary}15, 
    ${theme.colors.secondary}15,
    ${theme.colors.accent}12
  );
  border-bottom: 1px solid ${theme.colors.primary}30;
  text-align: center;
  position: relative;
  
  /* 增加顶部高光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.5), 
      transparent
    );
  }
`;

const LyricsTitle = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
  background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LyricsScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  scroll-behavior: smooth;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surface}40;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.accent});
  }
`;

const LyricLine = styled.div<{ $isCurrent: boolean; $isPast: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin: ${theme.spacing.xs} 0;
  font-size: ${theme.fontSizes.lg};
  line-height: 1.6;
  text-align: center;
  border-radius: ${theme.borderRadius.md};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  
  /* 当前行突出样式 */
  ${props => props.$isCurrent && css`
    font-weight: 700; /* 增强字体权重 */
    background: linear-gradient(135deg, 
      ${theme.colors.primary}08, 
      ${theme.colors.secondary}06
    ); /* 温暖的背景渐变 */
    padding: ${theme.spacing.md} ${theme.spacing.lg}; /* 增加内边距 */
    box-shadow: 0 2px 8px ${theme.colors.shadow}; /* 柔和阴影 */
    /* 移除 scale 变换，避免横向滚动条 */
  `}
  
  /* 非当前行样式 */
  ${props => !props.$isCurrent && css`
    font-weight: 400;
    opacity: 0.90; /* 适度降低透明度，保持可读性 */
  `}
  
  /* 空行处理 */
  ${props => !props.children && css`
    height: ${theme.spacing.lg};
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.lg};
  text-align: center;
  gap: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

// 歌手分段组件 - 增强版本，与 LyricLine 字体权重保持一致
const SingerSegment = styled.span<{ $singer?: string; $isCurrent?: boolean }>`
  color: ${props => getSingerColorForState(props.$singer, props.$isCurrent)};
  font-weight: ${props => props.$isCurrent ? '700' : '400'};
  transition: color 0.3s ease;
`;

interface LyricsDisplayProps {
  lyrics: Lyrics | null;
  currentTime: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  trackTitle?: string;
  isEmbedded?: boolean; // 新增：是否为嵌入模式
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = React.memo(({
  lyrics,
  currentTime,
  isPlaying,
  isLoading,
  error,
  trackTitle,
  isEmbedded = false
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  // 计算当前行索引
  const getCurrentLineIndex = (time: number): number => {
    if (!lyrics || lyrics.lines.length === 0) return -1;

    let result = -1;
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (lyrics.lines[i].time <= time) {
        result = i;
      } else {
        break;
      }
    }
    return result;
  };

  const currentLineIndex = getCurrentLineIndex(currentTime);

  // 渲染歌词行的分段内容
  const renderLyricSegments = useCallback((line: LyricLine, isCurrent: boolean) => {
    // 如果没有分段信息，回退到显示完整文本
    if (!line.segments || line.segments.length === 0) {
      return <SingerSegment $isCurrent={isCurrent}>{line.text || '\u00A0'}</SingerSegment>;
    }

    // 渲染多个分段
    return (
      <>
        {line.segments.map((segment, segmentIndex) => (
          <SingerSegment key={segmentIndex} $singer={segment.singer} $isCurrent={isCurrent}>
            {segment.text}
            {segmentIndex < line.segments.length - 1 ? ' ' : ''}
          </SingerSegment>
        ))}
      </>
    );
  }, []);

  // 滚动到当前行的函数
  const scrollToCurrentLine = useCallback(() => {
    if (currentLineRef.current && scrollAreaRef.current) {
      const container = scrollAreaRef.current;
      const currentLine = currentLineRef.current;
      
      const containerHeight = container.clientHeight;
      const lineTop = currentLine.offsetTop;
      const lineHeight = currentLine.clientHeight;
      
      // 计算滚动位置，让当前行显示在容器中央
      const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // 播放时的实时滚动
  useEffect(() => {
    if (currentLineIndex >= 0 && isPlaying) {
      const timer = setTimeout(scrollToCurrentLine, 50);
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, isPlaying, scrollToCurrentLine]);

  // 嵌入模式初始化滚动 - 只在首次进入嵌入模式时执行
  useEffect(() => {
    if (isEmbedded && currentLineIndex >= 0) {
      // 使用 Intersection Observer 检测容器是否可见
      const container = scrollAreaRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // 容器可见且大部分显示时才滚动
            setTimeout(() => {
              scrollToCurrentLine();
            }, 100);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(container);
      
      // 备用方案：如果 Intersection Observer 不触发，延迟滚动
      const fallbackTimer = setTimeout(() => {
        scrollToCurrentLine();
        observer.disconnect();
      }, 600);

      return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
      };
    }
  }, [isEmbedded]); // 只依赖 isEmbedded，避免频繁触发

  // 加载状态
  if (isLoading) {
    return (
      <LyricsContainer $isEmbedded={isEmbedded}>
        <LyricsHeader>
          <LyricsTitle>加载歌词中...</LyricsTitle>
        </LyricsHeader>
        <EmptyState>
          <CuteLoadingSpinner />
        </EmptyState>
      </LyricsContainer>
    );
  }

  // 错误状态
  if (error) {
    return (
      <LyricsContainer $isEmbedded={isEmbedded}>
        <LyricsHeader>
          <LyricsTitle>歌词加载失败</LyricsTitle>
        </LyricsHeader>
        <EmptyState>
          <EmptyIcon>😢</EmptyIcon>
          <div>{error}</div>
        </EmptyState>
      </LyricsContainer>
    );
  }

  // 无歌词状态
  if (!lyrics || !lyrics.hasLyrics || lyrics.lines.length === 0) {
    return (
      <LyricsContainer $isEmbedded={isEmbedded}>
        <LyricsHeader>
          <LyricsTitle>{trackTitle || '当前歌曲'}</LyricsTitle>
        </LyricsHeader>
        <EmptyState>
          <EmptyIcon>🎵</EmptyIcon>
          <div>暂无歌词</div>
          <div style={{ fontSize: theme.fontSizes.sm, opacity: 0.7 }}>
            いま、この瞬間を大切に。Bloom the smile, Bloom the dream. ♪
          </div>
        </EmptyState>
      </LyricsContainer>
    );
  }

  return (
    <LyricsContainer $isEmbedded={isEmbedded}>
      <LyricsHeader>
        <LyricsTitle>{trackTitle || '歌词'}</LyricsTitle>
      </LyricsHeader>
      <LyricsScrollArea ref={scrollAreaRef}>
        {lyrics.lines.map((line, index) => (
          <LyricLine
            key={index}
            ref={index === currentLineIndex ? currentLineRef : undefined}
            $isCurrent={index === currentLineIndex}
            $isPast={index < currentLineIndex}
          >
            {renderLyricSegments(line, index === currentLineIndex)}
          </LyricLine>
        ))}
        {/* 底部留白，确保最后一行可以滚动到中央 */}
        <div style={{ height: '50vh' }} />
      </LyricsScrollArea>
    </LyricsContainer>
  );
});

LyricsDisplay.displayName = 'LyricsDisplay';
