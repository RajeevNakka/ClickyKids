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
            { id: 'lion', emoji: '🦁', name: 'Lion', sound: 'roars', soundUrl: 'https://www.soundjay.com/animals/lion-roar-01.mp3' },
            { id: 'elephant', emoji: '🐘', name: 'Elephant', sound: 'trumpets', soundUrl: 'https://www.soundjay.com/animals/elephant-1.mp3' },
            { id: 'dog', emoji: '🐕', name: 'Dog', sound: 'barks', soundUrl: 'https://www.soundjay.com/animals/dog-barking-1.mp3' },
            { id: 'cat', emoji: '🐱', name: 'Cat', sound: 'meows', soundUrl: 'https://www.soundjay.com/animals/cat-meow-1.mp3' },
            { id: 'bird', emoji: '🐦', name: 'Bird', sound: 'chirps', soundUrl: 'https://www.soundjay.com/animals/bird-chirping-1.mp3' },
            { id: 'cow', emoji: '🐄', name: 'Cow', sound: 'moos', soundUrl: 'https://www.soundjay.com/animals/cow-moo-1.mp3' },
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

// Play animal sound from URL
const playAnimalSound = (url) => {
    if (!url) return;
    try {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(() => {
            console.log('Could not play animal sound');
        });
    } catch (e) {
        console.log('Audio error:', e);
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
        // Play real animal sound if available
        if (item.soundUrl) {
            playAnimalSound(item.soundUrl);
            // Say just the name after a brief delay
            setTimeout(() => speak(`${item.name}!`), 500);
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
