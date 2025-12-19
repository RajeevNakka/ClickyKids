import { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Check if sound is enabled from localStorage (can't use context in this hook)
const getSoundEnabled = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('clickykids-settings') || '{}');
        return settings.soundEnabled !== false; // Default to true
    } catch {
        return true;
    }
};

// Audio file paths (will use Web Speech API initially)
const audioFiles = {
    click: '/audio/click.mp3',
    pop: '/audio/pop.mp3',
    success: '/audio/success.mp3',
    celebration: '/audio/celebration.mp3'
};

/**
 * Custom hook for audio feedback
 * Provides spoken feedback using Web Speech API and sound effects
 */
export function useAudio() {
    const { i18n } = useTranslation();
    const audioRef = useRef(null);
    const speechSynthRef = useRef(null);

    // Initialize speech synthesis
    useEffect(() => {
        if ('speechSynthesis' in window) {
            speechSynthRef.current = window.speechSynthesis;
        }
    }, []);

    // Get voice for current language
    const getVoice = useCallback(() => {
        if (!speechSynthRef.current) return null;

        const voices = speechSynthRef.current.getVoices();
        const langCode = i18n.language;

        // Map language codes to speech synthesis language codes
        const langMap = {
            'en': 'en-US',
            'te': 'te-IN',
            'hi': 'hi-IN'
        };

        const targetLang = langMap[langCode] || 'en-US';

        // Find a voice for the target language
        let voice = voices.find(v => v.lang === targetLang);
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith(langCode));
        }
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith('en'));
        }

        return voice;
    }, [i18n.language]);

    // Speak text using Web Speech API
    const speak = useCallback((text, options = {}) => {
        if (!getSoundEnabled()) return; // Sound disabled

        if (!speechSynthRef.current) {
            console.warn('Speech synthesis not available');
            return;
        }

        // Cancel any ongoing speech
        speechSynthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoice();

        if (voice) {
            utterance.voice = voice;
        }

        utterance.rate = options.rate || 0.9; // Slightly slower for children
        utterance.pitch = options.pitch || 1.1; // Slightly higher for friendlier tone
        utterance.volume = options.volume || 1;

        speechSynthRef.current.speak(utterance);

        return new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
        });
    }, [getVoice]);

    // Play a sound effect
    const playSound = useCallback((soundName) => {
        if (!getSoundEnabled()) return; // Sound disabled

        // For now, we'll use simple audio or create tones
        // In production, load actual audio files
        try {
            // Create simple beep sounds for now
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                // Different sounds for different actions
                switch (soundName) {
                    case 'click':
                        oscillator.frequency.value = 800;
                        gainNode.gain.value = 0.3;
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 100);
                        break;
                    case 'pop':
                        oscillator.frequency.value = 1200;
                        gainNode.gain.value = 0.2;
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 150);
                        break;
                    case 'success':
                    case 'match':
                        oscillator.frequency.value = 523; // C5
                        gainNode.gain.value = 0.3;
                        oscillator.start();
                        setTimeout(() => { oscillator.frequency.value = 659; }, 150);
                        setTimeout(() => { oscillator.frequency.value = 784; }, 300);
                        setTimeout(() => oscillator.stop(), 450);
                        break;
                    case 'wrong':
                        oscillator.frequency.value = 200;
                        gainNode.gain.value = 0.2;
                        oscillator.start();
                        setTimeout(() => { oscillator.frequency.value = 150; }, 100);
                        setTimeout(() => oscillator.stop(), 200);
                        break;
                    case 'catch':
                        oscillator.frequency.value = 600;
                        gainNode.gain.value = 0.25;
                        oscillator.start();
                        setTimeout(() => { oscillator.frequency.value = 900; }, 50);
                        setTimeout(() => oscillator.stop(), 100);
                        break;
                    case 'drop':
                        oscillator.frequency.value = 400;
                        gainNode.gain.value = 0.2;
                        oscillator.start();
                        setTimeout(() => { oscillator.frequency.value = 200; }, 100);
                        setTimeout(() => oscillator.stop(), 200);
                        break;
                    case 'celebration':
                    case 'complete':
                        // Play a happy jingle
                        oscillator.frequency.value = 523;
                        gainNode.gain.value = 0.3;
                        oscillator.start();
                        setTimeout(() => { oscillator.frequency.value = 659; }, 100);
                        setTimeout(() => { oscillator.frequency.value = 784; }, 200);
                        setTimeout(() => { oscillator.frequency.value = 1047; }, 300);
                        setTimeout(() => oscillator.stop(), 500);
                        break;
                    default:
                        oscillator.frequency.value = 440;
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 100);
                }
            }
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }, []);

    // Combined function for spoken feedback with sound
    const feedback = useCallback((text, soundName = 'success') => {
        playSound(soundName);
        speak(text);
    }, [playSound, speak]);

    // Stop all audio
    const stop = useCallback(() => {
        if (speechSynthRef.current) {
            speechSynthRef.current.cancel();
        }
    }, []);

    return {
        speak,
        playSound,
        feedback,
        stop
    };
}

export default useAudio;
