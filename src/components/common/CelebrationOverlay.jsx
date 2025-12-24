import React, { useEffect, useState } from 'react';
import './CelebrationOverlay.css';

// Generate confetti particles
const generateConfetti = (count = 50) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#F7DC6F', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71', '#F39C12'];
    const shapes = ['🎊', '🎉', '⭐', '🌟', '✨', '🎈', '🎀', '💫'];

    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: 1 + Math.random() * 1.5,
        rotation: Math.random() * 360,
    }));
};

function CelebrationOverlay({
    message = 'Great Job!',
    subMessage = '',
    onPlayAgain,
    onNewGame,
    playAgainText = 'Play Again',
    newGameText = 'New Game',
    showButtons = true,
    autoHide = false,
    autoHideDelay = 3000,
}) {
    const [confetti] = useState(() => generateConfetti(60));
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (autoHide) {
            const timer = setTimeout(() => setVisible(false), autoHideDelay);
            return () => clearTimeout(timer);
        }
    }, [autoHide, autoHideDelay]);

    if (!visible) return null;

    return (
        <div className="celebration-overlay">
            {/* Confetti */}
            <div className="confetti-container">
                {confetti.map(c => (
                    <span
                        key={c.id}
                        className="confetti-piece"
                        style={{
                            left: `${c.left}%`,
                            animationDelay: `${c.delay}s`,
                            animationDuration: `${c.duration}s`,
                            fontSize: `${c.size}rem`,
                            transform: `rotate(${c.rotation}deg)`,
                        }}
                    >
                        {c.shape}
                    </span>
                ))}
            </div>

            {/* Message */}
            <div className="celebration-content">
                <h1 className="celebration-message animate-pop">{message}</h1>
                {subMessage && <p className="celebration-sub">{subMessage}</p>}

                {showButtons && (
                    <div className="celebration-buttons">
                        {onPlayAgain && (
                            <button className="btn btn-success" onClick={onPlayAgain}>
                                {playAgainText}
                            </button>
                        )}
                        {onNewGame && (
                            <button className="btn" onClick={onNewGame}>
                                {newGameText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CelebrationOverlay;
