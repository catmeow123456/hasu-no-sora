export interface Track {
  id: string;
  title: string;
  filename: string;
  duration?: number;
  albumId: string;
  hasLyrics?: boolean;
}

export interface LyricLine {
  time: number;        // 时间戳（秒）
  text: string;        // 歌词文本
  originalTime: string; // 原始时间格式 [mm:ss.xx]
}

export interface Lyrics {
  trackId: string;
  lines: LyricLine[];
  hasLyrics: boolean;
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
