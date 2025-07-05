export { TimelineEditor } from './TimelineEditor';
export { AudioWaveform } from './AudioWaveform';
export { LyricLineEditor } from './LyricLineEditor';
export { TimelineControls } from './TimelineControls';
export { PreviewPanel } from './PreviewPanel';
export { ExportDialog } from './ExportDialog';
export { SingerTagEditor } from './SingerTagEditor';

export type {
  TimelineProject,
  EditableLyricLine,
  ProjectSettings,
  ProjectMetadata,
  ExportFormat,
  ExportOptions,
  WaveformData,
  TimelineState,
  KeyboardShortcuts,
  AudioPlayerHook,
  TimelineProjectHook,
  SingerType,
  LyricSegment
} from './types';

export { useTimelineProject } from './hooks/useTimelineProject';
export { useAudioPlayer } from './hooks/useAudioPlayer';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
