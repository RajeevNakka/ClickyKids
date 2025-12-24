import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import CelebrationOverlay from '../components/common/CelebrationOverlay';
import './DragDrop.css';

// Sorting categories
const sortingGames = {
    animalsVsFruits: {
        title: 'Animals vs Fruits',
        categories: [
            { id: 'animals', label: '🦁 Animals', color: '#22C55E' },
            { id: 'fruits', label: '🍎 Fruits', color: '#F59E0B' },
        ],
        items: [
            { id: 1, emoji: '🦁', category: 'animals' },
            { id: 2, emoji: '🍎', category: 'fruits' },
            { id: 3, emoji: '🐘', category: 'animals' },
            { id: 4, emoji: '🍌', category: 'fruits' },
            { id: 5, emoji: '🐕', category: 'animals' },
            { id: 6, emoji: '🍊', category: 'fruits' },
        ],
    },
    colors: {
        title: 'Sort by Color',
        categories: [
            { id: 'red', label: '❤️ Red', color: '#EF4444' },
            { id: 'blue', label: '💙 Blue', color: '#3B82F6' },
        ],
        items: [
            { id: 1, emoji: '🍎', category: 'red' },
            { id: 2, emoji: '🐋', category: 'blue' },
            { id: 3, emoji: '🍓', category: 'red' },
            { id: 4, emoji: '🦋', category: 'blue' },
            { id: 5, emoji: '🌹', category: 'red' },
            { id: 6, emoji: '💧', category: 'blue' },
        ],
    },
    sizes: {
        title: 'Big vs Small',
        categories: [
            { id: 'big', label: '🐘 Big', color: '#8B5CF6' },
            { id: 'small', label: '🐜 Small', color: '#EC4899' },
        ],
        items: [
            { id: 1, emoji: '🐘', category: 'big' },
            { id: 2, emoji: '🐜', category: 'small' },
            { id: 3, emoji: '🦁', category: 'big' },
            { id: 4, emoji: '🐞', category: 'small' },
            { id: 5, emoji: '🐋', category: 'big' },
            { id: 6, emoji: '🐝', category: 'small' },
        ],
    },
};

function DragDrop() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [gameType, setGameType] = useState(null);
    const [items, setItems] = useState([]);
    const [sorted, setSorted] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        startSession('dragdrop');
        return () => endSession();
    }, []);

    const startGame = (type) => {
        const game = sortingGames[type];
        const shuffled = [...game.items].sort(() => Math.random() - 0.5);
        setGameType(type);
        setItems(shuffled);
        setSorted({});
        setScore(0);
        setIsComplete(false);
        speak(game.title + '! Drag items to the correct box!');
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, categoryId) => {
        e.preventDefault();
        if (!draggedItem) return;

        const isCorrect = draggedItem.category === categoryId;

        if (isCorrect) {
            setItems(prev => prev.filter(i => i.id !== draggedItem.id));
            setSorted(prev => ({
                ...prev,
                [categoryId]: [...(prev[categoryId] || []), draggedItem],
            }));
            setScore(s => s + 1);
            feedback('Correct!', 'correct');

            // Check completion
            if (items.length === 1) {
                setIsComplete(true);
                completeExercise('dragdrop');
                setTimeout(() => speak('Amazing! You sorted them all!'), 500);
            }
        } else {
            playSound('click');
            speak('Try again!');
        }

        setDraggedItem(null);
    };

    // Touch support
    const handleTouchStart = (e, item) => {
        setDraggedItem(item);
    };

    const handleTouchEnd = (e, categoryId) => {
        if (draggedItem) {
            handleDrop({ preventDefault: () => { } }, categoryId);
        }
    };

    // Game selection
    if (!gameType) {
        return (
            <div className="dragdrop-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="dragdrop-title">🎯 Drag & Drop</h1>
                <p className="dragdrop-subtitle">Choose a sorting game:</p>
                <div className="game-selection">
                    {Object.entries(sortingGames).map(([key, game]) => (
                        <button
                            key={key}
                            className="game-option"
                            onClick={() => startGame(key)}
                        >
                            <span className="game-preview">
                                {game.items.slice(0, 3).map(i => i.emoji).join(' ')}
                            </span>
                            <span className="game-name">{game.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const game = sortingGames[gameType];

    return (
        <div className="dragdrop-page playing">
            <button className="back-btn" onClick={() => setGameType(null)}>← Back</button>

            <div className="dragdrop-hud">
                <span>⭐ {score}/{game.items.length}</span>
            </div>

            <h2 className="game-title">{game.title}</h2>

            {/* Items to sort */}
            <div className="items-tray">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="drag-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onTouchStart={(e) => handleTouchStart(e, item)}
                    >
                        {item.emoji}
                    </div>
                ))}
            </div>

            {/* Drop zones */}
            <div className="drop-zones">
                {game.categories.map(cat => (
                    <div
                        key={cat.id}
                        className="drop-zone"
                        style={{ '--zone-color': cat.color }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, cat.id)}
                        onTouchEnd={(e) => handleTouchEnd(e, cat.id)}
                    >
                        <span className="zone-label">{cat.label}</span>
                        <div className="sorted-items">
                            {(sorted[cat.id] || []).map(item => (
                                <span key={item.id} className="sorted-item">{item.emoji}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isComplete && (
                <CelebrationOverlay
                    message="Great Job!"
                    subMessage={`You sorted all ${game.items.length} items!`}
                    onPlayAgain={() => startGame(gameType)}
                    onNewGame={() => setGameType(null)}
                    playAgainText="Play Again"
                    newGameText="New Game"
                />
            )}
        </div>
    );
}

export default DragDrop;
