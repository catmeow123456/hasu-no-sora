import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import type { SavedProjectInfo } from './types';

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
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  box-shadow: ${theme.shadows.lg};
  border: 1px solid ${theme.colors.border};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const Icon = styled.div`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.primary};
`;

const Title = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Content = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Description = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const ProjectInfo = styled.div`
  background: ${theme.colors.surfaceHover};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

const InfoValue = styled.span`
  color: ${theme.colors.text.primary};
  font-weight: 500;
  font-size: ${theme.fontSizes.sm};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
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
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background: ${theme.colors.surface};
      border-color: ${theme.colors.primary};
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${theme.spacing.sm};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface RestoreDialogProps {
  projectInfo: SavedProjectInfo;
  isLoading?: boolean;
  onRestore: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

export const RestoreDialog: React.FC<RestoreDialogProps> = ({
  projectInfo,
  isLoading = false,
  onRestore,
  onStartNew,
  onCancel
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Overlay onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Header>
          <Icon>🔄</Icon>
          <Title>发现未完成的项目</Title>
        </Header>
        
        <Content>
          <Description>
            检测到您有一个未完成的歌词时间轴项目，是否要恢复继续编辑？
          </Description>
          
          <ProjectInfo>
            <InfoRow>
              <InfoLabel>项目名称:</InfoLabel>
              <InfoValue>{projectInfo.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>最后修改:</InfoLabel>
              <InfoValue>
                {projectInfo.updatedAt ? formatDate(projectInfo.updatedAt) : '未知'}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>歌词行数:</InfoLabel>
              <InfoValue>{projectInfo.lyricsCount} 行</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>音频文件:</InfoLabel>
              <InfoValue>
                {projectInfo.hasAudio ? '✅ 已缓存' : '❌ 无音频'}
              </InfoValue>
            </InfoRow>
          </ProjectInfo>
        </Content>
        
        <Actions>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onStartNew}>
            开始新项目
          </Button>
          <Button $variant="primary" onClick={onRestore} disabled={isLoading}>
            {isLoading && <LoadingSpinner />}
            恢复项目
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

RestoreDialog.displayName = 'RestoreDialog';
