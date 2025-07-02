import React, { useRef, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import type { Lyrics, LyricLine } from '../types';
import { theme } from '../styles/theme';
import { CuteLoadingSpinner } from './CuteLoadingSpinner';
import {
  LyricsContainerBase,
  LyricsHeader,
  LyricsTitle,
  LyricsScrollArea,
  FullscreenLyricLine,
  EmptyState,
  EmptyIcon,
  SingerSegment
} from './LyricsStyles';

// 全屏模式的容器样式
const LyricsContainer = styled(LyricsContainerBase)`
  display: flex;
  flex-direction: column;
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
          <FullscreenLyricLine
            key={index}
            ref={index === currentLineIndex ? currentLineRef : undefined}
            $isCurrent={index === currentLineIndex}
            $isPast={index < currentLineIndex}
          >
            {renderLyricSegments(line, index === currentLineIndex)}
          </FullscreenLyricLine>
        ))}
        {/* 底部留白，确保最后一行可以滚动到中央 */}
        <div style={{ height: '50vh' }} />
      </LyricsScrollArea>
    </LyricsContainer>
  );
});

LyricsDisplay.displayName = 'LyricsDisplay';
