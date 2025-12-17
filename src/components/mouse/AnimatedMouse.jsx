import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './AnimatedMouse.css';

/**
 * Large animated mouse that mirrors real mouse actions
 * - Tilts and moves based on mouse movement direction
 * - Left click shows green feedback
 * - Right click shows blue feedback
 * - Scroll animates the wheel
 */
function AnimatedMouse({ x, y, leftClick, rightClick, isScrolling, scrollDelta, difficulty = 'easy' }) {
    const { t } = useTranslation();
    const [wheelRotation, setWheelRotation] = useState(0);
    const [showLeftFeedback, setShowLeftFeedback] = useState(false);
    const [showRightFeedback, setShowRightFeedback] = useState(false);

    // Movement tracking for tilt effect
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const moveTimeout = useRef(null);

    // Track mouse movement and calculate tilt
    useEffect(() => {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;

        // Calculate movement velocity
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 2) {
            setIsMoving(true);

            // Tilt the mouse based on movement direction (max 15 degrees)
            const tiltX = Math.max(-15, Math.min(15, dx * 0.5));
            const tiltY = Math.max(-15, Math.min(15, dy * 0.3));
            setTilt({ x: tiltX, y: tiltY });

            // Move the mouse slightly in movement direction (max 30px)
            const offsetX = Math.max(-30, Math.min(30, dx * 0.8));
            const offsetY = Math.max(-30, Math.min(30, dy * 0.8));
            setOffset({ x: offsetX, y: offsetY });

            // Clear previous timeout
            if (moveTimeout.current) {
                clearTimeout(moveTimeout.current);
            }

            // Reset tilt after movement stops
            moveTimeout.current = setTimeout(() => {
                setTilt({ x: 0, y: 0 });
                setOffset({ x: 0, y: 0 });
                setIsMoving(false);
            }, 150);
        }

        lastPos.current = { x, y };
    }, [x, y]);

    // Animate wheel on scroll
    useEffect(() => {
        if (isScrolling) {
            setWheelRotation(prev => prev + (scrollDelta > 0 ? 30 : -30));
        }
    }, [isScrolling, scrollDelta]);

    // Show feedback for left click
    useEffect(() => {
        if (leftClick) {
            setShowLeftFeedback(true);
        } else {
            const timer = setTimeout(() => setShowLeftFeedback(false), 150);
            return () => clearTimeout(timer);
        }
    }, [leftClick]);

    // Show feedback for right click
    useEffect(() => {
        if (rightClick) {
            setShowRightFeedback(true);
        } else {
            const timer = setTimeout(() => setShowRightFeedback(false), 150);
            return () => clearTimeout(timer);
        }
    }, [rightClick]);

    // Calculate transform for tilt and offset
    const mouseTransform = `
        translateX(${offset.x}px) 
        translateY(${offset.y}px) 
        rotateY(${tilt.x}deg) 
        rotateX(${-tilt.y}deg)
    `;

    return (
        <>
            {/* The animated mouse with movement-based tilt */}
            <div className="animated-mouse-container">
                <div
                    className={`animated-mouse ${isMoving ? 'moving' : ''}`}
                    style={{ transform: mouseTransform }}
                >
                    {/* Mouse body */}
                    <svg viewBox="0 0 200 320" className="mouse-svg">
                        {/* Mouse body outline */}
                        <path
                            className="mouse-body"
                            d="M100 10 C150 10 180 50 180 100 L180 260 C180 290 150 310 100 310 C50 310 20 290 20 260 L20 100 C20 50 50 10 100 10 Z"
                            fill="#E5E7EB"
                            stroke="#9CA3AF"
                            strokeWidth="4"
                        />

                        {/* Left button */}
                        <path
                            className={`mouse-button left-button ${showLeftFeedback ? 'active' : ''}`}
                            d="M100 20 C65 20 35 45 35 85 L35 140 L100 140 L100 20 Z"
                            fill={showLeftFeedback ? '#22C55E' : '#F9FAFB'}
                            stroke="#D1D5DB"
                            strokeWidth="2"
                        />

                        {/* Right button */}
                        <path
                            className={`mouse-button right-button ${showRightFeedback ? 'active' : ''}`}
                            d="M100 20 L100 140 L165 140 L165 85 C165 45 135 20 100 20 Z"
                            fill={showRightFeedback ? '#3B82F6' : '#F9FAFB'}
                            stroke="#D1D5DB"
                            strokeWidth="2"
                        />

                        {/* Divider line between buttons */}
                        <line
                            x1="100" y1="20"
                            x2="100" y2="140"
                            stroke="#D1D5DB"
                            strokeWidth="2"
                        />

                        {/* Scroll wheel */}
                        <g
                            className="scroll-wheel-group"
                            style={{ transform: `rotate(${wheelRotation}deg)`, transformOrigin: '100px 90px' }}
                        >
                            <rect
                                className={`scroll-wheel ${isScrolling ? 'scrolling' : ''}`}
                                x="85" y="50"
                                width="30" height="80"
                                rx="15"
                                fill={isScrolling ? '#F59E0B' : '#6B7280'}
                            />
                            {/* Wheel lines for visual rotation */}
                            <line x1="100" y1="55" x2="100" y2="65" stroke="#9CA3AF" strokeWidth="2" />
                            <line x1="100" y1="85" x2="100" y2="95" stroke="#9CA3AF" strokeWidth="2" />
                            <line x1="100" y1="115" x2="100" y2="125" stroke="#9CA3AF" strokeWidth="2" />
                        </g>

                        {/* Cord (optional decorative) */}
                        <path
                            className="mouse-cord"
                            d="M100 310 Q100 340 80 360 Q60 380 60 400"
                            fill="none"
                            stroke="#9CA3AF"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Movement direction indicator */}
                {isMoving && (
                    <div className="movement-indicator animate-pop">
                        {t('feedback.goodMoving')} 🎯
                    </div>
                )}

                {/* Action feedback text */}
                {showLeftFeedback && (
                    <div className="click-feedback left animate-pop">
                        {t('feedback.youClicked')} 👆
                    </div>
                )}
                {showRightFeedback && (
                    <div className="click-feedback right animate-pop">
                        {t('mouse.instructions.rightClick')} 👆
                    </div>
                )}
                {isScrolling && (
                    <div className="click-feedback scroll animate-pop">
                        {t('feedback.niceScroll')} 🎡
                    </div>
                )}
            </div>

            {/* Cursor replacement */}
            <div
                className={`custom-cursor cursor-${difficulty}`}
                style={{ left: x, top: y }}
            >
                <span className="cursor-dot"></span>
                <span className="cursor-ring"></span>
            </div>
        </>
    );
}

export default AnimatedMouse;

