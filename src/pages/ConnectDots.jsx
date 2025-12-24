import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import CelebrationOverlay from '../components/common/CelebrationOverlay';
import './ConnectDots.css';

// Dot patterns that form shapes
const patterns = {
    star: {
        name: 'Star',
        emoji: '⭐',
        dots: [
            { x: 50, y: 10 },  // 1 - top
            { x: 62, y: 40 },  // 2
            { x: 95, y: 40 },  // 3
            { x: 70, y: 60 },  // 4
            { x: 80, y: 95 },  // 5
            { x: 50, y: 75 },  // 6
            { x: 20, y: 95 },  // 7
            { x: 30, y: 60 },  // 8
            { x: 5, y: 40 },   // 9
            { x: 38, y: 40 },  // 10
        ],
    },
    heart: {
        name: 'Heart',
        emoji: '❤️',
        dots: [
            { x: 50, y: 25 },  // 1
            { x: 65, y: 15 },  // 2
            { x: 80, y: 20 },  // 3
            { x: 90, y: 35 },  // 4
            { x: 85, y: 55 },  // 5
            { x: 50, y: 90 },  // 6
            { x: 15, y: 55 },  // 7
            { x: 10, y: 35 },  // 8
            { x: 20, y: 20 },  // 9
            { x: 35, y: 15 },  // 10
        ],
    },
    house: {
        name: 'House',
        emoji: '🏠',
        dots: [
            { x: 50, y: 10 },  // 1 - roof top
            { x: 85, y: 40 },  // 2 - roof right
            { x: 85, y: 90 },  // 3 - bottom right
            { x: 60, y: 90 },  // 4 - door right
            { x: 60, y: 60 },  // 5 - door top
            { x: 40, y: 60 },  // 6 - door left
            { x: 40, y: 90 },  // 7 - door right
            { x: 15, y: 90 },  // 8 - bottom left
            { x: 15, y: 40 },  // 9 - roof left
        ],
    },
    triangle: {
        name: 'Triangle',
        emoji: '🔺',
        dots: [
            { x: 50, y: 15 },  // 1 - top
            { x: 85, y: 85 },  // 2 - right
            { x: 15, y: 85 },  // 3 - left
        ],
    },
};

function ConnectDots() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [patternId, setPatternId] = useState(null);
    const [currentDot, setCurrentDot] = useState(0);
    const [connectedLines, setConnectedLines] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        startSession('connectdots');
        return () => endSession();
    }, []);

    const startPattern = (id) => {
        setPatternId(id);
        setCurrentDot(0);
        setConnectedLines([]);
        setIsComplete(false);
        speak(`Connect the dots to make a ${patterns[id].name}!`);
    };

    const handleDotClick = (dotIndex) => {
        if (dotIndex !== currentDot) {
            speak('Click the next number!');
            return;
        }

        const pattern = patterns[patternId];

        // Add line from previous dot
        if (currentDot > 0) {
            setConnectedLines(prev => [
                ...prev,
                {
                    from: pattern.dots[currentDot - 1],
                    to: pattern.dots[currentDot],
                },
            ]);
        }

        playSound('click');
        speak(String(dotIndex + 1));

        // Check completion
        if (currentDot === pattern.dots.length - 1) {
            // Connect last dot to first
            setConnectedLines(prev => [
                ...prev,
                {
                    from: pattern.dots[currentDot],
                    to: pattern.dots[0],
                },
            ]);
            setIsComplete(true);
            completeExercise('connectdots');
            setTimeout(() => {
                feedback('Amazing!', 'celebration');
                speak(`You made a ${pattern.name}!`);
            }, 500);
        } else {
            setCurrentDot(prev => prev + 1);
        }
    };

    // Pattern selection
    if (!patternId) {
        return (
            <div className="connectdots-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="connectdots-title">✨ Connect the Dots</h1>
                <p className="connectdots-subtitle">Pick a shape to draw:</p>
                <div className="pattern-selection">
                    {Object.entries(patterns).map(([key, pattern]) => (
                        <button
                            key={key}
                            className="pattern-option"
                            onClick={() => startPattern(key)}
                        >
                            <span className="pattern-preview">{pattern.emoji}</span>
                            <span className="pattern-name">{pattern.name}</span>
                            <span className="pattern-dots">{pattern.dots.length} dots</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const pattern = patterns[patternId];

    return (
        <div className="connectdots-page playing">
            <button className="back-btn" onClick={() => setPatternId(null)}>← Back</button>

            <h2 className="pattern-title">
                {isComplete ? `${pattern.emoji} ${pattern.name}!` : `Click dot ${currentDot + 1}`}
            </h2>

            <div className="canvas-container">
                <svg viewBox="0 0 100 100" className="dots-canvas">
                    {/* Connected lines */}
                    {connectedLines.map((line, i) => (
                        <line
                            key={i}
                            x1={line.from.x}
                            y1={line.from.y}
                            x2={line.to.x}
                            y2={line.to.y}
                            stroke="#4ECDC4"
                            strokeWidth="2"
                            className="connected-line"
                        />
                    ))}

                    {/* Dots */}
                    {pattern.dots.map((dot, i) => {
                        const isConnected = i < currentDot || isComplete;
                        const isNext = i === currentDot && !isComplete;

                        return (
                            <g key={i} onClick={() => handleDotClick(i)}>
                                <circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={isNext ? 6 : 4}
                                    className={`dot ${isConnected ? 'connected' : ''} ${isNext ? 'next' : ''}`}
                                />
                                {!isComplete && (
                                    <text
                                        x={dot.x}
                                        y={dot.y - 8}
                                        className="dot-number"
                                        textAnchor="middle"
                                    >
                                        {i + 1}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {isComplete && (
                <CelebrationOverlay
                    message={`${pattern.emoji} ${pattern.name}!`}
                    subMessage="You connected all the dots!"
                    onPlayAgain={() => startPattern(patternId)}
                    onNewGame={() => setPatternId(null)}
                    playAgainText="Again"
                    newGameText="New Shape"
                />
            )}
        </div>
    );
}

export default ConnectDots;
