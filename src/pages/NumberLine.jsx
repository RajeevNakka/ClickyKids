import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './NumberLine.css';

function NumberLine() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [mode, setMode] = useState(null); // 'count', 'find', 'add'
    const [numbers, setNumbers] = useState([]);
    const [currentTarget, setCurrentTarget] = useState(null);
    const [characterPos, setCharacterPos] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        startSession('numberline');
        return () => endSession();
    }, []);

    const startGame = useCallback((selectedMode) => {
        setMode(selectedMode);
        setScore(0);
        setStreak(0);
        setCharacterPos(0);

        // Generate number line based on mode
        if (selectedMode === 'count') {
            setNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            setCurrentTarget(1);
            speak('Click 1 to start counting!');
            setMessage('Click 1');
        } else if (selectedMode === 'find') {
            setNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const target = Math.floor(Math.random() * 10) + 1;
            setCurrentTarget(target);
            speak(`Find number ${target}!`);
            setMessage(`Find ${target}`);
        } else if (selectedMode === 'add') {
            setNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            // Start at random position, ask to add/subtract
            const start = Math.floor(Math.random() * 5) + 1;
            const add = Math.floor(Math.random() * 4) + 1;
            setCharacterPos(start);
            setCurrentTarget({ start, add, answer: start + add });
            speak(`${start} plus ${add} equals what?`);
            setMessage(`${start} + ${add} = ?`);
        }
    }, [speak]);

    const handleNumberClick = useCallback((num) => {
        if (mode === 'count') {
            if (num === currentTarget) {
                playSound('click');
                setCharacterPos(num);
                setScore(s => s + 1);
                setStreak(s => s + 1);

                if (num === 10) {
                    feedback('Amazing! You counted to 10!', 'celebration');
                    completeExercise('numberline');
                    setMessage('🎉 Complete!');
                    setMode(null);
                } else {
                    setCurrentTarget(num + 1);
                    speak(String(num + 1));
                    setMessage(`Click ${num + 1}`);
                }
            }
        } else if (mode === 'find') {
            if (num === currentTarget) {
                playSound('success');
                setCharacterPos(num);
                setScore(s => s + 1);
                setStreak(s => s + 1);
                feedback('Correct!', 'click');

                if (streak >= 4) {
                    completeExercise('numberline');
                    feedback('Excellent! 5 in a row!', 'celebration');
                    setMessage('🎉 Great job!');
                    setTimeout(() => {
                        const newTarget = Math.floor(Math.random() * 10) + 1;
                        setCurrentTarget(newTarget);
                        speak(`Find number ${newTarget}!`);
                        setMessage(`Find ${newTarget}`);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        const newTarget = Math.floor(Math.random() * 10) + 1;
                        setCurrentTarget(newTarget);
                        speak(`Find number ${newTarget}!`);
                        setMessage(`Find ${newTarget}`);
                    }, 1000);
                }
            } else {
                playSound('wrong');
                setStreak(0);
                speak('Try again!');
            }
        } else if (mode === 'add') {
            if (num === currentTarget.answer) {
                playSound('success');
                setCharacterPos(num);
                setScore(s => s + 1);
                setStreak(s => s + 1);
                feedback('Correct!', 'click');

                setTimeout(() => {
                    const start = Math.floor(Math.random() * 5) + 1;
                    const add = Math.floor(Math.random() * 4) + 1;
                    setCharacterPos(start);
                    setCurrentTarget({ start, add, answer: start + add });
                    speak(`${start} plus ${add} equals what?`);
                    setMessage(`${start} + ${add} = ?`);
                }, 1000);
            } else {
                playSound('wrong');
                setStreak(0);
                speak('Try again!');
            }
        }
    }, [mode, currentTarget, streak, playSound, speak, feedback, completeExercise]);

    // Mode selection
    if (!mode) {
        return (
            <div className="numberline-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="numberline-title">🔢 Number Line Jump</h1>
                <p className="numberline-subtitle">Choose a mode:</p>

                <div className="mode-selection">
                    <button className="mode-btn" onClick={() => startGame('count')}>
                        <span className="mode-icon">1️⃣</span>
                        <span className="mode-name">Count to 10</span>
                        <span className="mode-desc">Click numbers in order</span>
                    </button>
                    <button className="mode-btn" onClick={() => startGame('find')}>
                        <span className="mode-icon">🔍</span>
                        <span className="mode-name">Find Number</span>
                        <span className="mode-desc">Find the number I say</span>
                    </button>
                    <button className="mode-btn" onClick={() => startGame('add')}>
                        <span className="mode-icon">➕</span>
                        <span className="mode-name">Addition</span>
                        <span className="mode-desc">Solve simple addition</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="numberline-page playing">
            <button className="back-btn" onClick={() => setMode(null)}>← Back</button>

            <div className="game-hud">
                <span>⭐ {score}</span>
                <span>🔥 {streak}</span>
            </div>

            <h2 className="game-message">{message}</h2>

            {/* Number Line */}
            <div className="numberline-container">
                <div className="numberline">
                    {numbers.map((num, i) => (
                        <div key={num} className="number-spot">
                            <button
                                className={`number-btn ${characterPos === num ? 'has-character' : ''}`}
                                onClick={() => handleNumberClick(num)}
                            >
                                {num}
                            </button>
                            {characterPos === num && (
                                <span className="character">🐸</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NumberLine;
