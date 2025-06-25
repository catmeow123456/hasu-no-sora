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
  path: string;
}

export interface MusicLibrary {
  albums: Album[];
}
