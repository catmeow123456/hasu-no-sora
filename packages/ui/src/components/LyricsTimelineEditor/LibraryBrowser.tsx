import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useLibraryData } from './hooks/useLibraryData';
import { LazyImage } from '../LazyImage';
import type { AlbumSummary } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SearchBar = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
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

const AlbumsGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  
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

const AlbumCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: 1px solid ${theme.colors.border};
  
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

const AlbumCover = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${theme.colors.surfaceHover};
  overflow: hidden;
`;

const AlbumInfo = styled.div`
  padding: ${theme.spacing.md};
`;

const AlbumName = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AlbumMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
`;

const TrackCount = styled.span`
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-weight: 500;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

const ErrorState = styled.div`
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

const RetryButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.secondary};
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

interface LibraryBrowserProps {
  onAlbumSelect: (album: AlbumSummary) => void;
  onBack: () => void;
}

export const LibraryBrowser: React.FC<LibraryBrowserProps> = ({
  onAlbumSelect,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading, error, loadAlbums, searchAlbums } = useLibraryData();

  // 搜索过滤后的专辑列表
  const filteredAlbums = useMemo(() => {
    return searchAlbums(searchQuery);
  }, [searchAlbums, searchQuery]);

  // 处理搜索输入
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // 处理专辑点击
  const handleAlbumClick = useCallback((album: AlbumSummary) => {
    onAlbumSelect(album);
  }, [onAlbumSelect]);

  // 处理重试
  const handleRetry = useCallback(() => {
    loadAlbums();
  }, [loadAlbums]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <LoadingState>
          <div>🎵 加载专辑列表中...</div>
        </LoadingState>
      );
    }

    if (error) {
      return (
        <ErrorState>
          <div>❌ 加载失败</div>
          <div>{error}</div>
          <RetryButton onClick={handleRetry}>重试</RetryButton>
        </ErrorState>
      );
    }

    if (filteredAlbums.length === 0) {
      return (
        <EmptyState>
          <div>🔍 {searchQuery ? '没有找到匹配的专辑' : '暂无专辑'}</div>
          {searchQuery && (
            <div>尝试使用不同的关键词搜索</div>
          )}
        </EmptyState>
      );
    }

    return (
      <AlbumsGrid>
        {filteredAlbums.map((album) => (
          <AlbumCard key={album.id} onClick={() => handleAlbumClick(album)}>
            <AlbumCover>
              {album.coverImage ? (
                <LazyImage
                  src={`/api/images/${album.id}/${album.coverImage}`}
                  alt={album.name}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: theme.colors.text.secondary
                }}>
                  🎵
                </div>
              )}
            </AlbumCover>
            
            <AlbumInfo>
              <AlbumName>{album.name}</AlbumName>
              <AlbumMeta>
                <TrackCount>{album.trackCount} 首</TrackCount>
                {album.releaseDate && (
                  <span>{new Date(album.releaseDate).getFullYear()}</span>
                )}
              </AlbumMeta>
            </AlbumInfo>
          </AlbumCard>
        ))}
      </AlbumsGrid>
    );
  };

  return (
    <Container>
      <SearchBar>
        <BackButton onClick={onBack}>
          ← 返回
        </BackButton>
        <SearchInput
          type="text"
          placeholder="搜索专辑..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchBar>
      
      {renderContent()}
    </Container>
  );
};

LibraryBrowser.displayName = 'LibraryBrowser';
