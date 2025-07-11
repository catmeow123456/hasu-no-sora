import type { LyricLine, LyricSegment, SingerType } from '../../types';

export type { SingerType, LyricSegment };

export interface EditableLyricLine extends LyricLine {
  id: string;
  isSelected: boolean;
  isDraft: boolean;
  confidence?: number; // AI 辅助的置信度
}

export interface ProjectSettings {
  autoSave: boolean;
  snapToGrid: boolean;
  gridInterval: number; // 毫秒
  defaultSinger?: SingerType;
  enableAIAssist: boolean;
}

export interface ProjectMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author?: string;
  description?: string;
}

export interface AudioSourceInfo {
  type: 'upload' | 'library';
  // 当 type 为 'upload' 时
  file?: File;
  // 当 type 为 'library' 时
  albumId?: string;
  albumName?: string;
  trackId?: string;
  trackFilename?: string;
  trackTitle?: string;
  audioUrl?: string;
}

export interface TimelineProject {
  id: string;
  name: string;
  audioFile: File | string | null;
  lyrics: EditableLyricLine[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  audioSource?: AudioSourceInfo;
}

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
}

export interface ExportOptions {
  includeTimestamps: boolean;
  includeSingerTags: boolean;
  encoding: 'utf-8' | 'gbk';
  lineEnding: 'lf' | 'crlf';
}

export interface WaveformData {
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
}

export interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  playbackRate: number;
}

export interface KeyboardShortcuts {
  onPlayPause: () => void;
  onInsertLyric: () => void;
  onSave: () => void;
  onClose: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onDelete?: () => void;
  onTimeAdjust?: (direction: 'left' | 'right', precision: 'fine' | 'normal' | 'coarse') => void;
  onSelectNext?: () => void;
  onSelectPrevious?: () => void;
  onBatchTimeAdjust?: (offset: number) => void;
  onEditCurrentLine?: () => void;
  onEditCurrentSinger?: () => void;
}

export interface AudioPlayerHook {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setAudioFile: (file: File | null) => void;
  setAudioSource: (source: AudioSourceInfo | null) => void;
}

export interface SaveResult {
  success: boolean;
  message: string;
}

export interface LoadResult {
  success: boolean;
  project?: TimelineProject;
  message?: string;
}

export interface SavedProjectInfo {
  exists: boolean;
  name?: string;
  updatedAt?: Date;
  hasAudio?: boolean;
  lyricsCount?: number;
}

export interface TimelineProjectHook {
  project: TimelineProject;
  updateProject: (updates: Partial<TimelineProject>) => void;
  addLyricLine: (line: EditableLyricLine) => void;
  updateLyricLine: (id: string, updates: Partial<EditableLyricLine>) => void;
  deleteLyricLine: (id: string) => void;
  selectLyricLine: (id: string) => void;
  selectNextLine: () => void;
  selectPreviousLine: () => void;
  adjustSelectedLineTime: (direction: 'left' | 'right', precision: 'fine' | 'normal' | 'coarse') => void;
  batchAdjustTime: (offset: number) => void;
  saveProject: () => Promise<SaveResult>;
  loadProject: (projectId?: string) => Promise<LoadResult>;
  checkForSavedProject: () => SavedProjectInfo;
  clearSavedProject: () => Promise<void>;
  isDirty: boolean;
}
