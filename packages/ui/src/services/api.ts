import { Album, AlbumSummary } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      credentials: 'include', // 包含 cookie
    });
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

  // 认证相关 API
  async login(password: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含 cookie
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return response.json();
  }

  async checkAuthStatus(): Promise<{ authenticated: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to check auth status');
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();
