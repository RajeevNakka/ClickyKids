import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from './contexts/ProfileContext';

// Pages
import HomePage from './pages/HomePage';
import ProfileSelector from './pages/ProfileSelector';
import MouseLearningMode from './pages/MouseLearningMode';
import MouseGames from './pages/MouseGames';
import KeyboardLearning from './pages/KeyboardLearning';
import ParentDashboard from './pages/ParentDashboard';

// Components
import NavBar from './components/common/NavBar';
import LanguageSwitcher from './components/common/LanguageSwitcher';

function App() {
  const { t } = useTranslation();
  const { activeProfile } = useProfile();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="app">
      <NavBar
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <main className="main-content" style={{ paddingTop: '80px' }}>
        <Routes>
          {/* Profile Selection */}
          <Route path="/profiles" element={<ProfileSelector />} />

          {/* Home - requires profile */}
          <Route
            path="/"
            element={
              activeProfile ? <HomePage /> : <Navigate to="/profiles" replace />
            }
          />

          {/* Mouse Learning */}
          <Route path="/mouse" element={<MouseLearningMode />} />
          <Route path="/mouse/games" element={<MouseGames />} />
          <Route path="/mouse/games/:gameId" element={<MouseGames />} />

          {/* Keyboard Learning */}
          <Route path="/keyboard" element={<KeyboardLearning />} />
          <Route path="/keyboard/:exerciseId" element={<KeyboardLearning />} />

          {/* Parent Dashboard */}
          <Route path="/parent" element={<ParentDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/profiles" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
