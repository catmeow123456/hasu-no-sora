import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { LibraryBrowser } from './LibraryBrowser';
import { TrackSelector } from './TrackSelector';
import { useLibraryData } from './hooks/useLibraryData';
import type { AudioSourceInfo } from './types';
import type { AlbumSummary, Track } from '../../types';

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
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 600px;
  min-height: 500px;
`;

const Header = styled.div`
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    ${theme.colors.surface}, 
    ${theme.colors.surfaceHover}
  );
  border-bottom: 2px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SourceTypeSelector = styled.div`
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  min-height: 400px;
  justify-content: center;
`;

const SourceOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  min-width: 200px;
  text-align: center;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}10;
    transform: translateY(-2px);
  }
`;

const SourceIcon = styled.div`
  font-size: 3rem;
  color: ${theme.colors.primary};
`;

const SourceTitle = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SourceDescription = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const FileInput = styled.input`
  display: none;
`;

const CurrentSourceInfo = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surfaceHover};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const SourceBadge = styled.span<{ $type: 'upload' | 'library' }>`
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
  background: ${props => props.$type === 'upload' ? theme.colors.secondary : theme.colors.primary};
  color: white;
`;

type ViewMode = 'selector' | 'library' | 'tracks';

interface AudioSourceSelectorProps {
  onAudioSelected: (source: AudioSourceInfo, shouldPlay?: boolean) => void;
  onCancel: () => void;
  currentSource?: AudioSourceInfo;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  onAudioSelected,
  onCancel,
  currentSource
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumSummary | null>(null);
  const { loadAlbum, selectedAlbum: albumDetails } = useLibraryData();

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audioSource: AudioSourceInfo = {
        type: 'upload',
        file
      };
      onAudioSelected(audioSource);
    }
  }, [onAudioSelected]);

  // 处理专辑选择
  const handleAlbumSelect = useCallback(async (album: AlbumSummary) => {
    setSelectedAlbum(album);
    await loadAlbum(album.id);
    setViewMode('tracks');
  }, [loadAlbum]);

  // 处理曲目选择
  const handleTrackSelect = useCallback((track: Track, shouldPlay?: boolean) => {
    if (!selectedAlbum) return;
    
    const audioSource: AudioSourceInfo = {
      type: 'library',
      albumId: selectedAlbum.id,
      albumName: selectedAlbum.name,
      trackId: track.id,
      trackFilename: track.filename,
      trackTitle: track.title,
      audioUrl: `/audio/${encodeURIComponent(selectedAlbum.name)}/${encodeURIComponent(track.filename)}`
    };
    
    onAudioSelected(audioSource, shouldPlay);
  }, [selectedAlbum, onAudioSelected]);

  // 返回到专辑选择
  const handleBackToLibrary = useCallback(() => {
    setViewMode('library');
    setSelectedAlbum(null);
  }, []);

  // 返回到源类型选择
  const handleBackToSelector = useCallback(() => {
    setViewMode('selector');
    setSelectedAlbum(null);
  }, []);

  const renderContent = () => {
    switch (viewMode) {
      case 'library':
        return (
          <LibraryBrowser
            onAlbumSelect={handleAlbumSelect}
            onBack={handleBackToSelector}
          />
        );
      
      case 'tracks':
        return albumDetails ? (
          <TrackSelector
            album={albumDetails}
            onTrackSelect={handleTrackSelect}
            onBack={handleBackToLibrary}
          />
        ) : null;
      
      default:
        return (
          <SourceTypeSelector>
            <SourceOption onClick={() => document.getElementById('audio-source-file-input')?.click()}>
              <SourceIcon>📁</SourceIcon>
              <SourceTitle>上传音频文件</SourceTitle>
              <SourceDescription>
                从本地选择音频文件<br />
                支持 MP3, WAV, FLAC, M4A, OGG 格式
              </SourceDescription>
            </SourceOption>
            
            <SourceOption onClick={() => setViewMode('library')}>
              <SourceIcon>🎵</SourceIcon>
              <SourceTitle>从曲库选择</SourceTitle>
              <SourceDescription>
                从项目音乐库中选择音频文件<br />
                包含所有已收录的专辑和曲目
              </SourceDescription>
            </SourceOption>
            
            <FileInput
              id="audio-source-file-input"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
            />
          </SourceTypeSelector>
        );
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'library':
        return '🎵 选择专辑';
      case 'tracks':
        return `🎵 选择曲目 - ${selectedAlbum?.name}`;
      default:
        return '🎵 选择音频源';
    }
  };

  return (
    <Overlay onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{getTitle()}</Title>
          <CloseButton onClick={onCancel}>×</CloseButton>
        </Header>
        
        {currentSource && (
          <CurrentSourceInfo>
            <span>当前音频:</span>
            <SourceBadge $type={currentSource.type}>
              {currentSource.type === 'upload' ? '上传文件' : '曲库文件'}
            </SourceBadge>
            <span>
              {currentSource.type === 'upload' 
                ? currentSource.file?.name 
                : `${currentSource.albumName} - ${currentSource.trackTitle}`
              }
            </span>
          </CurrentSourceInfo>
        )}
        
        <Content>
          {renderContent()}
        </Content>
      </Dialog>
    </Overlay>
  );
};

AudioSourceSelector.displayName = 'AudioSourceSelector';
