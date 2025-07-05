import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { theme, getSingerColor, createRainbowGradient } from '../../styles/theme';
import type { LyricSegment, SingerType } from './types';

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
  max-width: 600px;
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

const TextInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  margin-bottom: ${theme.spacing.md};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const SingerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const SingerCard = styled.div<{ $isSelected: boolean; $color: string }>`
  padding: ${theme.spacing.sm};
  border: 2px solid ${props => props.$isSelected ? props.$color : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${props => props.$isSelected ? `${props.$color}10` : theme.colors.surface};
  
  &:hover {
    border-color: ${props => props.$color};
    background: ${props => `${props.$color}05`};
  }
`;

const SingerName = styled.div<{ $color: string }>`
  font-weight: 500;
  color: ${props => props.$color};
  margin-bottom: ${theme.spacing.xs};
`;

const SingerSubtitle = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const GroupSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const GroupTitle = styled.h4`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-weight: 600;
`;

const RainbowToggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.primary};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
`;

const PreviewSection = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const PreviewTitle = styled.h4`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const PreviewText = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceHover};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.base};
  line-height: 1.5;
  min-height: 2.5em;
  display: flex;
  align-items: center;
`;

const RainbowText = styled.span<{ $gradient: string }>`
  background: ${props => props.$gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  
  @supports not (-webkit-background-clip: text) {
    background: none;
    color: ${theme.colors.primary};
  }
`;

const SingerText = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 500;
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

// 歌手数据
const SINGERS = {
  individual: [
    { id: 'kozue', name: '乙宗梢', subtitle: '人鱼绿色' },
    { id: 'kaho', name: '日野下花帆', subtitle: '太阳色' },
    { id: 'sayaka', name: '村野沙耶香', subtitle: '冰蓝色' },
    { id: 'tsuzuri', name: '夕雾缀理', subtitle: '我的红色' },
    { id: 'rurino', name: '大泽瑠璃乃', subtitle: '瑠璃粉色' },
    { id: 'megumi', name: '藤岛慈', subtitle: '天使白色' },
    { id: 'ginko', name: '百生吟子', subtitle: '天之原色' },
    { id: 'kosuzu', name: '徒町小铃', subtitle: '长庚星色' },
    { id: 'hime', name: '安养寺姬芽', subtitle: '糖果紫色' },
  ],
  groups: [
    { id: 'cerise', name: 'Cerise Bouquet', subtitle: '玫瑰色小组' },
    { id: 'dollche', name: 'DOLLCHESTRA', subtitle: '蓝色小组' },
    { id: 'miracra', name: 'Mira-Cra Park!', subtitle: '黄色小组' },
  ],
  project: [
    { id: 'hasunosora', name: 'Hasu no Sora', subtitle: '主题粉色' },
  ]
};

interface SingerTagEditorProps {
  text: string;
  segments: LyricSegment[];
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export const SingerTagEditor: React.FC<SingerTagEditorProps> = ({
  text,
  segments,
  onSave,
  onCancel
}) => {
  const [editText, setEditText] = useState(text);
  const [selectedSingers, setSelectedSingers] = useState<SingerType[]>([]);
  const [enableRainbow, setEnableRainbow] = useState(false);

  // 从现有segments中提取选中的歌手
  useEffect(() => {
    const singers: SingerType[] = [];
    segments.forEach(segment => {
      if (segment.singer) {
        singers.push(segment.singer);
      } else if (segment.singers) {
        singers.push(...segment.singers);
      }
    });
    setSelectedSingers([...new Set(singers)]);
    setEnableRainbow(segments.some(segment => segment.isRainbow));
  }, [segments]);

  // 切换歌手选择
  const toggleSinger = useCallback((singerId: SingerType) => {
    setSelectedSingers(prev => {
      if (prev.includes(singerId)) {
        return prev.filter(id => id !== singerId);
      } else {
        return [...prev, singerId];
      }
    });
  }, []);

  // 生成预览文本
  const generatePreviewText = useCallback(() => {
    if (selectedSingers.length === 0) {
      return editText;
    }

    if (enableRainbow && selectedSingers.length > 1) {
      return `@${selectedSingers.join(',')}@${editText}`;
    } else if (selectedSingers.length === 1) {
      return `@${selectedSingers[0]}@${editText}`;
    } else {
      // 多个歌手但不启用彩虹效果，为每个歌手单独标记
      return selectedSingers.map(singer => `@${singer}@${editText}`).join(' ');
    }
  }, [editText, selectedSingers, enableRainbow]);

  // 渲染预览效果
  const renderPreview = useCallback(() => {
    try {
      const textToShow = editText || '请输入歌词文本';
      
      if (selectedSingers.length === 0) {
        return <span>{textToShow}</span>;
      }

      if (enableRainbow && selectedSingers.length > 1) {
        const gradient = createRainbowGradient(selectedSingers);
        return (
          <RainbowText $gradient={gradient}>
            {textToShow}
          </RainbowText>
        );
      } else if (selectedSingers.length === 1) {
        const color = getSingerColor(selectedSingers[0]);
        return (
          <SingerText $color={color}>
            {textToShow}
          </SingerText>
        );
      } else {
        // 多个歌手分别显示
        return (
          <>
            {selectedSingers.map((singer, index) => (
              <React.Fragment key={singer}>
                <SingerText $color={getSingerColor(singer)}>
                  {textToShow}
                </SingerText>
                {index < selectedSingers.length - 1 && ' '}
              </React.Fragment>
            ))}
          </>
        );
      }
    } catch (error) {
      console.error('Error rendering preview:', error);
      return <span style={{ color: theme.colors.text.muted }}>预览错误</span>;
    }
  }, [editText, selectedSingers, enableRainbow]);

  // 处理保存
  const handleSave = useCallback(() => {
    onSave(generatePreviewText());
  }, [onSave, generatePreviewText]);

  // 全局键盘事件监听
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleSave();
      } else if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleSave, onCancel]);

  return (
    <Overlay onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>
          🎤 歌手标记编辑器
        </Title>

        <TextInput
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="输入歌词文本..."
          autoFocus
        />

        <RainbowToggle>
          <Checkbox
            type="checkbox"
            checked={enableRainbow}
            onChange={(e) => setEnableRainbow(e.target.checked)}
            disabled={selectedSingers.length < 2}
          />
          启用彩虹效果 (多歌手渐变)
        </RainbowToggle>

        <GroupSection>
          <GroupTitle>个人歌手</GroupTitle>
          <SingerGrid>
            {SINGERS.individual.map(singer => {
              const color = getSingerColor(singer.id as SingerType);
              const isSelected = selectedSingers.includes(singer.id as SingerType);
              return (
                <SingerCard
                  key={singer.id}
                  $isSelected={isSelected}
                  $color={color}
                  onClick={() => toggleSinger(singer.id as SingerType)}
                >
                  <SingerName $color={color}>{singer.name}</SingerName>
                  <SingerSubtitle>{singer.subtitle}</SingerSubtitle>
                </SingerCard>
              );
            })}
          </SingerGrid>
        </GroupSection>

        <GroupSection>
          <GroupTitle>小组合唱</GroupTitle>
          <SingerGrid>
            {SINGERS.groups.map(singer => {
              const color = getSingerColor(singer.id as SingerType);
              const isSelected = selectedSingers.includes(singer.id as SingerType);
              return (
                <SingerCard
                  key={singer.id}
                  $isSelected={isSelected}
                  $color={color}
                  onClick={() => toggleSinger(singer.id as SingerType)}
                >
                  <SingerName $color={color}>{singer.name}</SingerName>
                  <SingerSubtitle>{singer.subtitle}</SingerSubtitle>
                </SingerCard>
              );
            })}
          </SingerGrid>
        </GroupSection>

        <GroupSection>
          <GroupTitle>项目主题</GroupTitle>
          <SingerGrid>
            {SINGERS.project.map(singer => {
              const color = getSingerColor(singer.id as SingerType);
              const isSelected = selectedSingers.includes(singer.id as SingerType);
              return (
                <SingerCard
                  key={singer.id}
                  $isSelected={isSelected}
                  $color={color}
                  onClick={() => toggleSinger(singer.id as SingerType)}
                >
                  <SingerName $color={color}>{singer.name}</SingerName>
                  <SingerSubtitle>{singer.subtitle}</SingerSubtitle>
                </SingerCard>
              );
            })}
          </SingerGrid>
        </GroupSection>

        <PreviewSection>
          <PreviewTitle>效果预览</PreviewTitle>
          <PreviewText>
            {renderPreview()}
          </PreviewText>
        </PreviewSection>

        <Actions>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button $variant="primary" onClick={handleSave}>
            应用 (Ctrl+Enter)
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

SingerTagEditor.displayName = 'SingerTagEditor';
