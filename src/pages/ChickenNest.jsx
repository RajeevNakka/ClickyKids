import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import CelebrationOverlay from '../components/common/CelebrationOverlay';
import './ChickenNest.css';

// Level configurations
const levels = [
    {
        id: 1,
        name: 'Easy',
        description: 'Push all chickens to the nest!',
        chickens: [
            { id: 1, x: 80, y: 120, color: '#FFD700' },
            { id: 2, x: 250, y: 100, color: '#FFD700' },
        ],
        nests: [
            { id: 1, x: 150, y: 280, color: '#8B4513', acceptsAll: true },
        ],
    },
    {
        id: 2,
        name: 'Medium',
        description: 'Push 3 chickens to the nest!',
        chickens: [
            { id: 1, x: 50, y: 80, color: '#FFD700' },
            { id: 2, x: 200, y: 60, color: '#FFD700' },
            { id: 3, x: 280, y: 120, color: '#FFD700' },
        ],
        nests: [
            { id: 1, x: 160, y: 300, color: '#8B4513', acceptsAll: true },
        ],
    },
    {
        id: 3,
        name: 'Color Match',
        description: 'Match chickens to their colored nests!',
        chickens: [
            { id: 1, x: 50, y: 100, color: '#FF6B6B' },  // Red
            { id: 2, x: 280, y: 100, color: '#4ECDC4' }, // Blue
        ],
        nests: [
            { id: 1, x: 80, y: 300, color: '#FF6B6B', acceptsAll: false },
            { id: 2, x: 240, y: 300, color: '#4ECDC4', acceptsAll: false },
        ],
    },
    {
        id: 4,
        name: 'Expert',
        description: 'Match 4 chickens to their nests!',
        chickens: [
            { id: 1, x: 50, y: 80, color: '#FF6B6B' },
            { id: 2, x: 150, y: 60, color: '#4ECDC4' },
            { id: 3, x: 250, y: 80, color: '#F7DC6F' },
            { id: 4, x: 300, y: 120, color: '#9B59B6' },
        ],
        nests: [
            { id: 1, x: 40, y: 300, color: '#FF6B6B', acceptsAll: false },
            { id: 2, x: 120, y: 300, color: '#4ECDC4', acceptsAll: false },
            { id: 3, x: 200, y: 300, color: '#F7DC6F', acceptsAll: false },
            { id: 4, x: 280, y: 300, color: '#9B59B6', acceptsAll: false },
        ],
    },
];

const CHICKEN_SIZE = 50;
const NEST_SIZE = 60;

