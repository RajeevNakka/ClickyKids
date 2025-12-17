import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKeyboard, useKeyChallenge } from '../hooks/useKeyboard';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import { useProfile } from '../contexts/ProfileContext';
import './KeyboardLearning.css';

function KeyboardLearning() {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!exerciseId) {
        return <KeyboardMenu navigate={navigate} t={t} />;
    }

    switch (exerciseId) {
        case 'anykey':
            return <AnyKeyGame navigate={navigate} t={t} />;
        case 'findkey':
            return <FindKeyGame navigate={navigate} t={t} />;
        case 'typing':
            return <TypingGame navigate={navigate} t={t} />;
        default:
            return <KeyboardMenu navigate={navigate} t={t} />;
    }
}

function KeyboardMenu({ navigate, t }) {
    const exercises = [
        { id: 'anykey', icon: '✨', title: t('keyboard.anyKey'), desc: t('keyboard.anyKeyDesc'), gradient: 'var(--gradient-sunset)' },
        { id: 'findkey', icon: '🔍', title: t('keyboard.findKey'), desc: t('keyboard.findKeyDesc'), gradient: 'var(--gradient-ocean)' },
        { id: 'typing', icon: '⌨️', title: t('keyboard.typing'), desc: t('keyboard.typingDesc'), gradient: 'var(--gradient-forest)' }
    ];

    return (
        <div className="keyboard-page">
            <h1 className="keyboard-title">⌨️ {t('keyboard.title')}</h1>
            <div className="exercises-grid">
                {exercises.map((ex, i) => (
                    <button
                        key={ex.id}
                        className="exercise-card animate-pop"
                        style={{ animationDelay: `${i * 0.1}s`, '--card-bg': ex.gradient }}
                        onClick={() => navigate(`/keyboard/${ex.id}`)}
                    >
                        <span className="exercise-icon">{ex.icon}</span>
                        <span className="exercise-title">{ex.title}</span>
                        <span className="exercise-desc">{ex.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function AnyKeyGame({ navigate, t }) {
    const { currentKey, isPressed, getKeyLabel } = useKeyboard();
    const { playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [keyPresses, setKeyPresses] = useState(0);
    const [celebration, setCelebration] = useState(null);
    const [stars, setStars] = useState([]);

    useEffect(() => {
        startSession('keyboardBasic');
        return () => endSession();
    }, [startSession, endSession]);

    useEffect(() => {
        if (isPressed && currentKey) {
            setKeyPresses(k => k + 1);
            playSound('success');

            // Create celebration stars
            const newStars = [];
            for (let i = 0; i < 8; i++) {
                newStars.push({
                    id: Date.now() + i,
                    x: 50 + Math.random() * 50 - 25,
                    y: 50 + Math.random() * 50 - 25,
                    emoji: ['⭐', '🌟', '✨', '💫', '🎉'][Math.floor(Math.random() * 5)]
                });
            }
            setStars(newStars);
            setCelebration(getKeyLabel(currentKey.key));

            // Clear stars after animation
            setTimeout(() => setStars([]), 1000);

            if (keyPresses > 0 && keyPresses % 10 === 0) {
                feedback(t('feedback.awesome'), 'celebration');
                completeExercise('anyKey');
            }
        }
    }, [isPressed, currentKey, playSound, feedback, keyPresses, getKeyLabel, t, completeExercise]);

    return (
        <div className="game-container anykey-game">
            <button className="exit-game-btn" onClick={() => navigate('/keyboard')}>✕</button>

            <div className="game-hud">
                <span className="score">⭐ {keyPresses}</span>
            </div>

            <div className="anykey-display">
                <div className={`key-visual ${isPressed ? 'pressed' : ''}`}>
                    {celebration || '?'}
                </div>

                <p className="anykey-instruction">{t('keyboard.anyKeyDesc')}</p>
            </div>

            {/* Celebration stars */}
            <div className="stars-container">
                {stars.map(star => (
                    <span
                        key={star.id}
                        className="celebration-star"
                        style={{ left: `${star.x}%`, top: `${star.y}%` }}
                    >
                        {star.emoji}
                    </span>
                ))}
            </div>
        </div>
    );
}

function FindKeyGame({ navigate, t }) {
    const { currentKey, isPressed, getKeyLabel } = useKeyboard();
    const { targetKey, generateNewTarget, checkKey } = useKeyChallenge('beginner');
    const { playSound, feedback, speak } = useAudio();
    const { startSession, endSession, completeExercise, recordAccuracy } = useProgress();

    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        startSession('keyboardBasic');
        generateNewTarget();
        return () => endSession();
    }, [startSession, endSession, generateNewTarget]);

    useEffect(() => {
        if (targetKey) {
            setTimeout(() => speak(`Press ${targetKey}`), 500);
        }
    }, [targetKey, speak]);

    useEffect(() => {
        if (isPressed && currentKey) {
            setAttempts(a => a + 1);

            if (checkKey(currentKey.key)) {
                setScore(s => s + 1);
                setShowSuccess(true);
                playSound('success');
                feedback(t('feedback.wellDone'), 'celebration');
                completeExercise('findKey');
                recordAccuracy('keyboard', 100);

                setTimeout(() => {
                    setShowSuccess(false);
                    generateNewTarget();
                }, 1500);
            } else {
                playSound('click');
                recordAccuracy('keyboard', 0);
            }
        }
    }, [isPressed, currentKey, checkKey, playSound, feedback, generateNewTarget, t, completeExercise, recordAccuracy]);

    return (
        <div className="game-container findkey-game">
            <button className="exit-game-btn" onClick={() => navigate('/keyboard')}>✕</button>

            <div className="game-hud">
                <span className="score">✓ {score}</span>
            </div>

            <div className="findkey-display">
                <p className="findkey-prompt">{t('keyboard.findKeyDesc')}</p>

                <div className={`target-key ${showSuccess ? 'success' : ''}`}>
                    {targetKey || 'A'}
                </div>

                {showSuccess && (
                    <div className="success-overlay animate-pop">
                        {t('feedback.great')} 🎉
                    </div>
                )}
            </div>
        </div>
    );
}

function TypingGame({ navigate, t }) {
    const { currentKey, isPressed, keyHistory, clearHistory } = useKeyboard();
    const { playSound, speak } = useAudio();
    const { startSession, endSession } = useProgress();
    const { activeProfile } = useProfile();

    const [typedText, setTypedText] = useState('');
    const [targetText, setTargetText] = useState('');

    useEffect(() => {
        startSession('keyboardTyping');
        // Set target to profile name or simple word
        setTargetText(activeProfile?.name || 'HELLO');
        return () => endSession();
    }, [startSession, endSession, activeProfile]);

    useEffect(() => {
        if (isPressed && currentKey) {
            if (currentKey.key === 'Backspace') {
                setTypedText(t => t.slice(0, -1));
            } else if (currentKey.key.length === 1) {
                setTypedText(t => t + currentKey.key.toUpperCase());
                playSound('click');
            }
        }
    }, [isPressed, currentKey, playSound]);

    useEffect(() => {
        if (typedText.toUpperCase() === targetText.toUpperCase() && typedText.length > 0) {
            speak(t('feedback.awesome'));
            playSound('celebration');
        }
    }, [typedText, targetText, speak, playSound, t]);

    const isComplete = typedText.toUpperCase() === targetText.toUpperCase();

    return (
        <div className="game-container typing-game">
            <button className="exit-game-btn" onClick={() => navigate('/keyboard')}>✕</button>

            <div className="typing-display">
                <p className="typing-prompt">Type:</p>

                <div className="target-word">
                    {targetText.split('').map((char, i) => (
                        <span
                            key={i}
                            className={`target-char ${i < typedText.length
                                    ? typedText[i].toUpperCase() === char.toUpperCase() ? 'correct' : 'wrong'
                                    : ''
                                }`}
                        >
                            {char}
                        </span>
                    ))}
                </div>

                <div className="typed-text">
                    {typedText || '_'}
                    <span className="cursor">|</span>
                </div>

                {isComplete && (
                    <div className="complete-message animate-pop">
                        🎉 {t('feedback.awesome')} 🎉
                    </div>
                )}

                <button
                    className="btn btn-large btn-fun"
                    onClick={() => {
                        setTypedText('');
                        clearHistory();
                    }}
                >
                    🔄 Reset
                </button>
            </div>
        </div>
    );
}

export default KeyboardLearning;
