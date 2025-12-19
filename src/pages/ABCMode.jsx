import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './ABCMode.css';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// Words/images for letters
const letterWords = {
    A: { word: 'Apple', emoji: '🍎' },
    B: { word: 'Ball', emoji: '⚽' },
    C: { word: 'Cat', emoji: '🐱' },
    D: { word: 'Dog', emoji: '🐕' },
    E: { word: 'Elephant', emoji: '🐘' },
    F: { word: 'Fish', emoji: '🐟' },
    G: { word: 'Grapes', emoji: '🍇' },
    H: { word: 'House', emoji: '🏠' },
    I: { word: 'Ice cream', emoji: '🍦' },
    J: { word: 'Juice', emoji: '🧃' },
    K: { word: 'Kite', emoji: '🪁' },
    L: { word: 'Lion', emoji: '🦁' },
    M: { word: 'Moon', emoji: '🌙' },
    N: { word: 'Nest', emoji: '🪺' },
    O: { word: 'Orange', emoji: '🍊' },
    P: { word: 'Penguin', emoji: '🐧' },
    Q: { word: 'Queen', emoji: '👑' },
    R: { word: 'Rainbow', emoji: '🌈' },
    S: { word: 'Sun', emoji: '☀️' },
    T: { word: 'Tree', emoji: '🌳' },
    U: { word: 'Umbrella', emoji: '☂️' },
    V: { word: 'Violin', emoji: '🎻' },
    W: { word: 'Whale', emoji: '🐋' },
    X: { word: 'Xylophone', emoji: '🎵' },
    Y: { word: 'Yacht', emoji: '⛵' },
    Z: { word: 'Zebra', emoji: '🦓' },
};

function ABCMode() {
    const navigate = useNavigate();
    const { speak, playSound } = useAudio();
    const { startSession, endSession } = useProgress();

    const [mode, setMode] = useState(null); // 'abc' or '123'
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        startSession('abc123');
        return () => endSession();
    }, []);

    const handleLetterClick = (letter) => {
        setSelectedItem({ type: 'letter', value: letter, ...letterWords[letter] });
        speak(`${letter} for ${letterWords[letter].word}`);
        playSound('click');
    };

    const handleNumberClick = (num) => {
        setSelectedItem({ type: 'number', value: num });
        speak(String(num));
        playSound('click');
    };

    // Mode selection
    if (!mode) {
        return (
            <div className="abc-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="abc-title">📚 ABC & 123</h1>
                <p className="abc-subtitle">What do you want to learn?</p>

                <div className="mode-selection">
                    <button className="mode-card abc-card" onClick={() => setMode('abc')}>
                        <span className="mode-letters">ABC</span>
                        <span>Learn Letters</span>
                    </button>
                    <button className="mode-card num-card" onClick={() => setMode('123')}>
                        <span className="mode-numbers">123</span>
                        <span>Learn Numbers</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`abc-page ${mode}`}>
            <button className="back-btn" onClick={() => setMode(null)}>← Back</button>

            <h2 className="mode-title">
                {mode === 'abc' ? '🔤 Alphabet' : '🔢 Numbers'}
            </h2>

            {/* Selected Item Display */}
            {selectedItem && (
                <div className="selected-display animate-pop">
                    {selectedItem.type === 'letter' ? (
                        <>
                            <span className="big-letter">{selectedItem.value}</span>
                            <span className="big-emoji">{selectedItem.emoji}</span>
                            <span className="word">{selectedItem.word}</span>
                        </>
                    ) : (
                        <span className="big-number">{selectedItem.value}</span>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className={`items-grid ${mode}`}>
                {mode === 'abc' ? (
                    alphabet.map(letter => (
                        <button
                            key={letter}
                            className={`item-btn letter-btn ${selectedItem?.value === letter ? 'active' : ''}`}
                            onClick={() => handleLetterClick(letter)}
                        >
                            {letter}
                        </button>
                    ))
                ) : (
                    numbers.map(num => (
                        <button
                            key={num}
                            className={`item-btn number-btn ${selectedItem?.value === num ? 'active' : ''}`}
                            onClick={() => handleNumberClick(num)}
                        >
                            {num}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export default ABCMode;
