import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import { useProfile } from '../contexts/ProfileContext';
import './MouseGames.css';

function MouseGames() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Show game menu or specific game
    if (!gameId) {
        return <GameMenu navigate={navigate} t={t} />;
    }

    switch (gameId) {
        case 'bubbles':
            return <BubblePopGame navigate={navigate} t={t} />;
        case 'movement':
        case 'butterfly':
            return <ButterflyGame navigate={navigate} t={t} />;
        case 'shapes':
            return <ShapeMatchGame navigate={navigate} t={t} />;
        default:
            return <GameMenu navigate={navigate} t={t} />;
    }
}

function GameMenu({ navigate, t }) {
    const games = [
        { id: 'bubbles', icon: '🫧', title: t('games.bubblePop'), gradient: 'var(--gradient-ocean)' },
        { id: 'butterfly', icon: '🦋', title: t('games.butterfly'), gradient: 'var(--gradient-forest)' },
        { id: 'shapes', icon: '🔷', title: t('games.shapes'), gradient: 'var(--gradient-sunset)' }
    ];

    return (
        <div className="games-page">
            <h1 className="games-title">🎮 {t('nav.games')}</h1>
            <div className="games-grid">
                {games.map((game, i) => (
                    <button
                        key={game.id}
                        className="game-card animate-pop"
                        style={{ animationDelay: `${i * 0.1}s`, '--card-bg': game.gradient }}
                        onClick={() => navigate(`/mouse/games/${game.id}`)}
                    >
                        <span className="game-icon">{game.icon}</span>
                        <span className="game-title">{game.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function BubblePopGame({ navigate, t }) {
    const { playSound, feedback } = useAudio();
    const { completeExercise, recordAccuracy, startSession, endSession } = useProgress();
    const { getActiveDifficultySettings } = useProfile();

    const [bubbles, setBubbles] = useState([]);
    const [popped, setPopped] = useState(0);
    const [score, setScore] = useState(0);
    const gameRef = useRef(null);

    const difficulty = getActiveDifficultySettings();
    const bubbleSize = difficulty.targetSize === 'large' ? 120 : difficulty.targetSize === 'medium' ? 90 : 60;

    useEffect(() => {
        startSession('mouseClicking');
        return () => endSession();
    }, [startSession, endSession]);

    // Create new bubbles periodically
    useEffect(() => {
        const createBubble = () => {
            const id = Date.now();
            const x = Math.random() * (window.innerWidth - bubbleSize);
            const y = window.innerHeight + 50;
            const speed = difficulty.movementSpeed === 'slow' ? 1 : difficulty.movementSpeed === 'medium' ? 2 : 3;
            const hue = Math.random() * 360;

            setBubbles(prev => [...prev, { id, x, y, speed, hue, size: bubbleSize }]);
        };

        const interval = setInterval(createBubble, 1500);
        return () => clearInterval(interval);
    }, [bubbleSize, difficulty.movementSpeed]);

    // Move bubbles up
    useEffect(() => {
        const moveInterval = setInterval(() => {
            setBubbles(prev => prev
                .map(b => ({ ...b, y: b.y - b.speed }))
                .filter(b => b.y > -100)
            );
        }, 30);
        return () => clearInterval(moveInterval);
    }, []);

    const popBubble = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setPopped(p => p + 1);
        setScore(s => s + 10);
        playSound('pop');

        if ((popped + 1) % 5 === 0) {
            feedback(t('feedback.awesome'), 'success');
        }
    };

    return (
        <div className="game-container bubble-game" ref={gameRef}>
            <button className="exit-game-btn" onClick={() => navigate('/mouse/games')}>✕</button>

            <div className="game-hud">
                <span className="score">🫧 {popped}</span>
            </div>

            {bubbles.map(bubble => (
                <div
                    key={bubble.id}
                    className="bubble animate-float"
                    style={{
                        left: bubble.x,
                        top: bubble.y,
                        width: bubble.size,
                        height: bubble.size,
                        background: `linear-gradient(135deg, hsla(${bubble.hue}, 70%, 70%, 0.8), hsla(${bubble.hue + 30}, 70%, 60%, 0.9))`
                    }}
                    onClick={() => popBubble(bubble.id)}
                />
            ))}

            <div className="game-instruction">
                {t('games.bubblePopDesc')}
            </div>
        </div>
    );
}

function ButterflyGame({ navigate, t }) {
    const { speak, feedback } = useAudio();
    const { startSession, endSession } = useProgress();

    const [butterflyPos, setButterflyPos] = useState({ x: 200, y: 200 });
    const [cursorNear, setCursorNear] = useState(false);
    const [catches, setCatches] = useState(0);

    useEffect(() => {
        startSession('mouseMovement');
        speak(t('games.butterflyDesc'));
        return () => endSession();
    }, [startSession, endSession, speak, t]);

    // Move butterfly randomly
    useEffect(() => {
        const moveButterfly = () => {
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            setButterflyPos({
                x: Math.random() * maxX,
                y: Math.random() * maxY
            });
        };

        const interval = setInterval(moveButterfly, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e) => {
        const dx = e.clientX - butterflyPos.x - 50;
        const dy = e.clientY - butterflyPos.y - 50;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 60 && !cursorNear) {
            setCursorNear(true);
            setCatches(c => c + 1);
            feedback(t('feedback.great'), 'success');

            // Move butterfly away
            setTimeout(() => {
                setButterflyPos({
                    x: Math.random() * (window.innerWidth - 100),
                    y: Math.random() * (window.innerHeight - 100)
                });
                setCursorNear(false);
            }, 500);
        }
    };

    return (
        <div className="game-container butterfly-game" onMouseMove={handleMouseMove}>
            <button className="exit-game-btn" onClick={() => navigate('/mouse/games')}>✕</button>

            <div className="game-hud">
                <span className="score">🦋 {catches}</span>
            </div>

            <div
                className={`butterfly ${cursorNear ? 'caught' : ''}`}
                style={{ left: butterflyPos.x, top: butterflyPos.y }}
            >
                🦋
            </div>

            <div className="game-instruction">
                {t('games.butterflyDesc')}
            </div>
        </div>
    );
}

function ShapeMatchGame({ navigate, t }) {
    const { playSound, feedback } = useAudio();
    const { completeExercise, startSession, endSession } = useProgress();

    const shapes = ['🔴', '🟢', '🔵', '🟡', '🟣'];
    const [targetShape, setTargetShape] = useState('🔴');
    const [displayShapes, setDisplayShapes] = useState([]);
    const [matched, setMatched] = useState(0);
    const [draggedShape, setDraggedShape] = useState(null);

    useEffect(() => {
        startSession('mouseDragDrop');
        generateNewRound();
        return () => endSession();
    }, [startSession, endSession]);

    const generateNewRound = () => {
        const target = shapes[Math.floor(Math.random() * shapes.length)];
        setTargetShape(target);

        // Create 4-6 shapes to choose from
        const count = 5;
        const shapeList = [];
        for (let i = 0; i < count; i++) {
            shapeList.push({
                id: i,
                shape: i === 0 ? target : shapes[Math.floor(Math.random() * shapes.length)],
                x: Math.random() * (window.innerWidth - 200) + 50,
                y: Math.random() * (window.innerHeight - 300) + 150
            });
        }
        // Shuffle
        setDisplayShapes(shapeList.sort(() => Math.random() - 0.5));
    };

    const handleShapeClick = (shape) => {
        if (shape.shape === targetShape) {
            setMatched(m => m + 1);
            playSound('success');
            feedback(t('feedback.wellDone'), 'celebration');
            setTimeout(generateNewRound, 1000);
        } else {
            playSound('click');
        }
    };

    return (
        <div className="game-container shape-game">
            <button className="exit-game-btn" onClick={() => navigate('/mouse/games')}>✕</button>

            <div className="game-hud">
                <span className="score">✓ {matched}</span>
            </div>

            <div className="target-shape-display">
                <span className="target-label">Find:</span>
                <span className="target-shape">{targetShape}</span>
            </div>

            {displayShapes.map(shape => (
                <div
                    key={shape.id}
                    className="clickable-shape"
                    style={{ left: shape.x, top: shape.y }}
                    onClick={() => handleShapeClick(shape)}
                >
                    {shape.shape}
                </div>
            ))}

            <div className="game-instruction">
                {t('games.shapesDesc')}
            </div>
        </div>
    );
}

export default MouseGames;
