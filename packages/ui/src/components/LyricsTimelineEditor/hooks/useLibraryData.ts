import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../../services/api';
import type { Album, AlbumSummary, Track } from '../../../types';

interface LibraryDataHook {
  albums: AlbumSummary[];
  selectedAlbum: Album | null;
  isLoading: boolean;
  error: string | null;
  loadAlbums: () => Promise<void>;
  loadAlbum: (albumId: string) => Promise<void>;
  searchAlbums: (query: string) => AlbumSummary[];
  searchTracks: (query: string) => Track[];
  clearSelectedAlbum: () => void;
}

export const useLibraryData = (): LibraryDataHook => {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载专辑列表
  const loadAlbums = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const albumsData = await apiService.getAlbums();
      setAlbums(albumsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载专辑列表失败';
      setError(errorMessage);
      console.error('Failed to load albums:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 加载特定专辑的详细信息
  const loadAlbum = useCallback(async (albumId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const albumData = await apiService.getAlbum(albumId);
      setSelectedAlbum(albumData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载专辑详情失败';
      setError(errorMessage);
      console.error('Failed to load album:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 搜索专辑
  const searchAlbums = useCallback((query: string): AlbumSummary[] => {
    if (!query.trim()) return albums;
    
    const lowerQuery = query.toLowerCase();
    return albums.filter(album => 
      album.name.toLowerCase().includes(lowerQuery)
    );
  }, [albums]);

  // 搜索曲目
  const searchTracks = useCallback((query: string): Track[] => {
    if (!selectedAlbum || !query.trim()) {
      return selectedAlbum?.tracks || [];
    }
    
    const lowerQuery = query.toLowerCase();
    return selectedAlbum.tracks.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.filename.toLowerCase().includes(lowerQuery)
    );
  }, [selectedAlbum]);

  // 清除选中的专辑
  const clearSelectedAlbum = useCallback(() => {
    setSelectedAlbum(null);
  }, []);

  // 组件挂载时自动加载专辑列表
  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return {
    albums,
    selectedAlbum,
    isLoading,
    error,
    loadAlbums,
    loadAlbum,
    searchAlbums,
    searchTracks,
    clearSelectedAlbum
  };
};
