import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme, getSingerColor, getSingerName } from '../../styles/theme';
import { SingerTagEditor } from './SingerTagEditor';
import { useLyricSegmentRenderer } from '../shared/LyricsSegments';
import type { EditableLyricLine, SingerType } from './types';

const LineContainer = styled.div<{ $isSelected: boolean; $isDraft: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${props => 
    props.$isSelected ? theme.colors.primary : 
    props.$isDraft ? theme.colors.accent : 
    'transparent'
  };
  background: ${props => 
    props.$isSelected ? `${theme.colors.primary}10` : 
    props.$isDraft ? `${theme.colors.accent}10` : 
    theme.colors.surface
  };
  transition: all ${theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.primary}50;
  }
`;

const TimeInput = styled.input`
  width: 80px;
  padding: ${theme.spacing.xs};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-family: monospace;
  text-align: center;
  background: ${theme.colors.surface};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const TextInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.base};
  background: ${theme.colors.surface};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const PreviewText = styled.div`
  flex: 1;
  padding: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.base};
  line-height: 1.4;
  min-height: 1.4em;
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'primary' | 'secondary' }>`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${theme.colors.surface};
          color: #dc3545;
          border: 1px solid #dc354520;
          
          &:hover {
            background: #dc354510;
            border-color: #dc3545;
          }
        `;
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover {
            background: ${theme.colors.secondary};
          }
        `;
      default:
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border};
          
          &:hover {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.primary};
          }
        `;
    }
  }}
  
  &:active {
    transform: scale(0.95);
  }
`;

const ConfidenceIndicator = styled.div<{ $confidence: number }>`
  width: 4px;
  height: 100%;
  background: ${props => {
    if (props.$confidence > 0.8) return '#28a745';
    if (props.$confidence > 0.5) return '#ffc107';
    return '#dc3545';
  }};
  border-radius: ${theme.borderRadius.full};
  opacity: 0.7;
`;

interface LyricLineEditorProps {
  line: EditableLyricLine;
  index: number;
  isSelected: boolean;
  onUpdate: (line: EditableLyricLine) => void;
  onDelete: () => void;
  onSelect: () => void;
  onTimeChange: (time: number) => void;
  shouldStartEditing?: boolean;
}

