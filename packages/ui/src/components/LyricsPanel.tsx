import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../styles/theme';
import { LyricsDisplay } from './LyricsDisplay';
import type { Lyrics } from '../types';

export type LyricsViewState = 'hidden' | 'preview' | 'fullscreen';

interface LyricsPanelProps {
  lyrics: Lyrics | null;
  currentTime: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  trackTitle?: string;
  initialState?: LyricsViewState;
  viewState?: LyricsViewState; // 外部控制的状态
  onStateChange?: (state: LyricsViewState) => void; // 状态变化回调
}

interface PanelState {
  viewState: LyricsViewState;
  dragOffset: number;
  isDragging: boolean;
}

// 面板高度配置
const PANEL_HEIGHTS = {
  hidden: 0,
  preview: 150,
  fullscreen: 'calc(100vh - 200px)', // Header(80px) + AudioPlayer(120px)
};

// 拖拽阈值配置
const DRAG_THRESHOLDS = {
  toPreview: 50,
  toFullscreen: 100,
  toHidden: -50,
};

const PanelContainer = styled.div<{ 
  $viewState: LyricsViewState; 
  $dragOffset: number; 
  $isDragging: boolean;
}>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 120px; /* AudioPlayer 上方 */
  z-index: 200;
  
  /* 根据状态计算高度和位移 */
  height: ${props => {
    if (props.$viewState === 'fullscreen') return PANEL_HEIGHTS.fullscreen;
    if (props.$viewState === 'preview') return `${PANEL_HEIGHTS.preview}px`;
    return '24px'; // 隐藏状态保留拖拽区域高度
  }};
  
  transform: translateY(${props => {
    let baseOffset = 0;
    if (props.$viewState === 'hidden') baseOffset = 0; // 隐藏状态不偏移，保持可见
    return baseOffset + props.$dragOffset;
  }}px);
  
  transition: ${props => props.$isDragging ? 'none' : `transform ${theme.transitions.normal}, height ${theme.transitions.normal}`};
  
  background: linear-gradient(135deg, 
    ${theme.colors.background}f8, 
    ${theme.colors.surfaceHover}f8
  );
  backdrop-filter: blur(15px);
  border-top: 2px solid ${theme.colors.primary}40;
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  box-shadow: ${theme.shadows.xl};
  overflow: hidden;
  
  /* 性能优化 */
  will-change: transform, height;
  backface-visibility: hidden;
`;

const DragHandle = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  cursor: grab;
  opacity: 0.8;
  transition: all ${theme.transitions.fast};
  z-index: 10;
  
  /* 添加脉冲动画提示用户可以拖拽 */
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { 
      opacity: 0.8;
      transform: translateX(-50%) scale(1);
    }
    50% { 
      opacity: 1;
      transform: translateX(-50%) scale(1.1);
    }
  }
  
  &:hover {
    opacity: 1;
    animation: none;
    transform: translateX(-50%) scale(1.2);
  }
  
  &:active {
    cursor: grabbing;
    transform: translateX(-50%) scale(0.9);
  }
`;

const PanelContent = styled.div<{ $viewState: LyricsViewState }>`
  height: 100%;
  padding-top: 16px; /* 为拖拽手柄留空间 */
  
  ${props => props.$viewState === 'preview' && css`
    overflow: hidden;
  `}
`;

const PreviewContent = styled.div`
  padding: ${theme.spacing.md};
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

const HintText = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  opacity: 0.7;
  margin-top: ${theme.spacing.xs};
  text-align: center;
`;

const PreviewLine = styled.div<{ $isCurrent?: boolean }>`
  font-size: ${props => props.$isCurrent ? theme.fontSizes.lg : theme.fontSizes.base};
  color: ${props => props.$isCurrent ? theme.colors.text.primary : theme.colors.text.secondary};
  opacity: ${props => props.$isCurrent ? 1 : 0.6};
  font-weight: ${props => props.$isCurrent ? 600 : 400};
  transition: all ${theme.transitions.fast};
  line-height: 1.4;
`;

