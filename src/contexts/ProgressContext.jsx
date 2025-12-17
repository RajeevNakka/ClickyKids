import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useProfile } from './ProfileContext';

const ProgressContext = createContext(null);

const defaultProgress = {
    timeSpent: {
        mouseMovement: 0,
        mouseClicking: 0,
        mouseDragDrop: 0,
        keyboardBasic: 0,
        keyboardTyping: 0
    },
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
    accuracy: {
        clicking: [],
        dragDrop: [],
        keyboard: []
    },
    streak: {
        current: 0,
        longest: 0,
        lastPracticeDate: null
    },
    sessions: []
};

export function ProgressProvider({ children }) {
    const { activeProfileId } = useProfile();

    const [progress, setProgress] = useState(() => {
        if (!activeProfileId) return defaultProgress;
        const saved = localStorage.getItem(`clickykids-progress-${activeProfileId}`);
        return saved ? JSON.parse(saved) : defaultProgress;
    });

    const sessionStartRef = useRef(null);
    const currentSkillRef = useRef(null);

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

    // Start tracking a skill session - memoized
    const startSession = useCallback((skill) => {
        sessionStartRef.current = Date.now();
        currentSkillRef.current = skill;

        // Update streak
        const today = new Date().toDateString();
        setProgress(prev => {
            if (prev.streak.lastPracticeDate === today) {
                return prev; // Already practiced today
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (prev.streak.lastPracticeDate === yesterday.toDateString()) {
                return {
                    ...prev,
                    streak: {
                        current: prev.streak.current + 1,
                        longest: Math.max(prev.streak.longest, prev.streak.current + 1),
                        lastPracticeDate: today
                    }
                };
            } else {
                return {
                    ...prev,
                    streak: {
                        current: 1,
                        longest: Math.max(prev.streak.longest, 1),
                        lastPracticeDate: today
                    }
                };
            }
        });
    }, []);

    // End tracking a skill session - memoized
    const endSession = useCallback(() => {
        if (sessionStartRef.current && currentSkillRef.current) {
            const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
            const skill = currentSkillRef.current;

            setProgress(prev => ({
                ...prev,
                timeSpent: {
                    ...prev.timeSpent,
                    [skill]: (prev.timeSpent[skill] || 0) + duration
                },
                sessions: [...prev.sessions, {
                    skill,
                    duration,
                    date: new Date().toISOString()
                }].slice(-100)
            }));
        }
        sessionStartRef.current = null;
        currentSkillRef.current = null;
    }, []);

    // Add time spent on a skill - memoized
    const addTimeSpent = useCallback((skill, seconds) => {
        setProgress(prev => ({
            ...prev,
            timeSpent: {
                ...prev.timeSpent,
                [skill]: (prev.timeSpent[skill] || 0) + seconds
            }
        }));
    }, []);

    // Complete exercise - memoized
    const completeExercise = useCallback((exerciseName) => {
        setProgress(prev => ({
            ...prev,
            exercisesCompleted: {
                ...prev.exercisesCompleted,
                [exerciseName]: (prev.exercisesCompleted[exerciseName] || 0) + 1
            }
        }));
    }, []);

    // Record accuracy - memoized
    const recordAccuracy = useCallback((category, accuracyPercent) => {
        setProgress(prev => ({
            ...prev,
            accuracy: {
                ...prev.accuracy,
                [category]: [...(prev.accuracy[category] || []), accuracyPercent].slice(-50)
            }
        }));
    }, []);

    // Get average accuracy
    const getAverageAccuracy = useCallback((category) => {
        const values = progress.accuracy[category] || [];
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }, [progress.accuracy]);

    // Get total time spent
    const getTotalTimeSpent = useCallback(() => {
        return Object.values(progress.timeSpent).reduce((a, b) => a + b, 0);
    }, [progress.timeSpent]);

    // Get total exercises
    const getTotalExercises = useCallback(() => {
        return Object.values(progress.exercisesCompleted).reduce((a, b) => a + b, 0);
    }, [progress.exercisesCompleted]);

    // Get recommendations
    const getRecommendations = useCallback(() => {
        const recommendations = [];
        const { timeSpent, exercisesCompleted } = progress;

        if (timeSpent.mouseMovement > 300 && !exercisesCompleted.bubblePop) {
            recommendations.push({
                type: 'ready',
                message: 'Ready to try clicking games!',
                skill: 'clicking'
            });
        }

        if (exercisesCompleted.bubblePop > 5 && getAverageAccuracy('clicking') > 60) {
            if (!exercisesCompleted.puzzle) {
                recommendations.push({
                    type: 'ready',
                    message: 'Ready for drag and drop!',
                    skill: 'dragDrop'
                });
            }
        }

        const totalTime = Object.values(timeSpent).reduce((a, b) => a + b, 0);
        if (totalTime > 600 && (!timeSpent.keyboardBasic || timeSpent.keyboardBasic < 60)) {
            recommendations.push({
                type: 'ready',
                message: 'Try keyboard learning!',
                skill: 'keyboard'
            });
        }

        if (progress.streak.current === 0 && totalTime > 0) {
            recommendations.push({
                type: 'reminder',
                message: 'Come back to practice!',
                skill: 'general'
            });
        }

        return recommendations;
    }, [progress, getAverageAccuracy]);

    // Reset progress
    const resetProgress = useCallback(() => {
        setProgress(defaultProgress);
    }, []);

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

