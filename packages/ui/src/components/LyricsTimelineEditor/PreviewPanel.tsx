import React, { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useLyricSegmentRenderer, getCurrentLineIndex } from '../shared/LyricsSegments';
import type { EditableLyricLine } from './types';

const PanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.surfaceHover};
`;

const Header = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
`;

const Title = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surface}40;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
`;

const LyricLine = styled.div<{ $isCurrent: boolean; $isPast: boolean }>`
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.base};
  line-height: 1.5;
  transition: all ${theme.transitions.fast};
  
  ${props => props.$isCurrent && `
    background: linear-gradient(135deg, 
      ${theme.colors.primary}15, 
      ${theme.colors.secondary}10
    );
    font-weight: 600;
    border-left: 3px solid ${theme.colors.primary};
    padding-left: ${theme.spacing.md};
  `}
  
  ${props => !props.$isCurrent && `
    opacity: ${props.$isPast ? 0.6 : 0.8};
    font-weight: 400;
  `}
`;

const TimeStamp = styled.span`
  font-family: monospace;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  margin-right: ${theme.spacing.sm};
  opacity: 0.7;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.text.secondary};
  text-align: center;
  gap: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const Stats = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  justify-content: space-between;
`;

interface PreviewPanelProps {
  lyrics: EditableLyricLine[];
  currentTime: number;
  isPlaying: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  lyrics,
  currentTime,
  isPlaying
}) => {
  const renderLyricSegments = useLyricSegmentRenderer();

  // 转换为标准格式以使用共享函数
  const lyricsData = useMemo(() => ({
    lines: lyrics,
    hasLyrics: lyrics.length > 0
  }), [lyrics]);

  const currentLineIndex = getCurrentLineIndex(lyricsData, currentTime);

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // 统计信息
  const stats = useMemo(() => {
    const totalLines = lyrics.length;
    const linesWithSingers = lyrics.filter(line => 
      line.segments.some(segment => segment.singer || segment.singers)
    ).length;
    const totalDuration = lyrics.length > 0 ? 
      Math.max(...lyrics.map(line => line.time)) : 0;

    return {
      totalLines,
      linesWithSingers,
      totalDuration: formatTime(totalDuration)
    };
  }, [lyrics]);

  if (lyrics.length === 0) {
    return (
      <PanelContainer>
        <Header>
          <Title>
            📖 实时预览
          </Title>
        </Header>
        <EmptyState>
          <EmptyIcon>🎵</EmptyIcon>
          <div>暂无歌词</div>
          <div style={{ fontSize: theme.fontSizes.sm, opacity: 0.7 }}>
            开始添加歌词来查看实时预览效果
          </div>
        </EmptyState>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <Header>
        <Title>
          📖 实时预览
          {isPlaying && <span style={{ color: theme.colors.primary }}>●</span>}
        </Title>
      </Header>
      
      <Content>
        {lyrics.map((line, index) => (
          <LyricLine
            key={line.id}
            $isCurrent={index === currentLineIndex}
            $isPast={index < currentLineIndex}
          >
            <TimeStamp>[{formatTime(line.time)}]</TimeStamp>
            {(() => {
              try {
                if (line.segments && line.segments.length > 0) {
                  return renderLyricSegments(line, index === currentLineIndex);
                } else {
                  return line.text || <span style={{ color: theme.colors.text.muted }}>空行</span>;
                }
              } catch (error) {
                console.error('Error rendering lyric segments:', error);
                return <span style={{ color: theme.colors.text.muted }}>{line.text || '渲染错误'}</span>;
              }
            })()}
          </LyricLine>
        ))}
        
        {/* 底部留白，确保最后一行可以滚动到顶部 */}
        <div style={{ height: '50vh' }} />
      </Content>
      
      <Stats>
        <span>总行数: {stats.totalLines}</span>
        <span>带歌手标记: {stats.linesWithSingers}</span>
        <span>总时长: {stats.totalDuration}</span>
      </Stats>
    </PanelContainer>
  );
};

PreviewPanel.displayName = 'PreviewPanel';
