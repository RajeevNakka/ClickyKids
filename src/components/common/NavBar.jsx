import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../contexts/ProfileContext';
import LanguageSwitcher from './LanguageSwitcher';
import './NavBar.css';

function NavBar({ isFullscreen, onToggleFullscreen }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { activeProfile } = useProfile();

    const isHome = location.pathname === '/';
    const canGoBack = location.pathname !== '/' && location.pathname !== '/profiles';

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
