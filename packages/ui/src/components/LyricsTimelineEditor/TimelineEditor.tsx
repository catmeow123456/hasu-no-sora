import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { AudioWaveform } from './AudioWaveform';
import { LyricLineEditor } from './LyricLineEditor';
import { TimelineControls } from './TimelineControls';
import { PreviewPanel } from './PreviewPanel';
import { ExportDialog } from './ExportDialog';
import { SingerTagEditor } from './SingerTagEditor';
import { RestoreDialog } from './RestoreDialog';
import { useTimelineProject } from './hooks/useTimelineProject';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { TimelineProject, EditableLyricLine, SingerType, SavedProjectInfo } from './types';

const EditorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: ${theme.colors.background};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, 
    ${theme.colors.surface}, 
    ${theme.colors.surfaceHover}
  );
  border-bottom: 2px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.sm};
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  ${props => props.$variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${theme.colors.secondary};
      transform: translateY(-1px);
    }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.primary};
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AudioSection = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
`;

const AudioFileSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.label`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surfaceHover};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}10;
  }
`;

const FileName = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  flex: 1;
`;

const WorkspaceContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${theme.colors.border};
  overflow: hidden;
`;

const RightPanel = styled.div`
  flex: 1;
  min-width: 300px;
  background: ${theme.colors.surfaceHover};
`;

const WaveformContainer = styled.div`
  height: 120px;
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  position: relative;
`;

const LyricsEditorContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }
`;

const KeyboardShortcutsHelp = styled.div`
  position: fixed;
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.md};
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  max-width: 300px;
  z-index: 1001;
  
  h4 {
    margin: 0 0 ${theme.spacing.sm} 0;
    color: ${theme.colors.text.primary};
    font-size: ${theme.fontSizes.sm};
  }
  
  .shortcut-group {
    margin-bottom: ${theme.spacing.sm};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
    
    .keys {
      font-family: monospace;
      background: ${theme.colors.surfaceHover};
      padding: 2px 6px;
      border-radius: ${theme.borderRadius.sm};
      font-size: ${theme.fontSizes.xs};
    }
    
    .description {
      flex: 1;
      margin-right: ${theme.spacing.sm};
    }
  }
`;

const HelpToggleButton = styled.button`
  position: fixed;
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.primary};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.lg};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.fast};
  z-index: 1001;
  
  &:hover {
    background: ${theme.colors.secondary};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SaveMessage = styled.div`
  position: fixed;
  top: 80px;
  right: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  box-shadow: ${theme.shadows.md};
  font-size: ${theme.fontSizes.sm};
  z-index: 1002;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

