import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProfile } from './ProfileContext';

const RewardsContext = createContext(null);

// Badge definitions
const badgeDefinitions = {
    firstGame: {
        id: 'firstGame',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: '🌟',
        condition: (stats) => stats.totalGames >= 1,
    },
    fiveGames: {
        id: 'fiveGames',
        name: 'Getting Started',
        description: 'Complete 5 games',
        icon: '⭐',
        condition: (stats) => stats.totalGames >= 5,
    },
    tenGames: {
        id: 'tenGames',
        name: 'Game Master',
        description: 'Complete 10 games',
        icon: '🏆',
        condition: (stats) => stats.totalGames >= 10,
    },
    twentyFiveGames: {
        id: 'twentyFiveGames',
        name: 'Super Player',
        description: 'Complete 25 games',
        icon: '👑',
        condition: (stats) => stats.totalGames >= 25,
    },
    streakThree: {
        id: 'streakThree',
        name: 'Consistent',
        description: '3 day streak',
        icon: '🔥',
        condition: (stats) => stats.longestStreak >= 3,
    },
    streakSeven: {
        id: 'streakSeven',
        name: 'Week Warrior',
        description: '7 day streak',
        icon: '🌈',
        condition: (stats) => stats.longestStreak >= 7,
    },
    memoryMaster: {
        id: 'memoryMaster',
        name: 'Memory Master',
        description: 'Win 5 Memory Match games',
        icon: '🧠',
        condition: (stats) => (stats.gameStats?.memory || 0) >= 5,
    },
    simonPro: {
        id: 'simonPro',
        name: 'Simon Pro',
        description: 'Reach level 5 in Simon Says',
        icon: '🎯',
        condition: (stats) => stats.simonHighScore >= 5,
    },
    abcExplorer: {
        id: 'abcExplorer',
        name: 'ABC Explorer',
        description: 'Learn all 26 letters',
        icon: '📚',
        condition: (stats) => (stats.lettersLearned?.length || 0) >= 26,
    },
    numberNinja: {
        id: 'numberNinja',
        name: 'Number Ninja',
        description: 'Complete Number Line 10 times',
        icon: '🔢',
        condition: (stats) => (stats.gameStats?.numberline || 0) >= 10,
    },
    colorArtist: {
        id: 'colorArtist',
        name: 'Color Artist',
        description: 'Color 5 pictures',
        icon: '🎨',
        condition: (stats) => (stats.gameStats?.colorclick || 0) >= 5,
    },
    musicMaestro: {
        id: 'musicMaestro',
        name: 'Music Maestro',
        description: 'Complete 3 songs',
        icon: '🎹',
        condition: (stats) => (stats.gameStats?.music || 0) >= 3,
    },
};

const defaultRewards = {
    stars: 0,
    earnedBadges: [],
    newBadges: [], // For showing newly earned badges
    lettersLearned: [],
    simonHighScore: 0,
};

export function RewardsProvider({ children }) {
    const { activeProfileId } = useProfile();

    const [rewards, setRewards] = useState(() => {
        if (!activeProfileId) return defaultRewards;
        const saved = localStorage.getItem(`clickykids-rewards-${activeProfileId}`);
        return saved ? JSON.parse(saved) : defaultRewards;
    });

    // Load rewards when profile changes
    useEffect(() => {
        if (activeProfileId) {
            const saved = localStorage.getItem(`clickykids-rewards-${activeProfileId}`);
            setRewards(saved ? JSON.parse(saved) : defaultRewards);
        } else {
            setRewards(defaultRewards);
        }
    }, [activeProfileId]);

    // Save rewards when they change
    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem(`clickykids-rewards-${activeProfileId}`, JSON.stringify(rewards));
        }
    }, [rewards, activeProfileId]);

    // Add stars
    const addStars = useCallback((amount) => {
        setRewards(prev => ({
            ...prev,
            stars: prev.stars + amount,
        }));
    }, []);

    // Check and award badges
    const checkBadges = useCallback((stats) => {
        const newlyEarned = [];

        Object.values(badgeDefinitions).forEach(badge => {
            if (!rewards.earnedBadges.includes(badge.id) && badge.condition(stats)) {
                newlyEarned.push(badge.id);
            }
        });

        if (newlyEarned.length > 0) {
            setRewards(prev => ({
                ...prev,
                earnedBadges: [...prev.earnedBadges, ...newlyEarned],
                newBadges: newlyEarned,
            }));
        }

        return newlyEarned;
    }, [rewards.earnedBadges]);

    // Clear new badges notification
    const clearNewBadges = useCallback(() => {
        setRewards(prev => ({ ...prev, newBadges: [] }));
    }, []);

    // Track letter learned
    const trackLetterLearned = useCallback((letter) => {
        setRewards(prev => {
            if (prev.lettersLearned.includes(letter)) return prev;
            return {
                ...prev,
                lettersLearned: [...prev.lettersLearned, letter],
            };
        });
    }, []);

    // Update Simon high score
    const updateSimonScore = useCallback((score) => {
        setRewards(prev => ({
            ...prev,
            simonHighScore: Math.max(prev.simonHighScore, score),
        }));
    }, []);

    const value = {
        rewards,
        addStars,
        checkBadges,
        clearNewBadges,
        trackLetterLearned,
        updateSimonScore,
        badgeDefinitions,
        allBadges: Object.values(badgeDefinitions),
    };

    return (
        <RewardsContext.Provider value={value}>
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    const context = useContext(RewardsContext);
    if (!context) {
        throw new Error('useRewards must be used within a RewardsProvider');
    }
    return context;
}

export default RewardsContext;
