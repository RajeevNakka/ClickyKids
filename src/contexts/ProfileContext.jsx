import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

// Calculate age from date of birth
const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Suggest difficulty level based on age
const suggestDifficulty = (age) => {
    if (age <= 3) return 'beginner';
    if (age <= 5) return 'beginner';
    if (age <= 7) return 'intermediate';
    return 'advanced';
};

// Get difficulty settings
export const getDifficultySettings = (difficulty) => {
    const settings = {
        beginner: {
            targetSize: 'large', // 120px+
            movementSpeed: 'slow',
            accuracy: 'low', // 50%+ is success
            repetitions: 3,
            timeLimit: false,
            showHints: true
        },
        intermediate: {
            targetSize: 'medium', // 80px+
            movementSpeed: 'medium',
            accuracy: 'medium', // 70%+ is success
            repetitions: 5,
            timeLimit: false,
            showHints: true
        },
        advanced: {
            targetSize: 'small', // 50px+
            movementSpeed: 'fast',
            accuracy: 'high', // 85%+ is success
            repetitions: 7,
            timeLimit: true,
            showHints: false
        }
    };
    return settings[difficulty] || settings.beginner;
};

const defaultProfiles = [];

export function ProfileProvider({ children }) {
    const [profiles, setProfiles] = useState(() => {
        const saved = localStorage.getItem('clickykids-profiles');
        return saved ? JSON.parse(saved) : defaultProfiles;
    });

    const [activeProfileId, setActiveProfileId] = useState(() => {
        return localStorage.getItem('clickykids-active-profile') || null;
    });

    // Save profiles to local storage
    useEffect(() => {
        localStorage.setItem('clickykids-profiles', JSON.stringify(profiles));
    }, [profiles]);

    // Save active profile to local storage
    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem('clickykids-active-profile', activeProfileId);
        }
    }, [activeProfileId]);

    // Get active profile with calculated age
    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const activeProfileWithAge = activeProfile ? {
        ...activeProfile,
        age: calculateAge(activeProfile.dob),
        suggestedDifficulty: suggestDifficulty(calculateAge(activeProfile.dob))
    } : null;

    // Add a new profile
    const addProfile = (profile) => {
        const newProfile = {
            id: Date.now().toString(),
            name: profile.name,
            dob: profile.dob,
            language: profile.language || 'en',
            difficulty: profile.difficulty || suggestDifficulty(calculateAge(profile.dob)),
            avatar: profile.avatar || '👦',
            createdAt: new Date().toISOString()
        };
        setProfiles(prev => [...prev, newProfile]);
        return newProfile;
    };

    // Update profile
    const updateProfile = (id, updates) => {
        setProfiles(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates } : p
        ));
    };

    // Delete profile
    const deleteProfile = (id) => {
        setProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) {
            setActiveProfileId(null);
        }
    };

    // Select active profile
    const selectProfile = (id) => {
        setActiveProfileId(id);
        const profile = profiles.find(p => p.id === id);
        if (profile && profile.language) {
            import('../i18n').then(i18n => {
                i18n.changeLanguage(profile.language);
            });
        }
    };

    // Get difficulty settings for active profile
    const getActiveDifficultySettings = () => {
        if (!activeProfileWithAge) return getDifficultySettings('beginner');
        return getDifficultySettings(activeProfileWithAge.difficulty);
    };

    const value = {
        profiles,
        activeProfile: activeProfileWithAge,
        activeProfileId,
        addProfile,
        updateProfile,
        deleteProfile,
        selectProfile,
        getActiveDifficultySettings,
        calculateAge,
        suggestDifficulty
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

export default ProfileContext;
