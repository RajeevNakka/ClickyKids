import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './MemoryMatch.css';

// Card sets for the game
const cardSets = {
    animals: ['🦁', '🐘', '🐕', '🐱', '🐦', '🐄'],
    fruits: ['🍎', '🍌', '🍊', '🍇', '🥭', '🍉'],
    shapes: ['⭐', '❤️', '🔵', '🟢', '🔶', '🟣'],
};

function MemoryMatch() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [cardSet, setCardSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Start session
    useEffect(() => {
        startSession('memory');
        return () => endSession();
    }, []);

    // Initialize cards when set is selected
    const initializeGame = useCallback((setName) => {
        const emojis = cardSets[setName];
        const pairs = [...emojis, ...emojis];
        const shuffled = pairs
            .map((emoji, i) => ({ id: i, emoji, key: Math.random() }))
            .sort((a, b) => a.key - b.key);

        setCardSet(setName);
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsComplete(false);
        speak('Find the matching pairs!');
    }, [speak]);

    // Handle card click
    const handleCardClick = (id) => {
        if (flipped.length === 2) return;
        if (flipped.includes(id)) return;
        if (matched.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);
        playSound('click');

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            const card1 = cards.find(c => c.id === first);
            const card2 = cards.find(c => c.id === second);

            if (card1.emoji === card2.emoji) {
                // Match found
                setMatched(prev => [...prev, first, second]);
                setFlipped([]);
                feedback('Match!', 'correct');

                // Check if game complete
                if (matched.length + 2 === cards.length) {
                    setIsComplete(true);
                    completeExercise('memory');
                    setTimeout(() => {
                        speak(`Amazing! You completed it in ${moves + 1} moves!`);
                    }, 500);
                }
            } else {
                // No match - flip back
                setTimeout(() => {
                    setFlipped([]);
                    playSound('click');
                }, 1000);
            }
        }
    };

    // Set selection screen
    if (!cardSet) {
        return (
            <div className="memory-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="memory-title">🧠 Memory Match</h1>
                <p className="memory-subtitle">Choose a card set:</p>
                <div className="set-grid">
                    {Object.entries(cardSets).map(([name, emojis]) => (
                        <button
                            key={name}
                            className="set-card"
                            onClick={() => initializeGame(name)}
                        >
                            <span className="set-preview">{emojis.slice(0, 3).join(' ')}</span>
                            <span className="set-name">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="memory-page">
            <button className="back-btn" onClick={() => setCardSet(null)}>← Back</button>

            <div className="memory-hud">
                <span>Moves: {moves}</span>
                <span>Matches: {matched.length / 2}/{cards.length / 2}</span>
            </div>

            <div className="cards-grid">
                {cards.map(card => {
                    const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                    const isMatched = matched.includes(card.id);

                    return (
                        <button
                            key={card.id}
                            className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                            onClick={() => handleCardClick(card.id)}
                            disabled={isMatched}
                        >
                            <div className="card-inner">
                                <div className="card-front">❓</div>
                                <div className="card-back">{card.emoji}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {isComplete && (
                <div className="complete-overlay">
                    <div className="complete-content animate-pop">
                        <span className="complete-emoji">🎉</span>
                        <h2>Amazing!</h2>
                        <p>Completed in {moves} moves</p>
                        <button className="btn btn-success" onClick={() => initializeGame(cardSet)}>
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemoryMatch;
