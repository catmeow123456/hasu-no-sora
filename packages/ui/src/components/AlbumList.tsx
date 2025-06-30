import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AlbumSummary } from '../types';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';
import { Header } from './Header';
import { CuteLoadingSpinner } from './CuteLoadingSpinner';

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

const AlbumCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary};
    background: ${theme.colors.surfaceHover};
  }
`;

const AlbumCover = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.$hasImage ? 'transparent' : theme.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AlbumDetails = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};
  background: ${theme.colors.surface};
`;

const AlbumMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

const MetaSeparator = styled.span`
  color: ${theme.colors.text.muted};
`;

const PlaceholderIcon = styled.div`
  font-size: ${theme.fontSizes['4xl']};
  color: ${theme.colors.text.muted};
  opacity: 0.6;
`;

const AlbumName = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
  line-height: 1.3;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

// 格式化日期为 YYYY.MM.DD 格式
const formatReleaseDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return '';
  }
};

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
              onClick={() => onAlbumSelect(album.id)}
            >
              <AlbumCover $hasImage={!!album.coverImage}>
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
              <AlbumDetails>
                <AlbumName>{album.name}</AlbumName>
                <AlbumMeta>
                  {album.releaseDate && (
                    <>
                      <span>{formatReleaseDate(album.releaseDate)}</span>
                      <MetaSeparator>|</MetaSeparator>
                    </>
                  )}
                  <span>{album.trackCount} 首歌曲</span>
                </AlbumMeta>
              </AlbumDetails>
            </AlbumCard>
          ))}
        </AlbumGrid>
      </ContentContainer>
    </Container>
  );
};
