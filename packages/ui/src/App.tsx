import React, { useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { AlbumList } from './components/AlbumList';
import { AlbumDetail } from './components/AlbumDetail';
import { AudioPlayer } from './components/AudioPlayer';
import { useAudioPlayer } from './hooks/useAudioPlayer';
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

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'albums',
    selectedAlbumId: null,
  });

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
      <AppContainer>
        {renderCurrentView()}
        
        <AudioPlayer
          playerState={playerState}
          onPlayPause={togglePlayPause}
          onPrevious={playPrevious}
          onNext={playNext}
          onSeek={seekTo}
          onVolumeChange={setVolume}
          formatTime={formatTime}
        />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
