import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard event tracking
 * Tracks key presses, provides visual feedback data
 */
export function useKeyboard() {
    const [keyState, setKeyState] = useState({
        currentKey: null,
        isPressed: false,
        lastKey: null,
        keyHistory: []
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent default for most keys in learning mode
            if (!['F5', 'F11', 'F12'].includes(e.key)) {
                e.preventDefault();
            }

            const keyInfo = {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                isLetter: /^[a-zA-Z]$/.test(e.key),
                isNumber: /^[0-9]$/.test(e.key),
                isSpecial: ['Shift', 'Control', 'Alt', 'Enter', 'Backspace', 'Space', 'Tab', 'Escape'].includes(e.key),
                timestamp: Date.now()
            };

            setKeyState(prev => ({
                currentKey: keyInfo,
                isPressed: true,
                lastKey: prev.currentKey,
                keyHistory: [...prev.keyHistory, keyInfo].slice(-20) // Keep last 20 keys
            }));
        };

        const handleKeyUp = () => {
            setKeyState(prev => ({
                ...prev,
                isPressed: false
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Get display label for a key
    const getKeyLabel = useCallback((key) => {
        const labels = {
            ' ': 'Space',
            'Enter': '↵',
            'Backspace': '←',
            'Shift': '⇧',
            'Control': 'Ctrl',
            'Alt': 'Alt',
            'Tab': '⇥',
            'Escape': 'Esc',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→'
        };
        return labels[key] || key.toUpperCase();
    }, []);

    // Clear key history
    const clearHistory = useCallback(() => {
        setKeyState(prev => ({
            ...prev,
            keyHistory: []
        }));
    }, []);

    return {
        ...keyState,
        getKeyLabel,
        clearHistory
    };
}

/**
 * Hook for generating random key challenges
 */
export function useKeyChallenge(difficulty = 'beginner') {
    const [targetKey, setTargetKey] = useState(null);

    const getKeySet = useCallback(() => {
        switch (difficulty) {
            case 'beginner':
                // Just letters, large and simple
                return 'ABCDEFGHIJ'.split('');
            case 'intermediate':
                // All letters
                return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            case 'advanced':
                // Letters and numbers
                return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
            default:
                return 'ABCDEF'.split('');
        }
    }, [difficulty]);

    const generateNewTarget = useCallback(() => {
        const keySet = getKeySet();
        const randomKey = keySet[Math.floor(Math.random() * keySet.length)];
        setTargetKey(randomKey);
        return randomKey;
    }, [getKeySet]);

    const checkKey = useCallback((pressedKey) => {
        if (!targetKey) return false;
        return pressedKey.toUpperCase() === targetKey.toUpperCase();
    }, [targetKey]);

    return {
        targetKey,
        generateNewTarget,
        checkKey
    };
}

export default useKeyboard;
