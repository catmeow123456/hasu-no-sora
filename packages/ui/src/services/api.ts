import { Album, AlbumSummary } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAlbums(): Promise<AlbumSummary[]> {
    return this.fetchJson<AlbumSummary[]>(`${API_BASE_URL}/albums`);
  }

  async getAlbum(id: string): Promise<Album> {
    return this.fetchJson<Album>(`${API_BASE_URL}/albums/${id}`);
  }

  getAudioUrl(albumName: string, filename: string): string {
    // 对文件名进行 URL 编码以处理特殊字符
    const encodedAlbumName = encodeURIComponent(albumName);
    const encodedFilename = encodeURIComponent(filename);
    return `/audio/${encodedAlbumName}/${encodedFilename}`;
  }

  getCoverImageUrl(albumId: string, filename: string): string {
    const encodedFilename = encodeURIComponent(filename);
    return `${API_BASE_URL}/images/${albumId}/${encodedFilename}`;
  }

  async checkHealth(): Promise<{ status: string; albums: number; timestamp: string }> {
    return this.fetchJson(`${API_BASE_URL}/health`);
  }
}

export const apiService = new ApiService();
