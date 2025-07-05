import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import type { TimelineProject, ExportFormat, ExportOptions } from './types';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Dialog = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
  border: 2px solid ${theme.colors.border};
`;

const Title = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h4`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-weight: 600;
`;

const FormatGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
`;

const FormatCard = styled.div<{ $isSelected: boolean }>`
  padding: ${theme.spacing.md};
  border: 2px solid ${props => props.$isSelected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${props => props.$isSelected ? `${theme.colors.primary}10` : theme.colors.surface};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}05;
  }
`;

const FormatName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const FormatDescription = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

const OptionsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
`;

const OptionRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  transition: background ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.text.primary};
  font-size: ${theme.fontSizes.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const PreviewSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const PreviewBox = styled.pre`
  background: ${theme.colors.surfaceHover};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  font-family: monospace;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  color: ${theme.colors.text.primary};
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 3px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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
    }
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.surfaceHover};
    }
  `}
  
  &:active {
    transform: translateY(1px);
  }
`;

// 导出格式定义
const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'lrc',
    name: 'LRC 歌词文件',
    extension: 'lrc',
    description: '标准 LRC 格式，兼容大多数音乐播放器'
  },
  {
    id: 'enhanced-lrc',
    name: '增强 LRC 文件',
    extension: 'lrc',
    description: '包含歌手标记的 LRC 格式，适用于 Hasu no Sora'
  },
  {
    id: 'json',
    name: 'JSON 数据',
    extension: 'json',
    description: '结构化数据格式，便于程序处理'
  },
  {
    id: 'srt',
    name: 'SRT 字幕文件',
    extension: 'srt',
    description: '字幕格式，可用于视频制作'
  },
  {
    id: 'txt',
    name: '纯文本',
    extension: 'txt',
    description: '简单的文本格式，包含时间戳'
  }
];

interface ExportDialogProps {
  project: TimelineProject;
  onClose: () => void;
  onExport: (format: string, options: ExportOptions) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  project,
  onClose,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('enhanced-lrc');
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamps: true,
    includeSingerTags: true,
    encoding: 'utf-8',
    lineEnding: 'lf'
  });

  // 格式化时间
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // 生成预览内容
  const generatePreview = useCallback(() => {
    const { lyrics } = project;
    if (lyrics.length === 0) return '暂无歌词内容';

    switch (selectedFormat) {
      case 'lrc':
        return lyrics.map(line => {
          const timeStr = `[${formatTime(line.time)}]`;
          const text = line.segments.map(segment => segment.text).join(' ').trim();
          return `${timeStr}${text}`;
        }).join('\n');

      case 'enhanced-lrc':
        return lyrics.map(line => {
          const timeStr = `[${formatTime(line.time)}]`;
          if (options.includeSingerTags && line.segments.length > 0) {
            // 重建带歌手标记的文本
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

      case 'json':
        return JSON.stringify({
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

      case 'srt':
        return lyrics.map((line, index) => {
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

      case 'txt':
        return lyrics.map(line => {
          const timeStr = options.includeTimestamps ? `[${formatTime(line.time)}] ` : '';
          const text = line.segments.map(segment => segment.text).join(' ').trim();
          return `${timeStr}${text}`;
        }).join('\n');

      default:
        return '未知格式';
    }
  }, [project, selectedFormat, options, formatTime]);

  // 处理导出
  const handleExport = useCallback(() => {
    onExport(selectedFormat, options);
  }, [onExport, selectedFormat, options]);

  // 处理选项变化
  const handleOptionChange = useCallback((key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>
          📤 导出歌词
        </Title>

        <Section>
          <SectionTitle>选择导出格式</SectionTitle>
          <FormatGrid>
            {EXPORT_FORMATS.map(format => (
              <FormatCard
                key={format.id}
                $isSelected={selectedFormat === format.id}
                onClick={() => setSelectedFormat(format.id)}
              >
                <FormatName>{format.name}</FormatName>
                <FormatDescription>{format.description}</FormatDescription>
              </FormatCard>
            ))}
          </FormatGrid>
        </Section>

        <Section>
          <SectionTitle>导出选项</SectionTitle>
          <OptionsGrid>
            <OptionRow>
              <Checkbox
                type="checkbox"
                checked={options.includeTimestamps}
                onChange={(e) => handleOptionChange('includeTimestamps', e.target.checked)}
              />
              包含时间戳
            </OptionRow>
            
            <OptionRow>
              <Checkbox
                type="checkbox"
                checked={options.includeSingerTags}
                onChange={(e) => handleOptionChange('includeSingerTags', e.target.checked)}
                disabled={selectedFormat === 'lrc'}
              />
              包含歌手标记
            </OptionRow>
            
            <OptionRow>
              <span>文件编码:</span>
              <Select
                value={options.encoding}
                onChange={(e) => handleOptionChange('encoding', e.target.value)}
              >
                <option value="utf-8">UTF-8</option>
                <option value="gbk">GBK</option>
              </Select>
            </OptionRow>
            
            <OptionRow>
              <span>换行符:</span>
              <Select
                value={options.lineEnding}
                onChange={(e) => handleOptionChange('lineEnding', e.target.value)}
              >
                <option value="lf">LF (Unix/Mac)</option>
                <option value="crlf">CRLF (Windows)</option>
              </Select>
            </OptionRow>
          </OptionsGrid>
        </Section>

        <PreviewSection>
          <SectionTitle>预览</SectionTitle>
          <PreviewBox>
            {generatePreview()}
          </PreviewBox>
        </PreviewSection>

        <Actions>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button $variant="primary" onClick={handleExport}>
            导出文件
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

ExportDialog.displayName = 'ExportDialog';
