export interface Track {
  id: string;
  title: string;
  filename: string;
  duration?: number;
  albumId: string;
}

export interface Album {
  id: string;
  name: string;
  coverImage?: string;
  tracks: Track[];
  path?: string;
  releaseDate?: string;
}

export interface AlbumSummary {
  id: string;
  name: string;
  coverImage?: string;
  trackCount: number;
  releaseDate?: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}
