import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './ColorClick.css';

// Color palettes and pictures
const pictures = {
    butterfly: {
        name: 'Butterfly',
        preview: '🦋',
        regions: [
            { id: 1, name: 'left wing', path: 'M50,100 Q20,60 50,30 Q50,60 50,100', targetColor: '#FF6B6B' },
            { id: 2, name: 'right wing', path: 'M50,100 Q80,60 50,30 Q50,60 50,100', targetColor: '#4ECDC4' },
            { id: 3, name: 'body', path: 'M48,30 L52,30 L52,110 L48,110 Z', targetColor: '#2C3E50' },
            { id: 4, name: 'head', path: 'M50,25 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0', targetColor: '#2C3E50' },
        ],
    },
    flower: {
        name: 'Flower',
        preview: '🌸',
        regions: [
            { id: 1, name: 'petal 1', path: 'M50,50 Q30,20 50,10 Q70,20 50,50', targetColor: '#FF6B6B' },
            { id: 2, name: 'petal 2', path: 'M50,50 Q80,30 90,50 Q80,70 50,50', targetColor: '#FF6B6B' },
            { id: 3, name: 'petal 3', path: 'M50,50 Q70,80 50,90 Q30,80 50,50', targetColor: '#FF6B6B' },
            { id: 4, name: 'petal 4', path: 'M50,50 Q20,70 10,50 Q20,30 50,50', targetColor: '#FF6B6B' },
            { id: 5, name: 'center', path: 'M50,50 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0', targetColor: '#F7DC6F' },
        ],
    },
    house: {
        name: 'House',
        preview: '🏠',
        regions: [
            { id: 1, name: 'roof', path: 'M50,10 L90,50 L10,50 Z', targetColor: '#E74C3C' },
            { id: 2, name: 'wall', path: 'M15,50 L85,50 L85,90 L15,90 Z', targetColor: '#F5B041' },
            { id: 3, name: 'door', path: 'M40,60 L60,60 L60,90 L40,90 Z', targetColor: '#8B4513' },
            { id: 4, name: 'window', path: 'M65,60 L80,60 L80,75 L65,75 Z', targetColor: '#87CEEB' },
        ],
    },
};

const colorPalette = [
    { id: 'red', color: '#FF6B6B', name: 'Red' },
    { id: 'blue', color: '#4ECDC4', name: 'Blue' },
    { id: 'yellow', color: '#F7DC6F', name: 'Yellow' },
    { id: 'green', color: '#2ECC71', name: 'Green' },
    { id: 'orange', color: '#F5B041', name: 'Orange' },
    { id: 'purple', color: '#9B59B6', name: 'Purple' },
    { id: 'brown', color: '#8B4513', name: 'Brown' },
    { id: 'skyblue', color: '#87CEEB', name: 'Sky Blue' },
    { id: 'dark', color: '#2C3E50', name: 'Dark' },
];

function ColorClick() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [pictureId, setPictureId] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [filledColors, setFilledColors] = useState({});
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        startSession('colorclick');
        return () => endSession();
    }, []);

    const startPicture = (id) => {
        setPictureId(id);
        setFilledColors({});
        setSelectedColor(null);
        setIsComplete(false);
        speak(`Let's color the ${pictures[id].name}!`);
    };

    const handleRegionClick = (regionId) => {
        if (!selectedColor) {
            speak('Pick a color first!');
            return;
        }

        setFilledColors(prev => ({
            ...prev,
            [regionId]: selectedColor,
        }));
        playSound('click');

        // Check completion
        const picture = pictures[pictureId];
        const newFilled = { ...filledColors, [regionId]: selectedColor };
        if (Object.keys(newFilled).length === picture.regions.length) {
            setIsComplete(true);
            completeExercise('colorclick');
            setTimeout(() => {
                feedback('Beautiful!', 'celebration');
                speak('Beautiful! You finished coloring!');
            }, 500);
        }
    };

    // Picture selection
    if (!pictureId) {
        return (
            <div className="colorclick-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="colorclick-title">🎨 Color by Click</h1>
                <p className="colorclick-subtitle">Pick a picture to color:</p>
                <div className="picture-selection">
                    {Object.entries(pictures).map(([key, pic]) => (
                        <button
                            key={key}
                            className="picture-option"
                            onClick={() => startPicture(key)}
                        >
                            <span className="picture-preview">{pic.preview}</span>
                            <span className="picture-name">{pic.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const picture = pictures[pictureId];

    return (
        <div className="colorclick-page playing">
            <button className="back-btn" onClick={() => setPictureId(null)}>← Back</button>

            <h2 className="picture-title">Color the {picture.name}!</h2>

            {/* Color Palette */}
            <div className="color-palette">
                {colorPalette.map(c => (
                    <button
                        key={c.id}
                        className={`color-btn ${selectedColor === c.color ? 'selected' : ''}`}
                        style={{ backgroundColor: c.color }}
                        onClick={() => {
                            setSelectedColor(c.color);
                            speak(c.name);
                        }}
                        title={c.name}
                    />
                ))}
            </div>

            {/* Canvas */}
            <div className="canvas-container">
                <svg viewBox="0 0 100 100" className="coloring-canvas">
                    {picture.regions.map(region => (
                        <path
                            key={region.id}
                            d={region.path}
                            fill={filledColors[region.id] || '#E5E5E5'}
                            stroke="#333"
                            strokeWidth="1"
                            className="color-region"
                            onClick={() => handleRegionClick(region.id)}
                        />
                    ))}
                </svg>
            </div>

            {/* Reset button */}
            {!isComplete && (
                <button className="btn reset-btn" onClick={() => setFilledColors({})}>
                    🔄 Reset
                </button>
            )}

            {/* Completion Banner - at bottom, doesn't cover the art */}
            {isComplete && (
                <div className="complete-banner animate-slideUp">
                    <span className="complete-emoji">🎨</span>
                    <div className="complete-text">
                        <strong>Beautiful!</strong>
                        <span>You colored the {picture.name}!</span>
                    </div>
                    <div className="complete-buttons">
                        <button className="btn btn-success btn-small" onClick={() => startPicture(pictureId)}>
                            Again
                        </button>
                        <button className="btn btn-small" onClick={() => setPictureId(null)}>
                            New
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColorClick;
