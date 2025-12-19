import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProfileProvider } from './contexts/ProfileContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { RewardsProvider } from './contexts/RewardsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ClickyKids">
      <SettingsProvider>
        <ProfileProvider>
          <ProgressProvider>
            <RewardsProvider>
              <App />
            </RewardsProvider>
          </ProgressProvider>
        </ProfileProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