function ChickenNest() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [currentLevel, setCurrentLevel] = useState(null);
    const [chickens, setChickens] = useState([]);
    const [nests, setNests] = useState([]);
    const [draggedChicken, setDraggedChicken] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [nestedChickens, setNestedChickens] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        startSession('chickennest');
        return () => endSession();
    }, []);

    // Start a level
    const startLevel = useCallback((levelId) => {
        const level = levels.find(l => l.id === levelId);
        setCurrentLevel(level);
        setChickens(level.chickens.map(c => ({ ...c })));
        setNests(level.nests.map(n => ({ ...n })));
        setNestedChickens([]);
        setIsComplete(false);
        speak(level.description);
    }, [speak]);

    // Draw the game
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grass background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');  // Sky
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.4, '#228B22'); // Grass
        gradient.addColorStop(1, '#1a5c1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw nests
        nests.forEach(nest => {
            // Nest base
            ctx.beginPath();
            ctx.ellipse(nest.x + NEST_SIZE / 2, nest.y + NEST_SIZE - 10, NEST_SIZE / 2 + 5, 20, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#654321';
            ctx.fill();

            // Nest bowl
            ctx.beginPath();
            ctx.ellipse(nest.x + NEST_SIZE / 2, nest.y + NEST_SIZE / 2, NEST_SIZE / 2, NEST_SIZE / 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = nest.color === '#8B4513' ? '#D2691E' : nest.color;
            ctx.fill();
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Straw texture
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const startX = nest.x + 10 + i * 10;
                ctx.beginPath();
                ctx.moveTo(startX, nest.y + NEST_SIZE / 2);
                ctx.lineTo(startX + 5, nest.y + NEST_SIZE / 2 - 10);
                ctx.stroke();
            }
        });

        // Draw chickens
        chickens.forEach(chicken => {
            drawChicken(ctx, chicken.x, chicken.y, chicken.color, chicken === draggedChicken);
        });

        // Draw nested chickens (smaller, in nest)
        nestedChickens.forEach(({ chicken, nest }) => {
            drawChicken(ctx, nest.x + 15, nest.y + 10, chicken.color, false, 0.6);
        });

    }, [chickens, nests, nestedChickens, draggedChicken]);

    // Draw a chicken
    const drawChicken = (ctx, x, y, color, isDragged, scale = 1) => {
        const s = CHICKEN_SIZE * scale;

        ctx.save();
        if (isDragged) {
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
        }

        // Body
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s / 2 + 5, s / 2.5, s / 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 4, s / 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();

        // Beak
        ctx.beginPath();
        ctx.moveTo(x + s / 2 + s / 5, y + s / 4);
        ctx.lineTo(x + s / 2 + s / 3, y + s / 4 + 3);
        ctx.lineTo(x + s / 2 + s / 5, y + s / 4 + 6);
        ctx.closePath();
        ctx.fillStyle = '#FFA500';
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(x + s / 2 + 3, y + s / 4 - 3, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        // Comb
        ctx.beginPath();
        ctx.moveTo(x + s / 2 - 5, y + 5);
        ctx.lineTo(x + s / 2 - 2, y);
        ctx.lineTo(x + s / 2 + 2, y + 5);
        ctx.lineTo(x + s / 2 + 5, y);
        ctx.lineTo(x + s / 2 + 8, y + 5);
        ctx.fillStyle = '#FF0000';
        ctx.fill();

        // Feet
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(x + s / 3, y + s - 5);
        ctx.lineTo(x + s / 3, y + s + 5);
        ctx.moveTo(x + s / 3 - 5, y + s + 5);
        ctx.lineTo(x + s / 3 + 5, y + s + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + s * 2 / 3, y + s - 5);
        ctx.lineTo(x + s * 2 / 3, y + s + 5);
        ctx.moveTo(x + s * 2 / 3 - 5, y + s + 5);
        ctx.lineTo(x + s * 2 / 3 + 5, y + s + 5);
        ctx.stroke();

        ctx.restore();
    };

    // Redraw on state change
    useEffect(() => {
        if (currentLevel) {
            draw();
        }
    }, [currentLevel, draw]);

    // Get position from event
    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // Check if point is on chicken
    const getChickenAt = (x, y) => {
        return chickens.find(c =>
            x >= c.x && x <= c.x + CHICKEN_SIZE &&
            y >= c.y && y <= c.y + CHICKEN_SIZE
        );
    };

    // Check if chicken is in nest
    const checkNestCollision = (chicken) => {
        for (const nest of nests) {
            const nestCenterX = nest.x + NEST_SIZE / 2;
            const nestCenterY = nest.y + NEST_SIZE / 2;
            const chickenCenterX = chicken.x + CHICKEN_SIZE / 2;
            const chickenCenterY = chicken.y + CHICKEN_SIZE / 2;

            const distance = Math.sqrt(
                Math.pow(nestCenterX - chickenCenterX, 2) +
                Math.pow(nestCenterY - chickenCenterY, 2)
            );

            if (distance < NEST_SIZE / 2 + 10) {
                // Check color match
                if (nest.acceptsAll || nest.color === chicken.color) {
                    return nest;
                } else {
                    // Wrong nest
                    playSound('wrong');
                    speak('Try the matching color!');
                    return null;
                }
            }
        }
        return null;
    };

    // Mouse/touch handlers
    const handleStart = (e) => {
        e.preventDefault();
        const pos = getPos(e);
        const chicken = getChickenAt(pos.x, pos.y);

        if (chicken) {
            setDraggedChicken(chicken);
            setOffset({ x: pos.x - chicken.x, y: pos.y - chicken.y });
            playSound('click');
        }
    };

    const handleMove = (e) => {
        if (!draggedChicken) return;
        e.preventDefault();

        const pos = getPos(e);
        const canvas = canvasRef.current;

        setChickens(prev => prev.map(c =>
            c.id === draggedChicken.id
                ? {
                    ...c,
                    x: Math.max(0, Math.min(canvas.width - CHICKEN_SIZE, pos.x - offset.x)),
                    y: Math.max(0, Math.min(canvas.height - CHICKEN_SIZE, pos.y - offset.y))
                }
                : c
        ));
    };

    const handleEnd = () => {
        if (!draggedChicken) return;

        const chicken = chickens.find(c => c.id === draggedChicken.id);
        const nest = checkNestCollision(chicken);

        if (nest) {
            // Chicken found its nest!
            playSound('success');
            feedback('Good job!', 'correct');

            setChickens(prev => prev.filter(c => c.id !== chicken.id));
            setNestedChickens(prev => [...prev, { chicken, nest }]);
            setScore(s => s + 10);

            // Check level complete
            if (chickens.length === 1) {
                setTimeout(() => {
                    setIsComplete(true);
                    completeExercise('chickennest');
                    speak('All chickens are home!');
                }, 300);
            }
        }

        setDraggedChicken(null);
    };

    // Level selection
    if (!currentLevel) {
        return (
            <div className="chicken-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="chicken-title">🐔 Chicken Nest</h1>
                <p className="chicken-subtitle">Help the chickens find their nests!</p>

                <div className="level-selection">
                    {levels.map(level => (
                        <button
                            key={level.id}
                            className="level-card"
                            onClick={() => startLevel(level.id)}
                        >
                            <span className="level-number">Level {level.id}</span>
                            <span className="level-name">{level.name}</span>
                            <span className="level-chickens">
                                {'🐔'.repeat(level.chickens.length)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="chicken-page playing">
            <button className="back-btn" onClick={() => setCurrentLevel(null)}>← Back</button>

            <div className="chicken-hud">
                <span>Level {currentLevel.id}</span>
                <span>🐔 {chickens.length} left</span>
                <span>⭐ {score}</span>
            </div>

            <canvas
                ref={canvasRef}
                className="game-canvas"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />

            <p className="level-hint">{currentLevel.description}</p>

            {isComplete && (
                <CelebrationOverlay
                    message="All Home! 🐔"
                    subMessage={`Level ${currentLevel.id} complete! +${score} points`}
                    onPlayAgain={() => startLevel(currentLevel.id)}
                    onNewGame={() => {
                        const nextLevel = levels.find(l => l.id === currentLevel.id + 1);
                        if (nextLevel) {
                            startLevel(nextLevel.id);
                        } else {
                            setCurrentLevel(null);
                        }
                    }}
                    playAgainText="Replay"
                    newGameText={currentLevel.id < levels.length ? "Next Level" : "All Levels"}
                />
            )}
        </div>
    );
}

export default ChickenNest;
