import React from 'react';
import styled from 'styled-components';
import { AlbumSummary } from '../types';
import { apiService } from '../services/api';
import { theme } from '../styles/theme';
import { LazyImage } from './LazyImage';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;
  
  /* 极致性能优化 */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  /* 只动画 transform，最快速度 */
  transition: transform 120ms ease-out;

  &:hover {
    /* 只有位移动画，零重绘开销 */
    transform: translateY(-6px) translateZ(0);
  }
`;

const CoverContainer = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.$hasImage ? 'transparent' : theme.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
`;

const PlaceholderIcon = styled.div`
  font-size: ${theme.fontSizes['4xl']};
  color: ${theme.colors.text.muted};
  opacity: 0.6;
`;

const Details = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};
  background: ${theme.colors.surface};
`;

const Name = styled.h3`
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

const Meta = styled.div`
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

interface AlbumCardProps {
  album: AlbumSummary;
  onSelect: (albumId: string) => void;
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

export const AlbumCard: React.FC<AlbumCardProps> = React.memo(({ album, onSelect }) => {
  const handleClick = () => {
    onSelect(album.id);
  };

  return (
    <Card onClick={handleClick}>
      <CoverContainer $hasImage={!!album.coverImage}>
        {album.coverImage ? (
          <LazyImage
            src={apiService.getCoverImageUrl(album.id, album.coverImage)}
            alt={album.name}
            placeholder={<PlaceholderIcon>🎵</PlaceholderIcon>}
          />
        ) : (
          <PlaceholderIcon>🎵</PlaceholderIcon>
        )}
      </CoverContainer>
      <Details>
        <Name>{album.name}</Name>
        <Meta>
          {album.releaseDate && (
            <>
              <span>{formatReleaseDate(album.releaseDate)}</span>
              <MetaSeparator>|</MetaSeparator>
            </>
          )}
          <span>{album.trackCount} 首歌曲</span>
        </Meta>
      </Details>
    </Card>
  );
});

AlbumCard.displayName = 'AlbumCard';
