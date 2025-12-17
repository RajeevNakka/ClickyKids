import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import { useProgress } from '../contexts/ProgressContext';
import './ParentDashboard.css';

function ParentDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profiles, activeProfile, deleteProfile, updateProfile } = useProfile();
    const { progress, getTotalTimeSpent, getTotalExercises, getAverageAccuracy, getRecommendations, resetProgress } = useProgress();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [storedPin, setStoredPin] = useState(() => {
        return localStorage.getItem('clickykids-parent-pin') || '1234';
    });
    const [showSettings, setShowSettings] = useState(false);
    const [newPin, setNewPin] = useState('');

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin === storedPin) {
            setIsAuthenticated(true);
        } else {
            setPin('');
        }
    };

    const handleSetNewPin = () => {
        if (newPin.length === 4) {
            localStorage.setItem('clickykids-parent-pin', newPin);
            setStoredPin(newPin);
            setNewPin('');
            setShowSettings(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    if (!isAuthenticated) {
        return (
            <div className="pin-screen">
                <div className="pin-container animate-fadeIn">
                    <h2 className="pin-title">🔒 {t('parent.enterPin')}</h2>
                    <form onSubmit={handlePinSubmit}>
                        <div className="pin-input-group">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`}>
                                    {pin.length > i ? '•' : ''}
                                </div>
                            ))}
                        </div>
                        <div className="pin-keypad">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '←'].map((num, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`pin-key ${num === '' ? 'empty' : ''}`}
                                    onClick={() => {
                                        if (num === '←') {
                                            setPin(p => p.slice(0, -1));
                                        } else if (num !== '' && pin.length < 4) {
                                            setPin(p => p + num);
                                        }
                                    }}
                                    disabled={num === ''}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </form>
                    <button className="btn mt-xl" onClick={() => navigate('/')}>
                        ← {t('nav.back')}
                    </button>
                    <p className="pin-hint">Default PIN: 1234</p>
                </div>
            </div>
        );
    }

    const totalTime = getTotalTimeSpent();
    const totalExercises = getTotalExercises();
    const recommendations = getRecommendations();

    return (
        <div className="parent-dashboard">
            <div className="dashboard-header">
                <h1>👨‍👩‍👧 {t('parent.title')}</h1>
                <div className="header-actions">
                    <button className="btn" onClick={() => setShowSettings(!showSettings)}>
                        ⚙️ {t('parent.settings')}
                    </button>
                    <button className="btn" onClick={() => {
                        setIsAuthenticated(false);
                        setPin('');
                    }}>
                        🔒 Lock
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="settings-panel animate-fadeIn">
                    <h3>{t('settings.parentPin')}</h3>
                    <div className="pin-change">
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="New 4-digit PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            className="form-input"
                        />
                        <button className="btn btn-primary" onClick={handleSetNewPin}>
                            Save PIN
                        </button>
                    </div>
                </div>
            )}

            {activeProfile && (
                <div className="current-profile-info">
                    <span className="profile-avatar-large">{activeProfile.avatar}</span>
                    <div className="profile-details">
                        <h2>{activeProfile.name}</h2>
                        <p>{activeProfile.age} {t('profile.years')} • {t(`profile.${activeProfile.difficulty}`)}</p>
                    </div>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{formatTime(totalTime)}</div>
                    <div className="stat-label">{t('parent.timeSpent')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-value">{totalExercises}</div>
                    <div className="stat-label">{t('parent.skillsLearned')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{getAverageAccuracy('clicking') || 0}%</div>
                    <div className="stat-label">{t('parent.accuracy')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{progress.streak?.current || 0}</div>
                    <div className="stat-label">{t('parent.streak')}</div>
                </div>
            </div>

            <div className="progress-section">
                <h3>{t('parent.progress')}</h3>
                <div className="progress-bars">
                    <div className="progress-item">
                        <span className="progress-label">🖱️ Mouse Movement</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill mouse"
                                style={{ width: `${Math.min(100, (progress.timeSpent?.mouseMovement || 0) / 3)}%` }}
                            />
                        </div>
                    </div>
                    <div className="progress-item">
                        <span className="progress-label">👆 Clicking</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill clicking"
                                style={{ width: `${Math.min(100, (progress.timeSpent?.mouseClicking || 0) / 3)}%` }}
                            />
                        </div>
                    </div>
                    <div className="progress-item">
                        <span className="progress-label">⌨️ Keyboard</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill keyboard"
                                style={{ width: `${Math.min(100, (progress.timeSpent?.keyboardBasic || 0) / 3)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="recommendations-section">
                    <h3>💡 {t('parent.recommendations')}</h3>
                    <div className="recommendations-list">
                        {recommendations.map((rec, i) => (
                            <div key={i} className={`recommendation ${rec.type}`}>
                                {rec.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="profiles-section">
                <h3>{t('parent.profiles')}</h3>
                <div className="profiles-list">
                    {profiles.map(profile => (
                        <div key={profile.id} className="profile-item">
                            <span className="profile-avatar">{profile.avatar}</span>
                            <span className="profile-name">{profile.name}</span>
                            <span className="profile-age">{profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '?'} yrs</span>
                            <select
                                className="difficulty-select"
                                value={profile.difficulty}
                                onChange={(e) => updateProfile(profile.id, { difficulty: e.target.value })}
                            >
                                <option value="beginner">{t('profile.beginner')}</option>
                                <option value="intermediate">{t('profile.intermediate')}</option>
                                <option value="advanced">{t('profile.advanced')}</option>
                            </select>
                            <button
                                className="delete-btn"
                                onClick={() => {
                                    if (confirm('Delete this profile?')) {
                                        deleteProfile(profile.id);
                                    }
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;