interface TimelineEditorProps {
  onClose: () => void;
  initialProject?: Partial<TimelineProject>;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  onClose,
  initialProject
}) => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [showSingerEditor, setShowSingerEditor] = useState(false);
  const [triggerEditLineId, setTriggerEditLineId] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedProjectInfo, setSavedProjectInfo] = useState<SavedProjectInfo | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    project,
    updateProject,
    addLyricLine,
    updateLyricLine,
    deleteLyricLine,
    selectLyricLine,
    selectNextLine,
    selectPreviousLine,
    adjustSelectedLineTime,
    batchAdjustTime,
    saveProject,
    loadProject,
    checkForSavedProject,
    clearSavedProject,
    isDirty
  } = useTimelineProject(initialProject);
  
  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    setAudioFile: setPlayerAudioFile
  } = useAudioPlayer(audioRef);
  
  // 时间格式化函数
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // 处理音频文件选择
  const handleAudioFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setPlayerAudioFile(file);
      updateProject({ audioFile: file });
    }
  }, [setPlayerAudioFile, updateProject]);
  
  // 在当前播放位置插入歌词
  const insertLyricAtCurrentTime = useCallback((text: string = '') => {
    if (!audioRef.current) return;
    
    const time = audioRef.current.currentTime;
    const newLine: EditableLyricLine = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      time,
      text,
      originalTime: formatTime(time),
      segments: text ? [{ text }] : [], // 确保有基本的segments结构
      isSelected: true,
      isDraft: true
    };
    
    addLyricLine(newLine);
  }, [addLyricLine, formatTime]);
  
  // 删除选中的歌词行
  const deleteSelectedLine = useCallback(() => {
    const selectedLine = project.lyrics.find(line => line.isSelected);
    if (selectedLine) {
      deleteLyricLine(selectedLine.id);
    }
  }, [project.lyrics, deleteLyricLine]);

  // 编辑当前行歌词 - 触发LyricLineEditor的编辑功能
  const editCurrentLine = useCallback(() => {
    const selectedLine = project.lyrics.find(line => line.isSelected);
    if (selectedLine) {
      // 使用新的触发机制
      setTriggerEditLineId(selectedLine.id);
      // 清除触发状态，以便下次可以再次触发
      setTimeout(() => setTriggerEditLineId(null), 100);
    }
  }, [project.lyrics]);

  // 修改当前行歌手 - 触发SingerTagEditor
  const editCurrentSinger = useCallback(() => {
    const selectedLine = project.lyrics.find(line => line.isSelected);
    if (selectedLine) {
      setEditingLineId(selectedLine.id);
      setShowSingerEditor(true);
    }
  }, [project.lyrics]);

  // 处理歌手编辑保存
  const handleSingerEditSave = useCallback((newText: string) => {
    if (editingLineId) {
      const selectedLine = project.lyrics.find(line => line.id === editingLineId);
      if (selectedLine) {
        // 解析新的歌词文本中的歌手标记
        const parseSegments = (text: string) => {
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
        };

        const segments = parseSegments(newText);
        const cleanText = segments.map(segment => segment.text).join(' ').trim();
        
        updateLyricLine(editingLineId, {
          text: cleanText,
          segments: segments
        });
      }
    }
    setShowSingerEditor(false);
    setEditingLineId(null);
  }, [editingLineId, project.lyrics, updateLyricLine]);

  // 处理波形点击
  const handleWaveformClick = useCallback((time: number) => {
    seekTo(time);
  }, [seekTo]);
  
  // 处理保存（增强版，带用户反馈）
  const handleSave = useCallback(async () => {
    try {
      const result = await saveProject();
      if (result.success) {
        setSaveMessage('✅ ' + result.message);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('❌ ' + result.message);
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveMessage('❌ 保存失败');
      setTimeout(() => setSaveMessage(null), 5000);
    }
  }, [saveProject]);

  // 初始化检查保存的项目
  useEffect(() => {
    // 只在没有初始项目时检查保存的项目
    if (!initialProject) {
      const projectInfo = checkForSavedProject();
      if (projectInfo.exists) {
        setSavedProjectInfo(projectInfo);
        setShowRestoreDialog(true);
      }
    }
  }, [initialProject, checkForSavedProject]);

  // 处理项目恢复
  const handleRestoreProject = useCallback(async () => {
    setIsRestoring(true);
    try {
      const result = await loadProject();
      if (result.success && result.project) {
        // 恢复音频文件到播放器
        if (result.project.audioFile instanceof File) {
          setAudioFile(result.project.audioFile);
          setPlayerAudioFile(result.project.audioFile);
        }
        console.log('Project restored successfully');
      } else {
        console.error('Failed to restore project:', result.message);
        alert('恢复项目失败: ' + result.message);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('恢复项目时发生错误');
    } finally {
      setIsRestoring(false);
      setShowRestoreDialog(false);
    }
  }, [loadProject, setPlayerAudioFile]);

  // 处理开始新项目
  const handleStartNewProject = useCallback(async () => {
    try {
      await clearSavedProject();
      setShowRestoreDialog(false);
      console.log('Started new project, cleared saved data');
    } catch (error) {
      console.error('Failed to clear saved project:', error);
    }
  }, [clearSavedProject]);

  // 键盘快捷键
  useKeyboardShortcuts({
    onPlayPause: () => isPlaying ? pause() : play(),
    onInsertLyric: insertLyricAtCurrentTime,
    onSave: handleSave,
    onClose,
    onDelete: deleteSelectedLine,
    onTimeAdjust: adjustSelectedLineTime,
    onSelectNext: selectNextLine,
    onSelectPrevious: selectPreviousLine,
    onBatchTimeAdjust: batchAdjustTime,
    onEditCurrentLine: editCurrentLine,
    onEditCurrentSinger: editCurrentSinger
  });

  // 处理导出
  const handleExport = useCallback((format: string, options: any) => {
    try {
      const { lyrics } = project;
      if (lyrics.length === 0) {
        alert('没有歌词内容可以导出');
        return;
      }

      let content = '';
      let filename = `${project.name || '歌词'}.${getFileExtension(format)}`;

      // 生成导出内容
      switch (format) {
        case 'lrc':
          content = lyrics.map(line => {
            const timeStr = `[${formatTime(line.time)}]`;
            const text = line.segments.map(segment => segment.text).join(' ').trim();
            return `${timeStr}${text}`;
          }).join('\n');
          break;

        case 'enhanced-lrc':
          content = lyrics.map(line => {
            const timeStr = `[${formatTime(line.time)}]`;
            if (options.includeSingerTags && line.segments.length > 0) {
              const textWithTags = line.segments.map(segment => {
                if (segment.isRainbow && segment.singers) {
                  return `@${segment.singers.join(',')}@${segment.text}`;
                } else if (segment.singer) {
                  return `@${segment.singer}@${segment.text}`;
                } else {
                  return segment.text;
                }
              }).join(' ');
              return `${timeStr}${textWithTags}`;
            } else {
              const text = line.segments.map(segment => segment.text).join(' ').trim();
              return `${timeStr}${text}`;
            }
          }).join('\n');
          break;

        case 'json':
          content = JSON.stringify({
            project: {
              name: project.name,
              metadata: project.metadata
            },
            lyrics: lyrics.map(line => ({
              time: line.time,
              text: line.text,
              segments: options.includeSingerTags ? line.segments : undefined
            }))
          }, null, 2);
          break;

        case 'srt':
          content = lyrics.map((line, index) => {
            const startTime = line.time;
            const endTime = index < lyrics.length - 1 ? lyrics[index + 1].time : startTime + 3;
            
            const formatSrtTime = (seconds: number) => {
              const hours = Math.floor(seconds / 3600);
              const minutes = Math.floor((seconds % 3600) / 60);
              const secs = Math.floor(seconds % 60);
              const ms = Math.floor((seconds % 1) * 1000);
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
            };

            const text = line.segments.map(segment => segment.text).join(' ').trim();
            return `${index + 1}\n${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n${text}\n`;
          }).join('\n');
          break;

        case 'txt':
          content = lyrics.map(line => {
            const timeStr = options.includeTimestamps ? `[${formatTime(line.time)}] ` : '';
            const text = line.segments.map(segment => segment.text).join(' ').trim();
            return `${timeStr}${text}`;
          }).join('\n');
          break;

        default:
          throw new Error('未知的导出格式');
      }

      // 处理换行符
      if (options.lineEnding === 'crlf') {
        content = content.replace(/\n/g, '\r\n');
      }

      // 创建并下载文件
      const blob = new Blob([content], { 
        type: 'text/plain;charset=utf-8' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`导出成功: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }, [project, formatTime]);

  // 获取文件扩展名
  const getFileExtension = (format: string): string => {
    switch (format) {
      case 'lrc':
      case 'enhanced-lrc':
        return 'lrc';
      case 'json':
        return 'json';
      case 'srt':
        return 'srt';
      case 'txt':
        return 'txt';
      default:
        return 'txt';
    }
  };
  
  return (
    <EditorContainer>
      <Header>
        <Title>
          🎵 歌词时间轴生成工具
        </Title>
        <HeaderActions>
          <ActionButton onClick={handleSave} disabled={!isDirty}>
            保存
          </ActionButton>
          <ActionButton onClick={() => setShowExportDialog(true)}>
            导出
          </ActionButton>
          <ActionButton onClick={onClose}>
            关闭
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <MainContent>
        <AudioSection>
          <AudioFileSelector>
            <FileButton htmlFor="audio-file-input">
              选择音频文件
            </FileButton>
            <FileInput
              id="audio-file-input"
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
            />
            <FileName>
              {audioFile ? audioFile.name : '未选择文件'}
            </FileName>
          </AudioFileSelector>
          
          <TimelineControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlay={play}
            onPause={pause}
            onSeek={seekTo}
            onInsertLyric={insertLyricAtCurrentTime}
          />
        </AudioSection>
        
        <WorkspaceContainer>
          <LeftPanel>
            <WaveformContainer>
              <AudioWaveform
                audioFile={audioFile}
                currentTime={currentTime}
                duration={duration}
                lyrics={project.lyrics}
                onTimeClick={handleWaveformClick}
              />
            </WaveformContainer>
            
            <LyricsEditorContainer>
              {project.lyrics.map((line, index) => (
                <LyricLineEditor
                  key={line.id}
                  line={line}
                  index={index}
                  isSelected={line.isSelected}
                  shouldStartEditing={triggerEditLineId === line.id}
                  onUpdate={(updatedLine) => updateLyricLine(line.id, updatedLine)}
                  onDelete={() => deleteLyricLine(line.id)}
                  onSelect={() => selectLyricLine(line.id)}
                  onTimeChange={(newTime) => {
                    updateLyricLine(line.id, {
                      ...line,
                      time: newTime,
                      originalTime: formatTime(newTime)
                    });
                  }}
                />
              ))}
              
              {project.lyrics.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: theme.colors.text.secondary,
                  padding: theme.spacing.xl 
                }}>
                  点击播放控制栏的"插入歌词"按钮开始创建歌词
                </div>
              )}
            </LyricsEditorContainer>
          </LeftPanel>
          
          <RightPanel>
            <PreviewPanel
              lyrics={project.lyrics}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </RightPanel>
        </WorkspaceContainer>
      </MainContent>
      
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />
      
      {/* 导出对话框 */}
      {showExportDialog && (
        <ExportDialog
          project={project}
          onClose={() => setShowExportDialog(false)}
          onExport={(format, options) => {
            handleExport(format, options);
            setShowExportDialog(false);
          }}
        />
      )}
      
      {/* 歌手标记编辑器 */}
      {showSingerEditor && editingLineId && (
        <SingerTagEditor
          text={project.lyrics.find(line => line.id === editingLineId)?.text || ''}
          segments={project.lyrics.find(line => line.id === editingLineId)?.segments || []}
          onSave={handleSingerEditSave}
          onCancel={() => {
            setShowSingerEditor(false);
            setEditingLineId(null);
          }}
        />
      )}
      
      {/* 恢复项目对话框 */}
      {showRestoreDialog && savedProjectInfo && (
        <RestoreDialog
          projectInfo={savedProjectInfo}
          isLoading={isRestoring}
          onRestore={handleRestoreProject}
          onStartNew={handleStartNewProject}
          onCancel={() => setShowRestoreDialog(false)}
        />
      )}
      
      {/* 保存消息提示 */}
      {saveMessage && (
        <SaveMessage>
          {saveMessage}
        </SaveMessage>
      )}
      
      {/* 键盘快捷键帮助 */}
      {showKeyboardHelp ? (
        <KeyboardShortcutsHelp onClick={() => setShowKeyboardHelp(false)}>
          <h4>⌨️ 键盘快捷键</h4>
          
          <div className="shortcut-group">
            <div className="shortcut-item">
              <span className="description">播放/暂停</span>
              <span className="keys">Space</span>
            </div>
            <div className="shortcut-item">
              <span className="description">插入歌词</span>
              <span className="keys">Ctrl+T</span>
            </div>
            <div className="shortcut-item">
              <span className="description">保存项目</span>
              <span className="keys">Ctrl+S</span>
            </div>
            <div className="shortcut-item">
              <span className="description">关闭编辑器</span>
              <span className="keys">Esc</span>
            </div>
          </div>
          
          <div className="shortcut-group">
            <h4>🎯 选择和导航</h4>
            <div className="shortcut-item">
              <span className="description">选择上一行</span>
              <span className="keys">↑</span>
            </div>
            <div className="shortcut-item">
              <span className="description">选择下一行</span>
              <span className="keys">↓</span>
            </div>
            <div className="shortcut-item">
              <span className="description">删除选中行</span>
              <span className="keys">Del</span>
            </div>
          </div>
          
          <div className="shortcut-group">
            <h4>⏱️ 时间调整</h4>
            <div className="shortcut-item">
              <span className="description">微调 -0.1秒</span>
              <span className="keys">←</span>
            </div>
            <div className="shortcut-item">
              <span className="description">微调 +0.1秒</span>
              <span className="keys">→</span>
            </div>
            <div className="shortcut-item">
              <span className="description">粗调 -1秒</span>
              <span className="keys">Shift+←</span>
            </div>
            <div className="shortcut-item">
              <span className="description">粗调 +1秒</span>
              <span className="keys">Shift+→</span>
            </div>
            <div className="shortcut-item">
              <span className="description">精调 -0.01秒</span>
              <span className="keys">Ctrl+←</span>
            </div>
            <div className="shortcut-item">
              <span className="description">精调 +0.01秒</span>
              <span className="keys">Ctrl+→</span>
            </div>
          </div>
          
          <div className="shortcut-group">
            <h4>✏️ 编辑功能</h4>
            <div className="shortcut-item">
              <span className="description">编辑当前行歌词</span>
              <span className="keys">Ctrl+Enter</span>
            </div>
            <div className="shortcut-item">
              <span className="description">修改当前行歌手</span>
              <span className="keys">Ctrl+R</span>
            </div>
          </div>
        </KeyboardShortcutsHelp>
      ) : (
        <HelpToggleButton onClick={() => setShowKeyboardHelp(true)}>
          ?
        </HelpToggleButton>
      )}
    </EditorContainer>
  );
};

TimelineEditor.displayName = 'TimelineEditor';
