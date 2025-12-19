import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './SimonSays.css';

const colors = [
    { id: 'red', color: '#EF4444', freq: 329.63 },    // E4
    { id: 'blue', color: '#3B82F6', freq: 261.63 },   // C4
    { id: 'green', color: '#22C55E', freq: 392.00 },  // G4
    { id: 'yellow', color: '#FBBF24', freq: 523.25 }, // C5
];

function SimonSays() {
    const navigate = useNavigate();
    const { speak, playSound } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [activeColor, setActiveColor] = useState(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('simon-highscore') || '0');
    });
    const [gameOver, setGameOver] = useState(false);

    const audioContextRef = useRef(null);

    useEffect(() => {
        startSession('simon');
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            endSession();
            audioContextRef.current?.close();
        };
    }, []);

    // Play a tone for a color
    const playTone = useCallback((freq, duration = 0.3) => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }, []);

    // Flash a color
    const flashColor = useCallback((colorId, duration = 500) => {
        return new Promise(resolve => {
            setActiveColor(colorId);
            const color = colors.find(c => c.id === colorId);
            if (color) playTone(color.freq);
            setTimeout(() => {
                setActiveColor(null);
                setTimeout(resolve, 200);
            }, duration);
        });
    }, [playTone]);

    // Show the sequence to the player
    const showSequence = useCallback(async (seq) => {
        setIsShowingSequence(true);
        await new Promise(r => setTimeout(r, 500));

        for (const colorId of seq) {
            await flashColor(colorId);
        }

        setIsShowingSequence(false);
    }, [flashColor]);

    // Start a new game
    const startGame = useCallback(() => {
        const firstColor = colors[Math.floor(Math.random() * colors.length)].id;
        setSequence([firstColor]);
        setPlayerSequence([]);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        speak('Watch and repeat!');

        setTimeout(() => showSequence([firstColor]), 1000);
    }, [speak, showSequence]);

    // Add next color to sequence
    const nextRound = useCallback(() => {
        const nextColor = colors[Math.floor(Math.random() * colors.length)].id;
        const newSequence = [...sequence, nextColor];
        setSequence(newSequence);
        setPlayerSequence([]);
        setScore(s => s + 1);

        setTimeout(() => showSequence(newSequence), 1000);
    }, [sequence, showSequence]);

    // Handle player clicking a color
    const handleColorClick = useCallback((colorId) => {
        if (isShowingSequence || !isPlaying || gameOver) return;

        flashColor(colorId, 300);

        const newPlayerSequence = [...playerSequence, colorId];
        setPlayerSequence(newPlayerSequence);

        // Check if correct
        const currentIndex = newPlayerSequence.length - 1;
        if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
            // Wrong!
            setGameOver(true);
            setIsPlaying(false);

            // Update high score
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('simon-highscore', String(score));
                speak('New high score!');
            } else {
                speak('Game over!');
            }
            completeExercise('simon');
            return;
        }

        // Check if sequence complete
        if (newPlayerSequence.length === sequence.length) {
            speak('Great!');
            nextRound();
        }
    }, [isShowingSequence, isPlaying, gameOver, playerSequence, sequence, score, highScore, flashColor, speak, nextRound, completeExercise]);

    return (
        <div className="simon-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h1 className="simon-title">🎯 Simon Says</h1>

            <div className="simon-hud">
                <span>Score: {score}</span>
                <span>Best: {highScore}</span>
            </div>

            <div className="simon-board">
                {colors.map(color => (
                    <button
                        key={color.id}
                        className={`simon-btn ${color.id} ${activeColor === color.id ? 'active' : ''}`}
                        style={{ '--btn-color': color.color }}
                        onClick={() => handleColorClick(color.id)}
                        disabled={isShowingSequence || !isPlaying}
                    />
                ))}
            </div>

            {!isPlaying && !gameOver && (
                <button className="btn btn-success start-btn" onClick={startGame}>
                    Start Game
                </button>
            )}

            {isShowingSequence && (
                <p className="simon-message">Watch carefully...</p>
            )}

            {isPlaying && !isShowingSequence && (
                <p className="simon-message">Your turn! ({playerSequence.length}/{sequence.length})</p>
            )}

            {gameOver && (
                <div className="game-over-panel">
                    <h2>Game Over!</h2>
                    <p>You reached level {score}</p>
                    {score === highScore && score > 0 && <p className="new-record">🏆 New Record!</p>}
                    <button className="btn btn-success" onClick={startGame}>
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default SimonSays;
