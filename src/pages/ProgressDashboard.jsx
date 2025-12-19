import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext';
import { useProfile } from '../contexts/ProfileContext';
import './ProgressDashboard.css';

function ProgressDashboard() {
    const navigate = useNavigate();
    const { progress, getTotalTimeSpent, getTotalExercises } = useProgress();
    const { activeProfile } = useProfile();

    const totalTime = getTotalTimeSpent();
    const totalExercises = getTotalExercises();

    // Format time
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    // Calculate game stats
    const gameStats = [
        { name: 'Memory Match', icon: '🧠', count: progress.exercisesCompleted.memory || 0 },
        { name: 'Pop Bubbles', icon: '🎈', count: progress.exercisesCompleted.bubbles || 0 },
        { name: 'Drag & Drop', icon: '🎯', count: progress.exercisesCompleted.dragdrop || 0 },
        { name: 'Color Click', icon: '🎨', count: progress.exercisesCompleted.colorclick || 0 },
        { name: 'Connect Dots', icon: '✨', count: progress.exercisesCompleted.connectdots || 0 },
        { name: 'Music', icon: '🎹', count: progress.exercisesCompleted.music || 0 },
        { name: 'Catch Game', icon: '🧺', count: progress.exercisesCompleted.catch || 0 },
        { name: 'Learn Mode', icon: '📚', count: progress.exercisesCompleted.learn || 0 },
    ];

    // Get recent activity (last 7 days)
    const getRecentActivity = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const daySessions = progress.sessions.filter(s =>
                s.date && s.date.split('T')[0] === dateStr
            );
            days.push({
                day: date.toLocaleDateString('en', { weekday: 'short' }),
                count: daySessions.length,
                hasActivity: daySessions.length > 0
            });
        }
        return days;
    };

    const recentActivity = getRecentActivity();

    return (
        <div className="progress-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h1 className="progress-title">📊 My Progress</h1>

            <div className="profile-summary">
                <span className="profile-avatar">{activeProfile?.avatar}</span>
                <span className="profile-name">{activeProfile?.name}</span>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{formatTime(totalTime)}</span>
                    <span className="stat-label">Time Played</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🎮</span>
                    <span className="stat-value">{totalExercises}</span>
                    <span className="stat-label">Games Completed</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-value">{progress.streak.current}</span>
                    <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-value">{progress.streak.longest}</span>
                    <span className="stat-label">Best Streak</span>
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="activity-section">
                <h3>This Week</h3>
                <div className="activity-week">
                    {recentActivity.map((day, i) => (
                        <div key={i} className="activity-day">
                            <div className={`activity-dot ${day.hasActivity ? 'active' : ''}`}
                                style={{ '--level': Math.min(day.count, 5) }}>
                            </div>
                            <span className="day-label">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Game Stats */}
            <div className="games-section">
                <h3>Games Played</h3>
                <div className="games-grid">
                    {gameStats.map((game, i) => (
                        <div key={i} className="game-stat">
                            <span className="game-icon">{game.icon}</span>
                            <span className="game-name">{game.name}</span>
                            <span className="game-count">{game.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Encouragement */}
            <div className="encouragement">
                {totalExercises === 0 ? (
                    <p>🌟 Start playing games to see your progress!</p>
                ) : totalExercises < 10 ? (
                    <p>🌟 Great start! Keep playing to learn more!</p>
                ) : totalExercises < 50 ? (
                    <p>🎉 You're doing amazing! Keep it up!</p>
                ) : (
                    <p>🏆 Wow! You're a superstar learner!</p>
                )}
            </div>
        </div>
    );
}

export default ProgressDashboard;
