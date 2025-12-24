import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import './GlobalCursor.css';

// Pages where custom cursor should be hidden (games with their own cursor/pointer)
const hiddenCursorPages = ['/catch', '/chickennest', '/bubbles'];

function GlobalCursor() {
    const { activeProfile } = useProfile();
    const location = useLocation();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    const difficulty = activeProfile?.difficulty || 'beginner';
    const cursorClass = difficulty === 'beginner' ? 'easy' : difficulty === 'intermediate' ? 'medium' : 'advanced';

    // Check if we should hide cursor on this page
    const shouldHide = hiddenCursorPages.some(page => location.pathname.startsWith(page));

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    // Don't show on hidden cursor pages or if not visible
    if (!isVisible || shouldHide) return null;

    return (
        <div
            className={`global-cursor cursor-${cursorClass}`}
            style={{ left: position.x, top: position.y }}
        >
            <span className="cursor-dot"></span>
            <span className="cursor-ring"></span>
        </div>
    );
}

export default GlobalCursor;

