import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import './ProfileSelector.css';

const avatars = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸'];

function ProfileSelector() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profiles, addProfile, selectProfile, suggestDifficulty, calculateAge } = useProfile();

    const [isAdding, setIsAdding] = useState(profiles.length === 0);
    const [newProfile, setNewProfile] = useState({
        name: '',
        dob: '',
        avatar: '👦'
    });

    const handleSelectProfile = (profile) => {
        selectProfile(profile.id);
        navigate('/');
    };

    const handleAddProfile = (e) => {
        e.preventDefault();
        if (newProfile.name && newProfile.dob) {
            const profile = addProfile(newProfile);
            selectProfile(profile.id);
            navigate('/');
        }
    };

    const age = newProfile.dob ? calculateAge(newProfile.dob) : null;
    const suggestedLevel = age !== null ? suggestDifficulty(age) : null;

    return (
        <div className="profile-selector-page">
            <div className="profile-selector-container">
                <h1 className="profile-title animate-fadeIn">
                    {isAdding ? '✨ ' + t('profile.addNew') : '👋 ' + t('profile.title')}
                </h1>

                {!isAdding && profiles.length > 0 ? (
                    <>
                        <div className="profiles-grid">
                            {profiles.map((profile, index) => (
                                <button
                                    key={profile.id}
                                    className="profile-card animate-pop"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => handleSelectProfile(profile)}
                                >
                                    <span className="profile-card-avatar">{profile.avatar}</span>
                                    <span className="profile-card-name">{profile.name}</span>
                                    <span className="profile-card-age">
                                        {calculateAge(profile.dob)} {t('profile.years')}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-large btn-fun mt-xl"
                            onClick={() => setIsAdding(true)}
                        >
                            ➕ {t('profile.addNew')}
                        </button>
                    </>
                ) : (
                    <form className="add-profile-form animate-fadeIn" onSubmit={handleAddProfile}>
                        <div className="avatar-selector">
                            {avatars.map(avatar => (
                                <button
                                    key={avatar}
                                    type="button"
                                    className={`avatar-btn ${newProfile.avatar === avatar ? 'selected' : ''}`}
                                    onClick={() => setNewProfile(prev => ({ ...prev, avatar }))}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('profile.name')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newProfile.name}
                                onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter name..."
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('profile.age')}</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newProfile.dob}
                                onChange={(e) => setNewProfile(prev => ({ ...prev, dob: e.target.value }))}
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {age !== null && (
                                <div className="age-display">
                                    <span className="age-value">{age} {t('profile.years')}</span>
                                    <span className="suggested-level">
                                        {t('profile.difficulty')}: {t(`profile.${suggestedLevel}`)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            {profiles.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-large"
                                    onClick={() => setIsAdding(false)}
                                >
                                    ← {t('nav.back')}
                                </button>
                            )}
                            <button type="submit" className="btn btn-large btn-success">
                                ✓ {t('home.welcome')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ProfileSelector;
