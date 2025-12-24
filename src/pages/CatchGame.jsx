import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './CatchGame.css';

// Items that fall
const fallingItems = {
    fruits: ['🍎', '🍌', '🍊', '🍇', '🥭', '🍉', '🍓', '🍑'],
    stars: ['⭐', '🌟', '✨', '💫'],
    animals: ['🦋', '🐝', '🐞', '🐛'],
};

function CatchGame() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [mode, setMode] = useState(null);
    const [items, setItems] = useState([]);
    const [basketX, setBasketX] = useState(50);
    const [score, setScore] = useState(0);
    const [missed, setMissed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const containerRef = useRef(null);
    const itemIdRef = useRef(0);

    useEffect(() => {
        startSession('catch');
        return () => endSession();
    }, []);

    // Timer
    useEffect(() => {
        if (!isPlaying || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setIsPlaying(false);
                    setIsGameOver(true);
                    completeExercise('catch');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, completeExercise]);

    // Spawn items
    useEffect(() => {
        if (!isPlaying) return;

        const spawnInterval = setInterval(() => {
            const itemSet = fallingItems[mode];
            const emoji = itemSet[Math.floor(Math.random() * itemSet.length)];

            const newItem = {
                id: itemIdRef.current++,
                emoji,
                x: 5 + Math.random() * 90, // Full width spawn
                y: -10,
                speed: 0.3 + Math.random() * 0.5, // Slower falling
            };

            setItems(prev => [...prev, newItem]);
        }, 1000);

        return () => clearInterval(spawnInterval);
    }, [isPlaying, mode]);

    // Move items down
    useEffect(() => {
        if (!isPlaying) return;

        const moveInterval = setInterval(() => {
            setItems(prev => {
                const updated = [];
                prev.forEach(item => {
                    const newY = item.y + item.speed;

                    // Check if caught
                    if (newY >= 80 && newY <= 95) {
                        const basketLeft = basketX - 10;
                        const basketRight = basketX + 10;
                        if (item.x >= basketLeft && item.x <= basketRight) {
                            // Caught!
                            setScore(s => s + 1);
                            playSound('click');
                            return; // Don't add to updated
                        }
                    }

                    // Check if missed
                    if (newY > 100) {
                        setMissed(m => m + 1);
                        return; // Don't add to updated
                    }

                    updated.push({ ...item, y: newY });
                });
                return updated;
            });
        }, 50);

        return () => clearInterval(moveInterval);
    }, [isPlaying, basketX, playSound]);

    // Mouse/touch movement
    const handleMove = useCallback((clientX) => {
        if (!containerRef.current || !isPlaying) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        setBasketX(Math.max(10, Math.min(90, x)));
    }, [isPlaying]);

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);

    const startGame = (selectedMode) => {
        setMode(selectedMode);
        setItems([]);
        setScore(0);
        setMissed(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setIsGameOver(false);
        speak('Catch them all!');
    };

    // Mode selection
    if (!mode || isGameOver) {
        return (
            <div className="catch-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

                {isGameOver ? (
                    <div className="game-over animate-pop">
                        <span className="game-over-emoji">🧺</span>
                        <h1>Time's Up!</h1>
                        <div className="game-stats">
                            <p>Caught: <strong>{score}</strong></p>
                            <p>Missed: <strong>{missed}</strong></p>
                        </div>
                        <button className="btn btn-success" onClick={() => startGame(mode)}>
                            Play Again
                        </button>
                        <button className="btn" onClick={() => { setMode(null); setIsGameOver(false); }}>
                            Change Mode
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="catch-title">🧺 Catch Game</h1>
                        <p className="catch-subtitle">Move the basket to catch falling items!</p>
                        <div className="mode-selection">
                            <button className="mode-btn" onClick={() => startGame('fruits')}>
                                <span className="mode-preview">🍎🍌🍊</span>
                                <span>Catch Fruits</span>
                            </button>
                            <button className="mode-btn" onClick={() => startGame('stars')}>
                                <span className="mode-preview">⭐🌟✨</span>
                                <span>Catch Stars</span>
                            </button>
                            <button className="mode-btn" onClick={() => startGame('animals')}>
                                <span className="mode-preview">🦋🐝🐞</span>
                                <span>Catch Bugs</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div
            className="catch-page playing"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            <div className="catch-hud">
                <span className="hud-score">🧺 {score}</span>
                <span className="hud-time">⏱️ {timeLeft}s</span>
            </div>

            {/* Falling items */}
            <div className="game-area">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="falling-item"
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                        }}
                    >
                        {item.emoji}
                    </div>
                ))}

                {/* Basket */}
                <div
                    className="basket"
                    style={{ left: `${basketX}%` }}
                >
                    🧺
                </div>
            </div>
        </div>
    );
}

export default CatchGame;