const ToggleButton = styled.button<{ $viewState: LyricsViewState }>`
  position: absolute;
  top: ${props => props.$viewState === 'hidden' ? '4px' : '16px'};
  right: 16px;
  background: ${theme.colors.primary}20;
  border: 1px solid ${theme.colors.primary}40;
  border-radius: ${theme.borderRadius.full};
  width: ${props => props.$viewState === 'hidden' ? '24px' : '32px'};
  height: ${props => props.$viewState === 'hidden' ? '16px' : '32px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${props => props.$viewState === 'hidden' ? '10px' : '14px'};
  transition: all ${theme.transitions.fast};
  z-index: 10;
  
  &:hover {
    background: ${theme.colors.primary}30;
    border-color: ${theme.colors.primary}60;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  currentTime,
  isPlaying,
  isLoading,
  error,
  trackTitle,
  initialState = 'hidden',
  viewState: externalViewState,
  onStateChange
}) => {
  const [panelState, setPanelState] = useState<PanelState>({
    viewState: initialState,
    dragOffset: 0,
    isDragging: false,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; startOffset: number } | null>(null);

  // 计算当前歌词行索引
  const getCurrentLineIndex = useCallback((time: number): number => {
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
  }, [lyrics]);

  const currentLineIndex = getCurrentLineIndex(currentTime);

  // 状态切换函数
  const switchToState = useCallback((newState: LyricsViewState) => {
    setPanelState(prev => ({
      ...prev,
      viewState: newState,
      dragOffset: 0,
    }));
    // 通知外部状态变化
    onStateChange?.(newState);
  }, [onStateChange]);

  // 同步外部状态
  useEffect(() => {
    if (externalViewState !== undefined && externalViewState !== panelState.viewState) {
      setPanelState(prev => ({
        ...prev,
        viewState: externalViewState,
        dragOffset: 0,
      }));
    }
  }, [externalViewState, panelState.viewState]);

  // 循环切换状态
  const toggleState = useCallback(() => {
    const stateOrder: LyricsViewState[] = ['hidden', 'preview', 'fullscreen'];
    const currentIndex = stateOrder.indexOf(panelState.viewState);
    const nextIndex = (currentIndex + 1) % stateOrder.length;
    switchToState(stateOrder[nextIndex]);
  }, [panelState.viewState, switchToState]);

  // 拖拽开始
  const handleDragStart = useCallback((clientY: number) => {
    dragStartRef.current = {
      y: clientY,
      startOffset: panelState.dragOffset,
    };
    setPanelState(prev => ({ ...prev, isDragging: true }));
  }, [panelState.dragOffset]);

  // 拖拽移动
  const handleDragMove = useCallback((clientY: number) => {
    if (!dragStartRef.current) return;

    const deltaY = clientY - dragStartRef.current.y;
    const newOffset = dragStartRef.current.startOffset + deltaY;
    
    // 限制拖拽范围
    const maxOffset = PANEL_HEIGHTS.preview;
    const minOffset = -200; // 允许向上拖拽一定距离
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
    
    setPanelState(prev => ({ ...prev, dragOffset: clampedOffset }));
  }, []);

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    if (!dragStartRef.current) return;

    const { dragOffset, viewState } = panelState;
    let newState = viewState;

    // 根据拖拽距离和方向决定新状态
    if (viewState === 'hidden') {
      if (dragOffset < DRAG_THRESHOLDS.toPreview) {
        newState = 'preview';
      }
    } else if (viewState === 'preview') {
      if (dragOffset < DRAG_THRESHOLDS.toFullscreen) {
        newState = 'fullscreen';
      } else if (dragOffset > DRAG_THRESHOLDS.toHidden) {
        newState = 'hidden';
      }
    } else if (viewState === 'fullscreen') {
      if (dragOffset > DRAG_THRESHOLDS.toHidden) {
        newState = 'preview';
      }
    }

    dragStartRef.current = null;
    setPanelState({
      viewState: newState,
      dragOffset: 0,
      isDragging: false,
    });
    
    // 如果状态发生变化，通知外部
    if (newState !== viewState) {
      onStateChange?.(newState);
    }
  }, [panelState, onStateChange]);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (panelState.isDragging) {
      handleDragMove(e.clientY);
    }
  }, [panelState.isDragging, handleDragMove]);

  const handleMouseUp = useCallback(() => {
    if (panelState.isDragging) {
      handleDragEnd();
    }
  }, [panelState.isDragging, handleDragEnd]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (panelState.isDragging && e.touches.length > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientY);
    }
  }, [panelState.isDragging, handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    if (panelState.isDragging) {
      handleDragEnd();
    }
  }, [panelState.isDragging, handleDragEnd]);

  // 绑定全局事件监听器
  useEffect(() => {
    if (panelState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [panelState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);


  // 渲染预览内容
  const renderPreviewContent = () => {
    if (!lyrics || lyrics.lines.length === 0) {
      return (
        <PreviewContent>
          <PreviewLine $isCurrent>🎵 暂无歌词</PreviewLine>
          <HintText>拖拽顶部横条或点击右上角按钮切换显示模式</HintText>
        </PreviewContent>
      );
    }

    const lines = lyrics.lines;
    const currentIndex = currentLineIndex;
    const prevLine = currentIndex > 0 ? lines[currentIndex - 1] : null;
    const currentLine = currentIndex >= 0 ? lines[currentIndex] : null;
    const nextLine = currentIndex < lines.length - 1 ? lines[currentIndex + 1] : null;

    return (
      <PreviewContent>
        {prevLine && <PreviewLine>{prevLine.text}</PreviewLine>}
        {currentLine && <PreviewLine $isCurrent>{currentLine.text}</PreviewLine>}
        {nextLine && <PreviewLine>{nextLine.text}</PreviewLine>}
        <HintText>向上拖拽查看完整歌词 • 向下拖拽隐藏面板</HintText>
      </PreviewContent>
    );
  };

  // 如果没有正在播放的歌曲，不显示面板
  if (!trackTitle) {
    return null;
  }

  return (
    <PanelContainer
      ref={panelRef}
      $viewState={panelState.viewState}
      $dragOffset={panelState.dragOffset}
      $isDragging={panelState.isDragging}
    >
      <DragHandle
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      
      <ToggleButton $viewState={panelState.viewState} onClick={toggleState} title="切换歌词显示模式">
        {panelState.viewState === 'hidden' && '🎵'}
        {panelState.viewState === 'preview' && '📖'}
        {panelState.viewState === 'fullscreen' && '📕'}
      </ToggleButton>

      <PanelContent $viewState={panelState.viewState}>
        {panelState.viewState === 'hidden' ? (
          null
        ) : panelState.viewState === 'preview' ? (
          renderPreviewContent()
        ) : panelState.viewState === 'fullscreen' ? (
          <LyricsDisplay
            lyrics={lyrics}
            currentTime={currentTime}
            isPlaying={isPlaying}
            isLoading={isLoading}
            error={error}
            trackTitle={trackTitle}
            isEmbedded={true}
          />
        ) : null}
      </PanelContent>
    </PanelContainer>
  );
};

LyricsPanel.displayName = 'LyricsPanel';
