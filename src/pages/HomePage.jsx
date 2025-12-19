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
        {
            id: 'mouse',
            icon: '🖱️',
            title: t('home.learnMouse'),
            gradient: 'var(--gradient-ocean)',
            path: '/mouse'
        },
        {
            id: 'keyboard',
            icon: '⌨️',
            title: t('home.learnKeyboard'),
            gradient: 'var(--gradient-forest)',
            path: '/keyboard'
        },
        {
            id: 'learn',
            icon: '📚',
            title: 'Explore & Learn',
            gradient: 'var(--gradient-candy)',
            path: '/learn'
        },
        {
            id: 'memory',
            icon: '🧠',
            title: 'Memory Match',
            gradient: 'var(--gradient-primary)',
            path: '/memory'
        },
        {
            id: 'bubbles',
            icon: '🎈',
            title: 'Pop Bubbles',
            gradient: 'var(--gradient-sunrise)',
            path: '/bubbles'
        },
        {
            id: 'games',
            icon: '🎮',
            title: t('home.playGames'),
            gradient: 'var(--gradient-sunset)',
            path: '/mouse/games'
        }
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
