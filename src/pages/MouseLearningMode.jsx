import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMouseMirror } from '../hooks/useMouseMirror';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import { useProfile } from '../contexts/ProfileContext';
import AnimatedMouse from '../components/mouse/AnimatedMouse';
import './MouseLearningMode.css';

function MouseLearningMode() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const mouseState = useMouseMirror();
    const { speak, playSound, feedback } = useAudio();
    const { startSession, endSession, addTimeSpent } = useProgress();
    const { activeProfile } = useProfile();

    const difficulty = activeProfile?.difficulty || 'beginner';

    const [lastFeedback, setLastFeedback] = useState(null);
    const [showMenu, setShowMenu] = useState(true);

    // Start session when entering explore mode
    useEffect(() => {
        if (!showMenu) {
            startSession('mouseMovement');
        }
        return () => {
            if (!showMenu) {
                endSession();
            }
        };
    }, [showMenu, startSession, endSession]);

    // Speak welcome message
    useEffect(() => {
        speak(t('mouse.exploreDesc'));
    }, [speak, t]);

    // Audio feedback for mouse actions
    useEffect(() => {
        const now = Date.now();

        // Debounce feedback (don't repeat within 1.5 seconds)
        if (lastFeedback && now - lastFeedback < 1500) return;

        if (mouseState.leftClick) {
            feedback(t('feedback.youClicked'), 'click');
            setLastFeedback(now);
        } else if (mouseState.rightClick) {
            speak(t('mouse.instructions.rightClick'));
            playSound('click');
            setLastFeedback(now);
        } else if (mouseState.isScrolling) {
            speak(t('feedback.niceScroll'));
            setLastFeedback(now);
        }
    }, [mouseState.leftClick, mouseState.rightClick, mouseState.isScrolling, feedback, speak, playSound, lastFeedback, t]);

    // Handle movement feedback (less frequent)
    useEffect(() => {
        const interval = setInterval(() => {
            // Random chance to give movement encouragement
            if (Math.random() < 0.1) {
                const messages = [
                    t('feedback.goodMoving'),
                    t('feedback.great'),
                    t('feedback.keepGoing')
                ];
                const message = messages[Math.floor(Math.random() * messages.length)];
                speak(message);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [speak, t]);

    const handleStartExplore = () => {
        setShowMenu(false);
        speak(t('mouse.instructions.move'));
    };

    if (showMenu) {
        return (
            <div className="mouse-learning-page">
                <div className="mouse-menu animate-fadeIn">
                    <h1 className="page-title">🖱️ {t('mouse.title')}</h1>

                    <div className="menu-options">
                        <button
                            className="menu-card explore"
                            onClick={handleStartExplore}
                        >
                            <span className="menu-icon">🔍</span>
                            <span className="menu-title">{t('mouse.explore')}</span>
                            <span className="menu-desc">{t('mouse.exploreDesc')}</span>
                        </button>

                        <button
                            className="menu-card movement"
                            onClick={() => navigate('/mouse/games/movement')}
                        >
                            <span className="menu-icon">🦋</span>
                            <span className="menu-title">{t('mouse.movement')}</span>
                            <span className="menu-desc">{t('games.butterflyDesc')}</span>
                        </button>

                        <button
                            className="menu-card clicking"
                            onClick={() => navigate('/mouse/games/bubbles')}
                        >
                            <span className="menu-icon">🫧</span>
                            <span className="menu-title">{t('mouse.clicking')}</span>
                            <span className="menu-desc">{t('games.bubblePopDesc')}</span>
                        </button>

                        <button
                            className="menu-card dragdrop"
                            onClick={() => navigate('/mouse/games/shapes')}
                        >
                            <span className="menu-icon">🧩</span>
                            <span className="menu-title">{t('mouse.dragDrop')}</span>
                            <span className="menu-desc">{t('games.shapesDesc')}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mouse-explore-container">
            {/* Animated Mouse that mirrors real mouse */}
            <AnimatedMouse
                x={mouseState.x}
                y={mouseState.y}
                leftClick={mouseState.leftClick}
                rightClick={mouseState.rightClick}
                isScrolling={mouseState.isScrolling}
                scrollDelta={mouseState.scrollDelta}
                difficulty={difficulty === 'beginner' ? 'easy' : difficulty === 'intermediate' ? 'medium' : 'advanced'}
            />

            {/* Exit button */}
            <button
                className="exit-explore-btn"
                onClick={() => setShowMenu(true)}
            >
                ✕
            </button>

            {/* Instructions overlay */}
            <div className="explore-instructions">
                <p>{t('mouse.instructions.move')}</p>
            </div>

            {/* Fun background elements that appear on mouse movement */}
            <div className="sparkle-trail" style={{ left: mouseState.x, top: mouseState.y }} />
        </div>
    );
}

export default MouseLearningMode;
