import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../contexts/ProfileContext';
import { useAudio } from '../hooks/useAudio';
import './HomePage.css';

// Organized categories
const categories = {
    featured: {
        title: '⭐ Today',
        items: [
            { id: 'daily', icon: '🌟', title: 'Daily Challenge', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/daily' },
        ]
    },
    learning: {
        title: '📚 Learning',
        items: [
            { id: 'mouse', icon: '🖱️', title: 'Learn Mouse', gradient: 'var(--gradient-ocean)', path: '/mouse' },
            { id: 'keyboard', icon: '⌨️', title: 'Learn Keyboard', gradient: 'var(--gradient-forest)', path: '/keyboard' },
            { id: 'abc', icon: '🔤', title: 'ABC & 123', gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', path: '/abc' },
            { id: 'learn', icon: '📚', title: 'Explore & Learn', gradient: 'var(--gradient-candy)', path: '/learn' },
            { id: 'story', icon: '📖', title: 'Story Time', gradient: 'linear-gradient(135deg, #FFF5E1, #FFE4C4)', path: '/story' },
            { id: 'numberline', icon: '🔢', title: 'Number Line', gradient: 'linear-gradient(135deg, #E0F7FA, #80DEEA)', path: '/numberline' },
        ]
    },
    games: {
        title: '🎮 Games',
        items: [
            { id: 'memory', icon: '🧠', title: 'Memory Match', gradient: 'var(--gradient-primary)', path: '/memory' },
            { id: 'bubbles', icon: '🎈', title: 'Pop Bubbles', gradient: 'var(--gradient-sunrise)', path: '/bubbles' },
            { id: 'simon', icon: '🎯', title: 'Simon Says', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', path: '/simon' },
            { id: 'dragdrop', icon: '📦', title: 'Drag & Drop', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', path: '/dragdrop' },
            { id: 'colorclick', icon: '🎨', title: 'Color by Click', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', path: '/colorclick' },
            { id: 'connectdots', icon: '✨', title: 'Connect Dots', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', path: '/connectdots' },
            { id: 'music', icon: '🎹', title: 'Music', gradient: 'linear-gradient(135deg, #2C3E50, #4CA1AF)', path: '/music' },
            { id: 'catch', icon: '🧺', title: 'Catch Game', gradient: 'linear-gradient(135deg, #87CEEB, #98D8C8)', path: '/catch' },
        ]
    },
    profile: {
        title: '👤 My Stuff',
        items: [
            { id: 'badges', icon: '🏆', title: 'My Badges', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', path: '/badges' },
            { id: 'progress', icon: '📊', title: 'My Progress', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', path: '/progress' },
            { id: 'settings', icon: '⚙️', title: 'Settings', gradient: 'var(--gradient-sunset)', path: '/settings' },
        ]
    }
};

function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { activeProfile } = useProfile();
    const { speak } = useAudio();
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Speak welcome message on load
    useEffect(() => {
        if (activeProfile) {
            setTimeout(() => {
                speak(`${t('home.welcome')} ${activeProfile.name}!`);
            }, 500);
        }
    }, [activeProfile, speak, t]);

    const toggleCategory = (cat) => {
        setExpandedCategory(expandedCategory === cat ? null : cat);
    };

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="welcome-section animate-fadeIn">
                    <h1 className="welcome-title">
                        {t('home.welcome')} {activeProfile?.avatar} {activeProfile?.name}!
                    </h1>
                    <p className="welcome-subtitle">{t('home.chooseActivity')}</p>
                </div>

                {/* Featured - Daily Challenge (always visible) */}
                <div className="featured-section">
                    {categories.featured.items.map(item => (
                        <button
                            key={item.id}
                            className="featured-card animate-pop"
                            style={{ '--card-gradient': item.gradient }}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="featured-icon">{item.icon}</span>
                            <div className="featured-content">
                                <span className="featured-title">{item.title}</span>
                                <span className="featured-desc">New challenge every day!</span>
                            </div>
                            <span className="featured-arrow">→</span>
                        </button>
                    ))}
                </div>

                {/* Category Sections */}
                <div className="categories-container">
                    {['learning', 'games', 'profile'].map(catKey => {
                        const category = categories[catKey];
                        const isExpanded = expandedCategory === catKey || expandedCategory === null;

                        return (
                            <div key={catKey} className="category-section">
                                <button
                                    className="category-header"
                                    onClick={() => toggleCategory(catKey)}
                                >
                                    <span className="category-title">{category.title}</span>
                                    <span className="category-count">{category.items.length} activities</span>
                                    <span className={`category-toggle ${isExpanded ? 'expanded' : ''}`}>▼</span>
                                </button>

                                <div className={`category-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                    {category.items.map((item, index) => (
                                        <button
                                            key={item.id}
                                            className="activity-card compact"
                                            style={{
                                                '--card-gradient': item.gradient,
                                                animationDelay: `${index * 0.05}s`
                                            }}
                                            onClick={() => navigate(item.path)}
                                        >
                                            <span className="activity-icon">{item.icon}</span>
                                            <span className="activity-title">{item.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
