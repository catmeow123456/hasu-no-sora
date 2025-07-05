import { useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { AlbumList } from './components/AlbumList';
import { AlbumDetail } from './components/AlbumDetail';
import { AudioPlayer } from './components/AudioPlayer';
import { LyricsPanel } from './components/LyricsPanel';
import { LoginForm } from './components/LoginForm';
import { CuteLoadingSpinner } from './components/CuteLoadingSpinner';
import { TimelineEditor } from './components/LyricsTimelineEditor';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useLyrics } from './hooks/useLyrics';
import { useAuth } from './hooks/useAuth';
import { theme } from './styles/theme';
import { Track, Album } from './types';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.fonts.primary};
    background: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    line-height: 1.6;
  }

  html, body, #root {
    height: 100%;
  }

  button {
    font-family: inherit;
  }

  input {
    font-family: inherit;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.secondary};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  padding-bottom: 120px; /* 为底部播放器留出空间 */
`;

type ViewType = 'albums' | 'album-detail';

interface AppState {
  currentView: ViewType;
  selectedAlbumId: string | null;
}

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.gradients.background};
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 140px; /* Above the audio player */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${theme.shadows.lg};
  transition: all ${theme.transitions.fast};
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${theme.shadows.xl};
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
  }
`;

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'albums',
    selectedAlbumId: null,
  });

  const [showTimelineEditor, setShowTimelineEditor] = useState(false);

  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    login,
    clearError,
  } = useAuth();

  const {
    playerState,
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    formatTime,
  } = useAudioPlayer();

  // 歌词功能
  const {
    lyrics,
    isLoading: lyricsLoading,
    error: lyricsError,
  } = useLyrics(playerState.currentTrack, playerState.currentAlbum);

  const handleLogin = async (password: string) => {
    clearError();
    await login(password);
  };

  const handleAlbumSelect = (albumId: string) => {
    setAppState({
      currentView: 'album-detail',
      selectedAlbumId: albumId,
    });
  };

  const handleBackToAlbums = () => {
    setAppState({
      currentView: 'albums',
      selectedAlbumId: null,
    });
  };

  const handleTrackSelect = (track: Track, album: Album) => {
    playTrack(track, album);
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'albums':
        return <AlbumList onAlbumSelect={handleAlbumSelect} />;
      
      case 'album-detail':
        if (!appState.selectedAlbumId) {
          return <AlbumList onAlbumSelect={handleAlbumSelect} />;
        }
        return (
          <AlbumDetail
            albumId={appState.selectedAlbumId}
            onBack={handleBackToAlbums}
            onTrackSelect={handleTrackSelect}
            currentTrack={playerState.currentTrack}
            isPlaying={playerState.isPlaying}
          />
        );
      
      default:
        return <AlbumList onAlbumSelect={handleAlbumSelect} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      
      {/* 认证加载状态 */}
      {authLoading && (
        <LoadingContainer>
          <CuteLoadingSpinner />
        </LoadingContainer>
      )}
      
      {/* 未认证时显示登录界面 */}
      {!authLoading && !isAuthenticated && (
        <LoginForm
          onLogin={handleLogin}
          isLoading={authLoading}
          error={authError}
        />
      )}
      
      {/* 已认证时显示音乐播放器 */}
      {!authLoading && isAuthenticated && (
        <AppContainer>
          {renderCurrentView()}
          
          {/* 歌词面板 - 只在有正在播放的歌曲时显示 */}
          <LyricsPanel
            lyrics={lyrics}
            currentTime={playerState.currentTime}
            isPlaying={playerState.isPlaying}
            isLoading={lyricsLoading}
            error={lyricsError}
            trackTitle={playerState.currentTrack?.title}
            initialState="preview"
          />
          
          {/* 歌词时间轴编辑器浮动按钮 */}
          <FloatingActionButton
            onClick={() => setShowTimelineEditor(true)}
            title="打开歌词时间轴生成工具"
          >
            🎵
          </FloatingActionButton>
          
          <AudioPlayer
            playerState={playerState}
            onPlayPause={togglePlayPause}
            onPrevious={playPrevious}
            onNext={playNext}
            onSeek={seekTo}
            onVolumeChange={setVolume}
            formatTime={formatTime}
          />
          
          {/* 歌词时间轴编辑器 */}
          {showTimelineEditor && (
            <TimelineEditor
              onClose={() => setShowTimelineEditor(false)}
            />
          )}
        </AppContainer>
      )}
    </ThemeProvider>
  );
}

export default App;
