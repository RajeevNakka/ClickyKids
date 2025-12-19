import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import './Settings.css';

const difficulties = [
    { id: 'beginner', icon: '🌱', color: '#22C55E' },
    { id: 'intermediate', icon: '🌿', color: '#3B82F6' },
    { id: 'advanced', icon: '🌳', color: '#8B5CF6' },
];

function Settings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeProfile, updateProfile, profiles, deleteProfile } = useProfile();

    const [selectedDifficulty, setSelectedDifficulty] = useState(activeProfile?.difficulty || 'beginner');
    const [showConfirm, setShowConfirm] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        if (activeProfile) {
            updateProfile(activeProfile.id, { difficulty: selectedDifficulty });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleDeleteProfile = () => {
        if (activeProfile) {
            deleteProfile(activeProfile.id);
            navigate('/profiles');
        }
    };

    if (!activeProfile) {
        return (
            <div className="settings-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <div className="no-profile">
                    <h2>No Profile Selected</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/profiles')}>
                        Select Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h1 className="settings-title">⚙️ Settings</h1>

            {/* Profile Info */}
            <div className="settings-section">
                <h2 className="section-title">Profile</h2>
                <div className="profile-info">
                    <span className="profile-avatar-large">{activeProfile.avatar}</span>
                    <div className="profile-details">
                        <span className="profile-name-large">{activeProfile.name}</span>
                        <span className="profile-age">Age: {activeProfile.age} years</span>
                    </div>
                </div>
            </div>

            {/* Difficulty Setting */}
            <div className="settings-section">
                <h2 className="section-title">Difficulty Level</h2>
                <p className="section-desc">Adjust the difficulty for games and exercises</p>

                <div className="difficulty-options">
                    {difficulties.map(diff => (
                        <button
                            key={diff.id}
                            className={`difficulty-option ${selectedDifficulty === diff.id ? 'selected' : ''}`}
                            style={{ '--diff-color': diff.color }}
                            onClick={() => setSelectedDifficulty(diff.id)}
                        >
                            <span className="diff-icon">{diff.icon}</span>
                            <span className="diff-name">{diff.id.charAt(0).toUpperCase() + diff.id.slice(1)}</span>
                            <span className="diff-desc">
                                {diff.id === 'beginner' && 'Large targets, slow speed'}
                                {diff.id === 'intermediate' && 'Medium targets'}
                                {diff.id === 'advanced' && 'Small targets, faster'}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary save-btn"
                    onClick={handleSave}
                    disabled={selectedDifficulty === activeProfile.difficulty}
                >
                    {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Danger Zone */}
            <div className="settings-section danger-zone">
                <h2 className="section-title">Danger Zone</h2>

                {!showConfirm ? (
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowConfirm(true)}
                    >
                        Delete Profile
                    </button>
                ) : (
                    <div className="confirm-delete">
                        <p>Are you sure? This cannot be undone.</p>
                        <div className="confirm-buttons">
                            <button className="btn" onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDeleteProfile}>Yes, Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
