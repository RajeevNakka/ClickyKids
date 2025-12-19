import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './PopBubbles.css';

// Content for bubbles
const bubbleContent = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    animals: ['🦁', '🐘', '🐕', '🐱', '🐦', '🐄', '🐸', '🦊', '🐰', '🐻'],
};

function PopBubbles() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [mode, setMode] = useState(null);
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const containerRef = useRef(null);
    const bubbleIdRef = useRef(0);

    // Start session
    useEffect(() => {
        startSession('bubbles');
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
                    completeExercise('bubbles');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, completeExercise]);

    // Spawn bubbles
    useEffect(() => {
        if (!isPlaying) return;

        const spawnInterval = setInterval(() => {
            const content = bubbleContent[mode];
            const item = content[Math.floor(Math.random() * content.length)];
            const size = 70 + Math.random() * 50;

            const newBubble = {
                id: bubbleIdRef.current++,
                content: item,
                x: 10 + Math.random() * 70,
                size,
                speed: 0.8 + Math.random() * 1.2, // Much slower speed
                y: 100,
            };

            setBubbles(prev => [...prev, newBubble]);
        }, 1200); // Spawn less frequently

        return () => clearInterval(spawnInterval);
    }, [isPlaying, mode]);

    // Animate bubbles floating up
    useEffect(() => {
        if (!isPlaying) return;

        const animFrame = setInterval(() => {
            setBubbles(prev =>
                prev
                    .map(b => ({ ...b, y: b.y - b.speed * 0.3 })) // Slower movement
                    .filter(b => b.y > -20)
            );
        }, 50);

        return () => clearInterval(animFrame);
    }, [isPlaying]);

    // Start game
    const startGame = (selectedMode) => {
        setMode(selectedMode);
        setBubbles([]);
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setIsGameOver(false);
        speak(`Pop the ${selectedMode}!`);
    };

    // Pop bubble
    const popBubble = (id, content) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setScore(s => s + 1);
        playSound('click');

        if (mode === 'letters' || mode === 'numbers') {
            speak(content);
        }
    };

    // Mode selection
    if (!mode || isGameOver) {
        return (
            <div className="bubbles-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

                {isGameOver ? (
                    <div className="game-over animate-pop">
                        <span className="game-over-emoji">🎈</span>
                        <h1>Time's Up!</h1>
                        <p className="final-score">You popped {score} bubbles!</p>
                        <button className="btn btn-success" onClick={() => startGame(mode)}>
                            Play Again
                        </button>
                        <button className="btn" onClick={() => { setMode(null); setIsGameOver(false); }}>
                            Change Mode
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="bubbles-title">🎈 Pop the Bubbles!</h1>
                        <p className="bubbles-subtitle">Choose what to pop:</p>
                        <div className="mode-selection">
                            <button className="mode-btn letters" onClick={() => startGame('letters')}>
                                <span className="mode-preview">ABC</span>
                                <span>Letters</span>
                            </button>
                            <button className="mode-btn numbers" onClick={() => startGame('numbers')}>
                                <span className="mode-preview">123</span>
                                <span>Numbers</span>
                            </button>
                            <button className="mode-btn animals" onClick={() => startGame('animals')}>
                                <span className="mode-preview">🦁🐘</span>
                                <span>Animals</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bubbles-page playing" ref={containerRef}>
            <div className="bubbles-hud">
                <span className="hud-score">⭐ {score}</span>
                <span className="hud-time">⏱️ {timeLeft}s</span>
            </div>

            <div className="bubbles-container">
                {bubbles.map(bubble => (
                    <button
                        key={bubble.id}
                        className="bubble animate-float"
                        style={{
                            left: `${bubble.x}%`,
                            bottom: `${bubble.y}%`,
                            width: bubble.size,
                            height: bubble.size,
                            fontSize: bubble.size * 0.5,
                        }}
                        onClick={() => popBubble(bubble.id, bubble.content)}
                    >
                        {bubble.content}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PopBubbles;
