import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../contexts/ProfileContext';
import { useSettings } from '../../contexts/SettingsContext';
import LanguageSwitcher from './LanguageSwitcher';
import './NavBar.css';

function NavBar({ isFullscreen, onToggleFullscreen }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { activeProfile } = useProfile();
    const { settings, toggleSound, toggleDarkMode } = useSettings();

    const isHome = location.pathname === '/';
    const canGoBack = location.pathname !== '/' && location.pathname !== '/profiles';

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && canGoBack) {
                navigate(-1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canGoBack, navigate]);

    return (
        <nav className="nav-bar">
            <div className="nav-left">
                {canGoBack && (
                    <button
                        className="btn btn-icon small nav-back"
                        onClick={() => navigate(-1)}
                        aria-label={t('nav.back')}
                    >
                        ←
                    </button>
                )}
                <div className="nav-brand" onClick={() => navigate('/')}>
                    🖱️ {t('app.name')}
                </div>
            </div>

            <div className="nav-center">
                {activeProfile && (
                    <div className="active-profile" onClick={() => navigate('/profiles')}>
                        <span className="profile-avatar">{activeProfile.avatar}</span>
                        <span className="profile-name">{activeProfile.name}</span>
                    </div>
                )}
            </div>

            <div className="nav-right">
                <LanguageSwitcher />

                <button
                    className="btn btn-icon small"
                    onClick={toggleSound}
                    aria-label="Toggle Sound"
                    title={settings.soundEnabled ? 'Sound On' : 'Sound Off'}
                >
                    {settings.soundEnabled ? '🔊' : '🔇'}
                </button>

                <button
                    className="btn btn-icon small"
                    onClick={toggleDarkMode}
                    aria-label="Toggle Dark Mode"
                    title={settings.darkMode ? 'Dark Mode' : 'Light Mode'}
                >
                    {settings.darkMode ? '🌙' : '☀️'}
                </button>

                <button
                    className="btn btn-icon small"
                    onClick={onToggleFullscreen}
                    aria-label={t('settings.fullscreen')}
                >
                    {isFullscreen ? '⛶' : '⛶'}
                </button>

                <button
                    className="btn btn-icon small nav-parent"
                    onClick={() => navigate('/parent')}
                    aria-label={t('nav.parent')}
                >
                    👨‍👩‍👧
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
