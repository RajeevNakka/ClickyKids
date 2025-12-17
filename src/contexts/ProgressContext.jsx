import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProfile } from './ProfileContext';

const ProgressContext = createContext(null);

const defaultProgress = {
    // Time tracking (in seconds)
    timeSpent: {
        mouseMovement: 0,
        mouseClicking: 0,
        mouseDragDrop: 0,
        keyboardBasic: 0,
        keyboardTyping: 0
    },
    // Exercise completion counts
    exercisesCompleted: {
        mouseExplore: 0,
        bubblePop: 0,
        feedAnimals: 0,
        shapes: 0,
        puzzle: 0,
        butterfly: 0,
        anyKey: 0,
        findKey: 0,
        typing: 0
    },
    // Accuracy tracking (percentage values)
    accuracy: {
        clicking: [],
        dragDrop: [],
        keyboard: []
    },
    // Streak tracking
    streak: {
        current: 0,
        longest: 0,
        lastPracticeDate: null
    },
    // Session history
    sessions: []
};

export function ProgressProvider({ children }) {
    const { activeProfileId } = useProfile();

    const [progress, setProgress] = useState(() => {
        if (!activeProfileId) return defaultProgress;
        const saved = localStorage.getItem(`clickykids-progress-${activeProfileId}`);
        return saved ? JSON.parse(saved) : defaultProgress;
    });

    const [sessionStart, setSessionStart] = useState(null);
    const [currentSkill, setCurrentSkill] = useState(null);

    // Load progress when profile changes
    useEffect(() => {
        if (activeProfileId) {
            const saved = localStorage.getItem(`clickykids-progress-${activeProfileId}`);
            setProgress(saved ? JSON.parse(saved) : defaultProgress);
        } else {
            setProgress(defaultProgress);
        }
    }, [activeProfileId]);

    // Save progress when it changes
    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem(`clickykids-progress-${activeProfileId}`, JSON.stringify(progress));
        }
    }, [progress, activeProfileId]);

    // Check and update streak
    const updateStreak = () => {
        const today = new Date().toDateString();
        const lastPractice = progress.streak.lastPracticeDate;

        if (lastPractice === today) {
            return; // Already practiced today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPractice === yesterday.toDateString()) {
            // Continuing streak
            setProgress(prev => ({
                ...prev,
                streak: {
                    current: prev.streak.current + 1,
                    longest: Math.max(prev.streak.longest, prev.streak.current + 1),
                    lastPracticeDate: today
                }
            }));
        } else {
            // Streak broken or first time
            setProgress(prev => ({
                ...prev,
                streak: {
                    current: 1,
                    longest: Math.max(prev.streak.longest, 1),
                    lastPracticeDate: today
                }
            }));
        }
    };

    // Start tracking a skill session
    const startSession = (skill) => {
        setSessionStart(Date.now());
        setCurrentSkill(skill);
        updateStreak();
    };

    // End tracking a skill session
    const endSession = () => {
        if (sessionStart && currentSkill) {
            const duration = Math.round((Date.now() - sessionStart) / 1000);
            addTimeSpent(currentSkill, duration);

            setProgress(prev => ({
                ...prev,
                sessions: [...prev.sessions, {
                    skill: currentSkill,
                    duration,
                    date: new Date().toISOString()
                }].slice(-100) // Keep last 100 sessions
            }));
        }
        setSessionStart(null);
        setCurrentSkill(null);
    };

    // Add time spent on a skill
    const addTimeSpent = (skill, seconds) => {
        setProgress(prev => ({
            ...prev,
            timeSpent: {
                ...prev.timeSpent,
                [skill]: (prev.timeSpent[skill] || 0) + seconds
            }
        }));
    };

    // Increment exercise completion count
    const completeExercise = (exerciseName) => {
        setProgress(prev => ({
            ...prev,
            exercisesCompleted: {
                ...prev.exercisesCompleted,
                [exerciseName]: (prev.exercisesCompleted[exerciseName] || 0) + 1
            }
        }));
    };

    // Record accuracy for an exercise
    const recordAccuracy = (category, accuracyPercent) => {
        setProgress(prev => ({
            ...prev,
            accuracy: {
                ...prev.accuracy,
                [category]: [...(prev.accuracy[category] || []), accuracyPercent].slice(-50)
            }
        }));
    };

    // Get average accuracy for a category
    const getAverageAccuracy = (category) => {
        const values = progress.accuracy[category] || [];
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    };

    // Get total time spent across all skills
    const getTotalTimeSpent = () => {
        return Object.values(progress.timeSpent).reduce((a, b) => a + b, 0);
    };

    // Get total exercises completed
    const getTotalExercises = () => {
        return Object.values(progress.exercisesCompleted).reduce((a, b) => a + b, 0);
    };

    // Get skill readiness recommendations
    const getRecommendations = () => {
        const recommendations = [];
        const { timeSpent, exercisesCompleted, accuracy } = progress;

        // Mouse movement → Clicking readiness
        if (timeSpent.mouseMovement > 300 && !exercisesCompleted.bubblePop) {
            recommendations.push({
                type: 'ready',
                message: 'Ready to try clicking games!',
                skill: 'clicking'
            });
        }

        // Clicking → Drag and Drop readiness
        if (exercisesCompleted.bubblePop > 5 && getAverageAccuracy('clicking') > 60) {
            if (!exercisesCompleted.puzzle) {
                recommendations.push({
                    type: 'ready',
                    message: 'Ready for drag and drop!',
                    skill: 'dragDrop'
                });
            }
        }

        // Mouse → Keyboard readiness
        if (getTotalTimeSpent() > 600 && (!timeSpent.keyboardBasic || timeSpent.keyboardBasic < 60)) {
            recommendations.push({
                type: 'ready',
                message: 'Try keyboard learning!',
                skill: 'keyboard'
            });
        }

        // Practice reminders
        if (progress.streak.current === 0 && getTotalTimeSpent() > 0) {
            recommendations.push({
                type: 'reminder',
                message: 'Come back to practice!',
                skill: 'general'
            });
        }

        return recommendations;
    };

    // Reset progress (for testing or parent request)
    const resetProgress = () => {
        setProgress(defaultProgress);
    };

    const value = {
        progress,
        startSession,
        endSession,
        addTimeSpent,
        completeExercise,
        recordAccuracy,
        getAverageAccuracy,
        getTotalTimeSpent,
        getTotalExercises,
        getRecommendations,
        resetProgress
    };

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}

export default ProgressContext;
