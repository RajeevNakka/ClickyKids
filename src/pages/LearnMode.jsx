import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './LearnMode.css';

// Learning categories with items
const categories = {
    animals: {
        icon: '🦁',
        background: 'forest',
        items: [
            { id: 'lion', emoji: '🦁', name: 'Lion', sound: 'roars', soundType: 'lion' },
            { id: 'elephant', emoji: '🐘', name: 'Elephant', sound: 'trumpets', soundType: 'elephant' },
            { id: 'dog', emoji: '🐕', name: 'Dog', sound: 'barks', soundType: 'dog' },
            { id: 'cat', emoji: '🐱', name: 'Cat', sound: 'meows', soundType: 'cat' },
            { id: 'bird', emoji: '🐦', name: 'Bird', sound: 'chirps', soundType: 'bird' },
            { id: 'cow', emoji: '🐄', name: 'Cow', sound: 'moos', soundType: 'cow' },
        ]
    },
    fruits: {
        icon: '🍎',
        background: 'market',
        items: [
            { id: 'apple', emoji: '🍎', name: 'Apple', sound: 'crunchy' },
            { id: 'banana', emoji: '🍌', name: 'Banana', sound: 'sweet' },
            { id: 'orange', emoji: '🍊', name: 'Orange', sound: 'juicy' },
            { id: 'grapes', emoji: '🍇', name: 'Grapes', sound: 'yummy' },
            { id: 'mango', emoji: '🥭', name: 'Mango', sound: 'delicious' },
            { id: 'watermelon', emoji: '🍉', name: 'Watermelon', sound: 'refreshing' },
        ]
    }
};

// Synthesize animal sounds using Web Audio API
const playAnimalSound = (soundType) => {
    if (!soundType) return;

    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different sound patterns for each animal
        switch (soundType) {
            case 'lion':
                // Deep rumbling roar
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(120, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.8);
                break;

            case 'elephant':
                // Trumpet sound
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
                oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.6);
                break;

            case 'dog':
                // Bark - quick high then low
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.35);
                break;

            case 'cat':
                // Meow - rising then falling
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
                oscillator.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.5);
                break;

            case 'bird':
                // Chirp - quick high notes
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
                oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(1300, ctx.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.25);
                break;

            case 'cow':
                // Moo - low sustained note
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.6);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.7);
                break;

            default:
                return;
        }
    } catch (e) {
        console.log('Audio synthesis error:', e);
    }
};

function LearnMode() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [mode, setMode] = useState(null);

    if (!selectedCategory) {
        return <CategorySelect onSelect={setSelectedCategory} navigate={navigate} t={t} />;
    }

    if (!mode) {
        return <ModeSelect category={selectedCategory} onSelect={setMode} onBack={() => setSelectedCategory(null)} t={t} />;
    }

    if (mode === 'explore') {
        return <ExploreMode category={selectedCategory} onBack={() => setMode(null)} t={t} />;
    }

    return <PlayMode category={selectedCategory} onBack={() => setMode(null)} t={t} />;
}

function CategorySelect({ onSelect, navigate, t }) {
    return (
        <div className="learn-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
            <h1 className="learn-title">📚 {t('nav.learn') || 'Learn'}</h1>
            <div className="category-grid">
                {Object.entries(categories).map(([key, cat]) => (
                    <button key={key} className={`category-card ${key}`} onClick={() => onSelect(key)}>
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ModeSelect({ category, onSelect, onBack, t }) {
    const cat = categories[category];
    return (
        <div className={`learn-page bg-${cat.background}`}>
            <button className="back-btn" onClick={onBack}>← Back</button>
            <h1 className="learn-title">{cat.icon} {category.charAt(0).toUpperCase() + category.slice(1)}</h1>
            <div className="mode-grid">
                <button className="mode-card explore" onClick={() => onSelect('explore')}>
                    <span className="mode-icon">🔍</span>
                    <span className="mode-name">Explore</span>
                    <span className="mode-desc">Click to learn names & sounds</span>
                </button>
                <button className="mode-card play" onClick={() => onSelect('play')}>
                    <span className="mode-icon">🎮</span>
                    <span className="mode-name">Play</span>
                    <span className="mode-desc">Find the right one!</span>
                </button>
            </div>
        </div>
    );
}

function ExploreMode({ category, onBack, t }) {
    const { speak, playSound } = useAudio();
    const { startSession, endSession } = useProgress();
    const cat = categories[category];

    useEffect(() => {
        startSession('explore');
        return () => endSession();
    }, []);

    const handleItemClick = (item) => {
        // Play synthesized animal sound if available
        if (item.soundType) {
            playAnimalSound(item.soundType);
            // Say just the name after a brief delay
            setTimeout(() => speak(`${item.name}!`), 600);
        } else {
            // For fruits, just speak
            speak(`This is a ${item.name}. It is ${item.sound}!`);
        }
        playSound('click');
    };

    return (
        <div className={`learn-page bg-${cat.background}`}>
            <button className="back-btn" onClick={onBack}>← Back</button>
            <h2 className="explore-title">🔍 Tap to learn!</h2>
            <div className="items-grid">
                {cat.items.map((item, i) => (
                    <button
                        key={item.id}
                        className="learn-item animate-pop"
                        style={{ animationDelay: `${i * 0.1}s` }}
                        onClick={() => handleItemClick(item)}
                    >
                        <span className="item-emoji">{item.emoji}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PlayMode({ category, onBack, t }) {
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();
    const cat = categories[category];

    const [target, setTarget] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(null);

    useEffect(() => {
        startSession('play');
        return () => endSession();
    }, []);

    const pickNewTarget = useCallback(() => {
        const item = cat.items[Math.floor(Math.random() * cat.items.length)];
        setTarget(item);
        setShowResult(null);
        setTimeout(() => {
            if (category === 'animals') {
                speak(`Find the ${item.name}! The ${item.name} ${item.sound}!`);
            } else {
                speak(`Find the ${item.name}!`);
            }
        }, 500);
    }, [category, cat.items, speak]);

    useEffect(() => {
        pickNewTarget();
    }, []);

    const handleItemClick = (item) => {
        if (item.id === target?.id) {
            setScore(s => s + 1);
            setShowResult('correct');
            feedback('Great job!', 'celebration');
            completeExercise('learn');
            setTimeout(pickNewTarget, 1500);
        } else {
            setShowResult('wrong');
            playSound('click');
            speak('Try again!');
        }
    };

    return (
        <div className={`learn-page bg-${cat.background}`}>
            <button className="back-btn" onClick={onBack}>← Back</button>
            <div className="play-hud">
                <span className="score">⭐ {score}</span>
            </div>
            <h2 className="play-title">
                {target ? `Find the ${target.name}!` : 'Loading...'}
            </h2>
            <div className="items-grid">
                {cat.items.map((item, i) => (
                    <button
                        key={item.id}
                        className={`learn-item animate-pop ${showResult && item.id === target?.id ? 'highlight' : ''}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                        onClick={() => handleItemClick(item)}
                    >
                        <span className="item-emoji">{item.emoji}</span>
                    </button>
                ))}
            </div>
            {showResult === 'correct' && (
                <div className="result-overlay correct">🎉 Correct!</div>
            )}
        </div>
    );
}

export default LearnMode;
