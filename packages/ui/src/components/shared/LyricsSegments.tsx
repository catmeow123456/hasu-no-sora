import React, { useCallback } from 'react';
import styled from 'styled-components';
import { theme, getSingerColorForState, createRainbowGradient, getRainbowSingerNames } from '../../styles/theme';
import type { LyricLine } from '../../types';

// 共享的歌手分段组件
export const SingerSegment = styled.span<{ $singer?: string; $isCurrent?: boolean }>`
  color: ${props => getSingerColorForState(props.$singer, props.$isCurrent)};
  font-weight: ${props => props.$isCurrent ? '700' : '500'};
  transition: color 0.3s ease;
`;

// 共享的彩虹效果分段组件
export const RainbowSegment = styled.span<{ $gradient: string; $isCurrent?: boolean }>`
  background: ${props => props.$gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: ${props => props.$isCurrent ? '700' : '600'};
  transition: all 0.3s ease;
  
  /* 为彩虹文字添加轻微的文字阴影增强可读性 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  /* 非当前行时降低透明度 */
  opacity: ${props => props.$isCurrent ? 1 : 0.85};
  
  /* 确保在不支持 background-clip 的浏览器中有备用方案 */
  @supports not (-webkit-background-clip: text) {
    background: none;
    color: ${theme.colors.primary};
  }
`;

// 共享的歌词分段渲染函数
export const useLyricSegmentRenderer = () => {
  return useCallback((line: LyricLine, isCurrent: boolean = false) => {
    // 如果没有分段信息，回退到显示完整文本
    if (!line.segments || line.segments.length === 0) {
      return <SingerSegment $isCurrent={isCurrent}>{line.text || '\u00A0'}</SingerSegment>;
    }

    // 渲染多个分段
    return (
      <>
        {line.segments.map((segment, segmentIndex) => {
          // 检查是否为彩虹效果片段（多歌手组合）
          if (segment.isRainbow && segment.singers && segment.singers.length > 1) {
            const gradient = createRainbowGradient(segment.singers);
            return (
              <RainbowSegment 
                key={segmentIndex} 
                $gradient={gradient} 
                $isCurrent={isCurrent}
                title={`${getRainbowSingerNames(segment.singers)}: ${segment.text}`}
              >
                {segment.text}
                {segmentIndex < line.segments.length - 1 ? ' ' : ''}
              </RainbowSegment>
            );
          }
          
          // 普通单歌手片段
          return (
            <SingerSegment 
              key={segmentIndex} 
              $singer={segment.singer} 
              $isCurrent={isCurrent}
              title={segment.singer ? `${getSingerColorForState(segment.singer)}: ${segment.text}` : undefined}
            >
              {segment.text}
              {segmentIndex < line.segments.length - 1 ? ' ' : ''}
            </SingerSegment>
          );
        })}
      </>
    );
  }, []);
};

// 共享的当前行索引计算函数
export const getCurrentLineIndex = (lyrics: any, time: number): number => {
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
