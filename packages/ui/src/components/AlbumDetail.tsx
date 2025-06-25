import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Album, Track } from '../types';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.gradients.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const BackButton = styled.button`
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  margin-bottom: ${theme.spacing.lg};

  &:hover {
    background: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  }
`;

const AlbumCover = styled.div<{ hasImage: boolean }>`
  width: 300px;
  height: 300px;
  border-radius: ${theme.borderRadius.xl};
  background: ${props => props.hasImage ? 'transparent' : theme.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius.xl};
  }
`;

const PlaceholderIcon = styled.div`
  font-size: 4rem;
  color: ${theme.colors.text.muted};
  opacity: 0.6;
`;

const AlbumInfo = styled.div`
  flex: 1;
`;

const AlbumName = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes['3xl']};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AlbumMeta = styled.p`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
`;

const TrackList = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TrackItem = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${props => props.isActive ? theme.colors.surfaceHover : theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: 2px solid ${props => props.isActive ? theme.colors.primary : 'transparent'};

  &:hover {
    background: ${theme.colors.surfaceHover};
    transform: translateX(4px);
  }
`;

const TrackNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${theme.colors.text.primary};
  margin-right: ${theme.spacing.md};
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  flex: 1;
`;

const TrackTitle = styled.h3`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const TrackDuration = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

const PlayIcon = styled.div<{ isPlaying: boolean }>`
  width: 24px;
  height: 24px;
  margin-left: ${theme.spacing.md};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.border};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: ${theme.colors.accent};
  font-size: ${theme.fontSizes.lg};
  padding: ${theme.spacing.xl};
`;

interface AlbumDetailProps {
  albumId: string;
  onBack: () => void;
  onTrackSelect: (track: Track, album: Album) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({
  albumId,
  onBack,
  onTrackSelect,
  currentTrack,
  isPlaying
}) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        setLoading(true);
        const albumData = await apiService.getAlbum(albumId);
        setAlbum(albumData);
        setError(null);
      } catch (err) {
        setError('无法加载专辑详情');
        console.error('Error loading album:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [albumId]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container>
        <BackButton onClick={onBack}>← 返回专辑列表</BackButton>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !album) {
    return (
      <Container>
        <BackButton onClick={onBack}>← 返回专辑列表</BackButton>
        <ErrorMessage>{error || '专辑不存在'}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={onBack}>← 返回专辑列表</BackButton>
      
      <Header>
        <AlbumCover hasImage={!!album.coverImage}>
          {album.coverImage ? (
            <img
              src={apiService.getCoverImageUrl(album.id, album.coverImage)}
              alt={album.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <PlaceholderIcon>🎵</PlaceholderIcon>
          )}
        </AlbumCover>
        
        <AlbumInfo>
          <AlbumName>{album.name}</AlbumName>
          <AlbumMeta>{album.tracks.length} 首歌曲</AlbumMeta>
        </AlbumInfo>
      </Header>

      <TrackList>
        {album.tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          return (
            <TrackItem
              key={track.id}
              isActive={isCurrentTrack}
              onClick={() => onTrackSelect(track, album)}
            >
              <TrackNumber>{index + 1}</TrackNumber>
              <TrackInfo>
                <TrackTitle>{track.title}</TrackTitle>
                <TrackDuration>{formatDuration(track.duration)}</TrackDuration>
              </TrackInfo>
              <PlayIcon isPlaying={isCurrentTrack && isPlaying}>
                {isCurrentTrack && isPlaying ? '⏸️' : '▶️'}
              </PlayIcon>
            </TrackItem>
          );
        })}
      </TrackList>
    </Container>
  );
};
