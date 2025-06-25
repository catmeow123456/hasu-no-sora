import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AlbumSummary } from '../types';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.gradients.background};
  min-height: 100vh;
`;

const Title = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes['3xl']};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const AlbumCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary};
    background: ${theme.colors.surfaceHover};
  }
`;

const AlbumCover = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 200px;
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.md};
  background: ${props => props.hasImage ? 'transparent' : theme.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius.lg};
  }
`;

const PlaceholderIcon = styled.div`
  font-size: ${theme.fontSizes['4xl']};
  color: ${theme.colors.text.muted};
  opacity: 0.6;
`;

const AlbumName = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  line-height: 1.3;
`;

const TrackCount = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
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

interface AlbumListProps {
  onAlbumSelect: (albumId: string) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({ onAlbumSelect }) => {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setLoading(true);
        const albumData = await apiService.getAlbums();
        setAlbums(albumData);
        setError(null);
      } catch (err) {
        setError('无法加载专辑列表');
        console.error('Error loading albums:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>🌸 Hasu no Sora 音乐播放器</Title>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>🌸 Hasu no Sora 音乐播放器</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🌸 Hasu no Sora 音乐播放器</Title>
      <AlbumGrid>
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            onClick={() => onAlbumSelect(album.id)}
          >
            <AlbumCover hasImage={!!album.coverImage}>
              {album.coverImage ? (
                <img
                  src={apiService.getCoverImageUrl(album.id, album.coverImage)}
                  alt={album.name}
                  onError={(e) => {
                    // 如果图片加载失败，隐藏图片显示占位符
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <PlaceholderIcon>🎵</PlaceholderIcon>
              )}
            </AlbumCover>
            <AlbumName>{album.name}</AlbumName>
            <TrackCount>{album.trackCount} 首歌曲</TrackCount>
          </AlbumCard>
        ))}
      </AlbumGrid>
    </Container>
  );
};
