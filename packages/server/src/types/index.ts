export type SingerType = 
  | 'kozue' | 'kaho' | 'sayaka' | 'tsuzuri' | 'rurino' 
  | 'megumi' | 'ginko' | 'kosuzu' | 'himena'
  | 'cerise' | 'dollche' | 'miracra' // 新增小组
  | 'hasunosora'; // 新增 hasu-no-sora 主题色

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
  singer?: SingerType; // 歌手简称，支持个人歌手和小组
  singers?: SingerType[]; // 新增：多歌手数组，用于彩虹效果
  isRainbow?: boolean;    // 新增：标记是否为彩虹效果
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
