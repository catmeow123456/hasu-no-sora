import styled, { css, keyframes } from 'styled-components';
import { theme, getSingerColorForState } from '../styles/theme';

// 歌词行淡入动画
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 共享的基础样式
export const sharedLyricsStyles = {
  // 背景样式 - 明亮清新的背景设计
  backgroundGradient: css`
    background: linear-gradient(135deg, 
      ${theme.colors.surfaceHover}f0, 
      ${theme.colors.background}f5,
      ${theme.colors.border}e8
    );
    backdrop-filter: blur(20px) saturate(1.2);
  `,
  
  // 边框样式
  borderStyle: css`
    border-top: 3px solid ${theme.colors.primary}60;
    border-left: 1px solid ${theme.colors.primary}20;
    border-right: 1px solid ${theme.colors.primary}20;
  `,
  
  // 阴影样式
  shadowStyle: css`
    box-shadow: 
      ${theme.shadows.xl},
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      0 0 30px rgba(255, 122, 89, 0.15);
  `,
  
  // 顶部高光效果
  topHighlight: css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent, 
        ${theme.colors.primary}80, 
        transparent
      );
    }
  `
};

// 统一的歌手分段组件
export const SingerSegment = styled.span<{ 
  $singer?: string; 
  $isCurrent?: boolean;
  $mode?: 'preview' | 'fullscreen';
}>`
  color: ${props => getSingerColorForState(props.$singer, props.$isCurrent)};
  font-weight: ${props => props.$isCurrent ? '700' : '500'};
  font-size: ${props => {
    if (props.$mode === 'preview') {
      return props.$isCurrent ? theme.fontSizes.lg : theme.fontSizes.base;
    }
    return 'inherit';
  }};
  transition: color 0.3s ease;
  
  /* 为有歌手标记的文本添加轻微的文字阴影增强可读性 */
  ${props => props.$singer && css`
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  `}
`;

// 统一的歌词行基础样式
export const baseLyricLineStyles = css<{ 
  $isCurrent?: boolean; 
  $mode?: 'preview' | 'fullscreen';
}>`
  font-weight: ${props => props.$isCurrent ? '700' : (props.$mode === 'preview' ? '500' : '400')};
  opacity: ${props => props.$isCurrent ? 1 : 0.90};
  transition: all ${theme.transitions.fast};
  animation: ${fadeIn} 0.5s ease-out;
  
  /* 当前行突出样式 */
  ${props => props.$isCurrent && css`
    background: linear-gradient(135deg, 
      ${theme.colors.primary}08, 
      ${theme.colors.secondary}06
    );
    box-shadow: 0 2px 8px ${theme.colors.shadow};
    
    ${props.$mode === 'fullscreen' && css`
      padding: ${theme.spacing.md} ${theme.spacing.lg};
    `}
    
    ${props.$mode === 'preview' && css`
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      border-radius: ${theme.borderRadius.sm};
    `}
  `}
`;

// 预览模式的歌词行
export const PreviewLyricLine = styled.div<{ $isCurrent?: boolean }>`
  ${baseLyricLineStyles}
  font-size: ${props => props.$isCurrent ? theme.fontSizes.lg : theme.fontSizes.base};
  color: ${props => props.$isCurrent ? theme.colors.text.primary : theme.colors.text.secondary};
  line-height: 1.4;
  text-align: center;
`;

// 全屏模式的歌词行
export const FullscreenLyricLine = styled.div<{ $isCurrent: boolean; $isPast: boolean }>`
  ${baseLyricLineStyles}
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin: ${theme.spacing.xs} 0;
  font-size: ${theme.fontSizes.lg};
  line-height: 1.6;
  text-align: center;
  border-radius: ${theme.borderRadius.md};
  
  /* 空行处理 */
  ${props => !props.children && css`
    height: ${theme.spacing.lg};
  `}
`;

// 统一的容器样式
export const LyricsContainerBase = styled.div<{ 
  $isEmbedded?: boolean;
  $mode?: 'preview' | 'fullscreen';
}>`
  ${sharedLyricsStyles.backgroundGradient}
  ${sharedLyricsStyles.borderStyle}
  ${sharedLyricsStyles.shadowStyle}
  overflow: hidden;
  position: relative;
  
  ${props => props.$isEmbedded ? css`
    position: relative;
    height: 100%;
    border-radius: 0;
  ` : css`
    position: fixed;
    top: 80px; /* Header 下方 */
    left: 0;
    right: 0;
    bottom: 120px; /* AudioPlayer 上方 */
    z-index: 100;
    border-bottom: 2px solid ${theme.colors.primary}50;
  `}
  
  /* 增强视觉层次感 */
  ${sharedLyricsStyles.topHighlight}
`;

// 统一的标题样式
export const LyricsTitle = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
  background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// 统一的头部样式
export const LyricsHeader = styled.div`
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

// 统一的滚动区域样式
export const LyricsScrollArea = styled.div`
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

// 空状态样式
export const EmptyState = styled.div`
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

export const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

// 提示文本样式
export const HintText = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  opacity: 0.7;
  margin-top: ${theme.spacing.xs};
  text-align: center;
`;

// 预览内容容器
export const PreviewContent = styled.div`
  padding: ${theme.spacing.md};
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

// 渲染歌词分段的通用函数类型定义
export interface LyricLineData {
  text: string;
  segments?: Array<{ text: string; singer?: string }>;
}

// 渲染歌词分段的通用函数
export const createLyricSegments = (
  line: LyricLineData,
  isCurrent: boolean = false,
  mode: 'preview' | 'fullscreen' = 'fullscreen'
) => {
  // 如果没有分段信息，回退到显示完整文本
  if (!line.segments || line.segments.length === 0) {
    return [{
      key: 'single',
      singer: undefined,
      text: line.text || (mode === 'fullscreen' ? '\u00A0' : ''),
      isCurrent,
      mode
    }];
  }

  // 返回多个分段数据
  return line.segments.map((segment, segmentIndex) => ({
    key: segmentIndex.toString(),
    singer: segment.singer,
    text: segment.text + (segmentIndex < line.segments!.length - 1 ? ' ' : ''),
    isCurrent,
    mode
  }));
};
