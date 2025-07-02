export interface Track {
  id: string;
  title: string;
  filename: string;
  duration?: number;
  albumId: string;
  hasLyrics?: boolean;
}

export interface LyricSegment {
  text: string;        // 文本片段
  singer?: string;     // 歌手简称 (kozue, kaho, sayaka 等)
}

export interface LyricLine {
  time: number;        // 时间戳（秒）
  text: string;        // 完整歌词文本
  originalTime: string; // 原始时间格式 [mm:ss.xx]
  segments: LyricSegment[]; // 歌词分段，支持多歌手
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
  path: string;
  releaseDate?: string;
}

export interface MusicLibrary {
  albums: Album[];
}
