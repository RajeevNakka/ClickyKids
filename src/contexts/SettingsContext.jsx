import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

const defaultSettings = {
    soundEnabled: true,
    darkMode: false,
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('clickykids-settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    // Save settings when they change
    useEffect(() => {
        localStorage.setItem('clickykids-settings', JSON.stringify(settings));
    }, [settings]);

    // Apply dark mode class to body
    useEffect(() => {
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [settings.darkMode]);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    }, []);

    // Update a setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const value = {
        settings,
        toggleSound,
        toggleDarkMode,
        updateSetting,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export default SettingsContext;
