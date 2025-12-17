import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProfileProvider } from './contexts/ProfileContext';
import { ProgressProvider } from './contexts/ProgressContext';
import './i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ProfileProvider>
    </BrowserRouter>
  </React.StrictMode>
);
