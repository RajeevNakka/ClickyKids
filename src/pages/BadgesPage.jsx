import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRewards } from '../contexts/RewardsContext';
import './BadgesPage.css';

function BadgesPage() {
    const navigate = useNavigate();
    const { rewards, allBadges } = useRewards();

    const earnedCount = rewards.earnedBadges.length;
    const totalCount = allBadges.length;

    return (
        <div className="badges-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h1 className="badges-title">🏆 My Badges</h1>

            <div className="badges-summary">
                <span className="stars-count">⭐ {rewards.stars} Stars</span>
                <span className="badges-count">{earnedCount}/{totalCount} Badges</span>
            </div>

            <div className="badges-grid">
                {allBadges.map(badge => {
                    const isEarned = rewards.earnedBadges.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
                        >
                            <span className="badge-icon">{isEarned ? badge.icon : '🔒'}</span>
                            <span className="badge-name">{badge.name}</span>
                            <span className="badge-desc">{badge.description}</span>
                            {isEarned && <span className="badge-earned">✓ Earned</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default BadgesPage;