export const LyricLineEditor: React.FC<LyricLineEditorProps> = ({
  line,
  index,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
  onTimeChange,
  shouldStartEditing
}) => {
  const [isEditing, setIsEditing] = useState(line.isDraft);
  const [editText, setEditText] = useState(line.text);
  const [showSingerEditor, setShowSingerEditor] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  const renderLyricSegments = useLyricSegmentRenderer();

  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // 解析时间输入
  const parseTimeInput = useCallback((timeStr: string): number => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\.(\d{2}))?$/);
    if (match) {
      const [, minutes, seconds, centiseconds = '0'] = match;
      return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds.padEnd(2, '0')) / 100;
    }
    return line.time;
  }, [line.time]);

  // 解析歌词文本中的歌手标记
  const parseSegments = useCallback((text: string) => {
    const segments = [];
    const singerRegex = /@([^@]+)@([^@]*?)(?=@|$)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = singerRegex.exec(text)) !== null) {
      const [fullMatch, singerPart, segmentText] = match;
      const matchStart = match.index;
      
      // 添加未标记的文本
      if (matchStart > lastIndex) {
        const unmarkedText = text.slice(lastIndex, matchStart).trim();
        if (unmarkedText) {
          segments.push({ text: unmarkedText });
        }
      }
      
      // 添加带歌手标记的片段
      if (segmentText.trim()) {
        const trimmedSingerPart = singerPart.trim();
        
        if (trimmedSingerPart.includes(',')) {
          const singers = trimmedSingerPart.split(',').map(s => s.trim()).filter(s => s.length > 0) as SingerType[];
          if (singers.length > 1) {
            segments.push({
              text: segmentText.trim(),
              singers: singers,
              isRainbow: true
            });
          } else {
            segments.push({
              text: segmentText.trim(),
              singer: singers[0]
            });
          }
        } else {
          segments.push({
            text: segmentText.trim(),
            singer: trimmedSingerPart as SingerType
          });
        }
      }
      
      lastIndex = matchStart + fullMatch.length;
    }
    
    // 处理剩余文本
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText) {
        segments.push({ text: remainingText });
      }
    }
    
    // 如果没有任何片段，返回整个文本
    if (segments.length === 0 && text.trim()) {
      segments.push({ text: text.trim() });
    }
    
    return segments;
  }, []);

  // 处理文本更新
  const handleTextUpdate = useCallback((newText: string) => {
    const segments = parseSegments(newText);
    const cleanText = segments.map(segment => segment.text).join(' ').trim();
    
    onUpdate({
      ...line,
      text: cleanText,
      segments,
      isDraft: false
    });
  }, [line, onUpdate, parseSegments]);

  // 处理时间更新
  const handleTimeUpdate = useCallback((timeStr: string) => {
    const newTime = parseTimeInput(timeStr);
    onTimeChange(newTime);
  }, [onTimeChange, parseTimeInput]);

  // 开始编辑
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditText(line.text);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  }, [line.text]);

  // 完成编辑
  const finishEditing = useCallback(() => {
    setIsEditing(false);
    const textValue = typeof editText === 'string' ? editText.trim() : '';
    if (textValue !== line.text) {
      handleTextUpdate(textValue);
    }
  }, [editText, line.text, handleTextUpdate]);

  // 取消编辑
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditText(line.text);
  }, [line.text]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      finishEditing();
    } else if (event.key === 'Escape') {
      cancelEditing();
    }
  }, [finishEditing, cancelEditing]);

  // 处理歌手标记编辑
  const handleSingerEdit = useCallback((newText: string) => {
    setEditText(newText);
    handleTextUpdate(newText);
    setShowSingerEditor(false);
  }, [handleTextUpdate]);

  // 响应外部编辑触发
  useEffect(() => {
    if (shouldStartEditing && !isEditing) {
      startEditing();
    }
  }, [shouldStartEditing, isEditing, startEditing]);

  // 自动聚焦新创建的行
  useEffect(() => {
    if (line.isDraft && isEditing) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [line.isDraft, isEditing]);

  return (
    <>
      <LineContainer
        $isSelected={isSelected}
        $isDraft={line.isDraft}
        onClick={onSelect}
      >
        {line.confidence !== undefined && (
          <ConfidenceIndicator $confidence={line.confidence} />
        )}
        
        <TimeInput
          value={formatTime(line.time)}
          onChange={(e) => handleTimeUpdate(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          title="时间戳 (mm:ss.cc)"
        />
        
        {isEditing ? (
          <TextInput
            ref={textInputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder="输入歌词文本..."
          />
        ) : (
          <PreviewText onDoubleClick={startEditing}>
            {line.segments && line.segments.length > 0 ? (
              renderLyricSegments(line, false)
            ) : (
              line.text || <span style={{ color: theme.colors.text.muted }}>空行</span>
            )}
          </PreviewText>
        )}
        
        <ActionButtons>
          {!isEditing && (
            <>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSingerEditor(true);
                }}
                title="编辑歌手标记"
              >
                🎤
              </ActionButton>
              
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing();
                }}
                title="编辑歌词"
              >
                ✏️
              </ActionButton>
            </>
          )}
          
          <ActionButton
            $variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="删除此行"
          >
            🗑️
          </ActionButton>
        </ActionButtons>
      </LineContainer>
      
      {showSingerEditor && (
        <SingerTagEditor
          text={line.text}
          segments={line.segments}
          onSave={handleSingerEdit}
          onCancel={() => setShowSingerEditor(false)}
        />
      )}
    </>
  );
};

LyricLineEditor.displayName = 'LyricLineEditor';
