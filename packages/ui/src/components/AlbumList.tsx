import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AlbumSummary } from '../types';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';
import { Header } from './Header';
import { CuteLoadingSpinner } from './CuteLoadingSpinner';
import { AlbumCard } from './AlbumCard';

const Container = styled.div`
  background: ${theme.gradients.background};
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

export const AlbumList: React.FC<AlbumListProps> = React.memo(({ onAlbumSelect }) => {
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
        <Header />
        <ContentContainer>
          <CuteLoadingSpinner 
            text="加载专辑中..."
            subText="正在为您准备美妙的音乐收藏 ♪"
          />
        </ContentContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header />
        <ContentContainer>
          <ErrorMessage>{error}</ErrorMessage>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      <ContentContainer>
        <AlbumGrid>
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onSelect={onAlbumSelect}
            />
          ))}
        </AlbumGrid>
      </ContentContainer>
    </Container>
  );
});

AlbumList.displayName = 'AlbumList';
