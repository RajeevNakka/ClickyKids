import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import { useAudio } from '../hooks/useAudio';
import './HomePage.css';

// Organized categories with horizontal scroll
const sections = [
    {
        id: 'featured',
        title: '⭐ Today\'s Challenge',
        items: [
            { id: 'daily', icon: '🌟', title: 'Daily Challenge', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/daily', featured: true },
        ]
    },
    {
        id: 'learning',
        title: '📚 Learning',
        items: [
            { id: 'mouse', icon: '🖱️', title: 'Learn Mouse', gradient: 'var(--gradient-ocean)', path: '/mouse' },
            { id: 'keyboard', icon: '⌨️', title: 'Learn Keyboard', gradient: 'var(--gradient-forest)', path: '/keyboard' },
            { id: 'abc', icon: '🔤', title: 'ABC & 123', gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', path: '/abc' },
            { id: 'learn', icon: '📚', title: 'Explore', gradient: 'var(--gradient-candy)', path: '/learn' },
            { id: 'story', icon: '📖', title: 'Stories', gradient: 'linear-gradient(135deg, #DEB887, #D2691E)', path: '/story' },
            { id: 'numberline', icon: '🔢', title: 'Numbers', gradient: 'linear-gradient(135deg, #00CED1, #20B2AA)', path: '/numberline' },
        ]
    },
    {
        id: 'games',
        title: '🎮 Games',
        items: [
            { id: 'memory', icon: '🧠', title: 'Memory', gradient: 'var(--gradient-primary)', path: '/memory' },
            { id: 'bubbles', icon: '🎈', title: 'Bubbles', gradient: 'var(--gradient-sunrise)', path: '/bubbles' },
            { id: 'simon', icon: '🎯', title: 'Simon', gradient: 'linear-gradient(135deg, #1a1a2e, #4a4a6a)', path: '/simon' },
            { id: 'dragdrop', icon: '📦', title: 'Sorting', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', path: '/dragdrop' },
            { id: 'colorclick', icon: '🎨', title: 'Coloring', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', path: '/colorclick' },
            { id: 'connectdots', icon: '✨', title: 'Connect', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)', path: '/connectdots' },
            { id: 'music', icon: '🎹', title: 'Music', gradient: 'linear-gradient(135deg, #2C3E50, #4CA1AF)', path: '/music' },
            { id: 'catch', icon: '🧺', title: 'Catch', gradient: 'linear-gradient(135deg, #87CEEB, #98D8C8)', path: '/catch' },
        ]
    },
    {
        id: 'profile',
        title: '👤 My Stuff',
        items: [
            { id: 'badges', icon: '🏆', title: 'Badges', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', path: '/badges' },
            { id: 'progress', icon: '📊', title: 'Progress', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', path: '/progress' },
            { id: 'settings', icon: '⚙️', title: 'Settings', gradient: 'var(--gradient-sunset)', path: '/settings' },
        ]
    }
];

function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeProfile } = useProfile();
    const { speak } = useAudio();

    useEffect(() => {
        if (activeProfile) {
            setTimeout(() => {
                speak(`${t('home.welcome')} ${activeProfile.name}!`);
            }, 500);
        }
    }, [activeProfile, speak, t]);

    return (
        <div className="home-page">
            {/* Welcome Header */}
            <div className="welcome-header">
                <h1 className="welcome-title">
                    {activeProfile?.avatar} Hi, {activeProfile?.name}!
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="home-content">
                {sections.map(section => (
                    <div key={section.id} className="section">
                        <h2 className="section-title">{section.title}</h2>
                        <div className="section-scroll">
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    className={`activity-card ${item.featured ? 'featured' : ''}`}
                                    style={{ '--card-gradient': item.gradient }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <span className="card-icon">{item.icon}</span>
                                    <span className="card-title">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
