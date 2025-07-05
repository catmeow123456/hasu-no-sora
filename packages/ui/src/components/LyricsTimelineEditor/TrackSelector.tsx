import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import type { Album, Track } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const BackButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surfaceHover};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &:hover {
    background: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.sm};
  background: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const AlbumInfo = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surfaceHover};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const AlbumCover = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${theme.colors.text.secondary};
`;

const AlbumDetails = styled.div`
  flex: 1;
`;

const AlbumName = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const AlbumMeta = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  gap: ${theme.spacing.md};
`;

const TracksList = styled.div`
  flex: 1;
  overflow-y: auto;
  
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

const TrackItem = styled.div<{ $isSelected?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  ${props => props.$isSelected && `
    background: ${theme.colors.primary}10;
    border-left: 4px solid ${theme.colors.primary};
  `}
  
  &:hover {
    background: ${theme.colors.surfaceHover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TrackNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  flex-shrink: 0;
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackTitle = styled.div`
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackMeta = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const TrackBadge = styled.span<{ $type: 'lyrics' | 'duration' }>`
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.xs};
  font-weight: 500;
  
  ${props => props.$type === 'lyrics' ? `
    background: ${theme.colors.accent}20;
    color: ${theme.colors.accent};
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text.secondary};
  `}
`;

const PlayButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.primary};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  flex-shrink: 0;
  
  &:hover {
    background: ${theme.colors.secondary};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  gap: ${theme.spacing.md};
`;

interface TrackSelectorProps {
  album: Album;
  onTrackSelect: (track: Track, shouldPlay?: boolean) => void;
  onBack: () => void;
  selectedTrackId?: string;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  album,
  onTrackSelect,
  onBack,
  selectedTrackId
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 搜索过滤后的曲目列表
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return album.tracks;
    
    const lowerQuery = searchQuery.toLowerCase();
    return album.tracks.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.filename.toLowerCase().includes(lowerQuery)
    );
  }, [album.tracks, searchQuery]);

  // 处理搜索输入
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // 处理曲目选择
  const handleTrackClick = useCallback((track: Track) => {
    onTrackSelect(track);
  }, [onTrackSelect]);

  // 格式化时长
  const formatDuration = useCallback((seconds?: number): string => {
    if (!seconds) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 获取曲目序号
  const getTrackNumber = useCallback((track: Track): number => {
    return album.tracks.indexOf(track) + 1;
  }, [album.tracks]);

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          ← 返回专辑
        </BackButton>
        <SearchInput
          type="text"
          placeholder="搜索曲目..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Header>
      
      <AlbumInfo>
        <AlbumCover>
          {album.coverImage ? (
            <img 
              src={`/api/images/${album.id}/${album.coverImage}`}
              alt={album.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '🎵'
          )}
        </AlbumCover>
        
        <AlbumDetails>
          <AlbumName>{album.name}</AlbumName>
          <AlbumMeta>
            <span>{album.tracks.length} 首曲目</span>
            {album.releaseDate && (
              <span>{new Date(album.releaseDate).getFullYear()}</span>
            )}
          </AlbumMeta>
        </AlbumDetails>
      </AlbumInfo>
      
      <TracksList>
        {filteredTracks.length === 0 ? (
          <EmptyState>
            <div>🔍 {searchQuery ? '没有找到匹配的曲目' : '暂无曲目'}</div>
            {searchQuery && (
              <div>尝试使用不同的关键词搜索</div>
            )}
          </EmptyState>
        ) : (
          filteredTracks.map((track) => (
            <TrackItem
              key={track.id}
              $isSelected={track.id === selectedTrackId}
              onClick={() => handleTrackClick(track)}
            >
              <TrackNumber>
                {getTrackNumber(track)}
              </TrackNumber>
              
              <TrackInfo>
                <TrackTitle>{track.title}</TrackTitle>
                <TrackMeta>
                  <TrackBadge $type="duration">
                    {formatDuration(track.duration)}
                  </TrackBadge>
                  {track.hasLyrics && (
                    <TrackBadge $type="lyrics">
                      有歌词
                    </TrackBadge>
                  )}
                </TrackMeta>
              </TrackInfo>
              
              <PlayButton onClick={(e) => {
                e.stopPropagation();
                onTrackSelect(track, true);
              }}>
                ▶
              </PlayButton>
            </TrackItem>
          ))
        )}
      </TracksList>
    </Container>
  );
};

TrackSelector.displayName = 'TrackSelector';
