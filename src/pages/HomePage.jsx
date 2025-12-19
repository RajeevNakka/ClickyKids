import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import { useAudio } from '../hooks/useAudio';
import './HomePage.css';

function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeProfile } = useProfile();
    const { speak } = useAudio();

    // Speak welcome message on load
    useEffect(() => {
        if (activeProfile) {
            setTimeout(() => {
                speak(`${t('home.welcome')} ${activeProfile.name}! ${t('home.chooseActivity')}`);
            }, 500);
        }
    }, [activeProfile, speak, t]);

    const activities = [
        { id: 'daily', icon: '🌟', title: 'Daily Challenge', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/daily' },
        { id: 'mouse', icon: '🖱️', title: t('home.learnMouse'), gradient: 'var(--gradient-ocean)', path: '/mouse' },
        { id: 'keyboard', icon: '⌨️', title: t('home.learnKeyboard'), gradient: 'var(--gradient-forest)', path: '/keyboard' },
        { id: 'abc', icon: '🔤', title: 'ABC & 123', gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', path: '/abc' },
        { id: 'story', icon: '📖', title: 'Story Time', gradient: 'linear-gradient(135deg, #FFF5E1, #FFE4C4)', path: '/story' },
        { id: 'learn', icon: '📚', title: 'Explore & Learn', gradient: 'var(--gradient-candy)', path: '/learn' },
        { id: 'memory', icon: '🧠', title: 'Memory Match', gradient: 'var(--gradient-primary)', path: '/memory' },
        { id: 'bubbles', icon: '🎈', title: 'Pop Bubbles', gradient: 'var(--gradient-sunrise)', path: '/bubbles' },
        { id: 'simon', icon: '🎯', title: 'Simon Says', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', path: '/simon' },
        { id: 'numberline', icon: '🔢', title: 'Number Line', gradient: 'linear-gradient(135deg, #E0F7FA, #80DEEA)', path: '/numberline' },
        { id: 'dragdrop', icon: '📦', title: 'Drag & Drop', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', path: '/dragdrop' },
        { id: 'colorclick', icon: '🎨', title: 'Color by Click', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', path: '/colorclick' },
        { id: 'connectdots', icon: '✨', title: 'Connect Dots', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/connectdots' },
        { id: 'music', icon: '🎹', title: 'Music Keyboard', gradient: 'linear-gradient(135deg, #2C3E50, #4CA1AF)', path: '/music' },
        { id: 'catch', icon: '🧺', title: 'Catch Game', gradient: 'linear-gradient(135deg, #87CEEB, #98D8C8)', path: '/catch' },
        { id: 'badges', icon: '🏆', title: 'My Badges', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', path: '/badges' },
        { id: 'progress', icon: '📊', title: 'My Progress', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', path: '/progress' },
        { id: 'settings', icon: '⚙️', title: 'Settings', gradient: 'var(--gradient-sunset)', path: '/settings' },
    ];

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="welcome-section animate-fadeIn">
                    <h1 className="welcome-title">
                        {t('home.welcome')} {activeProfile?.avatar} {activeProfile?.name}!
                    </h1>
                    <p className="welcome-subtitle">{t('home.chooseActivity')}</p>
                </div>

                <div className="activities-grid">
                    {activities.map((activity, index) => (
                        <button
                            key={activity.id}
                            className="activity-card animate-pop"
                            style={{
                                animationDelay: `${index * 0.15}s`,
                                '--card-gradient': activity.gradient
                            }}
                            onClick={() => navigate(activity.path)}
                        >
                            <span className="activity-icon">{activity.icon}</span>
                            <span className="activity-title">{activity.title}</span>
                        </button>
                    ))}
                </div>

                {/* Fun decorative elements */}
                <div className="decorations">
                    <span className="decoration d1 animate-float">⭐</span>
                    <span className="decoration d2 animate-float" style={{ animationDelay: '0.5s' }}>🌟</span>
                    <span className="decoration d3 animate-float" style={{ animationDelay: '1s' }}>✨</span>
                    <span className="decoration d4 animate-bounce">🎈</span>
                    <span className="decoration d5 animate-bounce" style={{ animationDelay: '0.3s' }}>🎀</span>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
