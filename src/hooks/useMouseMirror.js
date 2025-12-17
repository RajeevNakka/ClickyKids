import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for tracking mouse position, clicks, and scroll
 * Used for the animated mouse mirroring feature
 */
export function useMouseMirror() {
    const [mouseState, setMouseState] = useState({
        x: 0,
        y: 0,
        leftClick: false,
        rightClick: false,
        scrollDelta: 0,
        isScrolling: false,
        lastMove: Date.now()
    });

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMouseState(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
                lastMove: Date.now()
            }));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Track mouse down/up for click visualization
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (e.button === 0) {
                setMouseState(prev => ({ ...prev, leftClick: true }));
            } else if (e.button === 2) {
                setMouseState(prev => ({ ...prev, rightClick: true }));
            }
        };

        const handleMouseUp = (e) => {
            if (e.button === 0) {
                setMouseState(prev => ({ ...prev, leftClick: false }));
            } else if (e.button === 2) {
                setMouseState(prev => ({ ...prev, rightClick: false }));
            }
        };

        // Prevent context menu on right click in learning mode
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Track scroll wheel
    useEffect(() => {
        let scrollTimeout;

        const handleScroll = (e) => {
            setMouseState(prev => ({
                ...prev,
                scrollDelta: e.deltaY,
                isScrolling: true
            }));

            // Clear scrolling state after 200ms
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setMouseState(prev => ({
                    ...prev,
                    isScrolling: false,
                    scrollDelta: 0
                }));
            }, 200);
        };

        window.addEventListener('wheel', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('wheel', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return mouseState;
}

/**
 * Hook for tracking if user is actively moving the mouse
 */
export function useMouseActivity(idleThreshold = 2000) {
    const [isActive, setIsActive] = useState(false);
    const { lastMove } = useMouseMirror();

    useEffect(() => {
        const checkActivity = () => {
            const now = Date.now();
            setIsActive(now - lastMove < idleThreshold);
        };

        const interval = setInterval(checkActivity, 100);
        return () => clearInterval(interval);
    }, [lastMove, idleThreshold]);

    return isActive;
}

/**
 * Hook for detecting mouse entry into a target area
 */
export function useMouseTarget(targetRef, onEnter, onLeave) {
    const [isInside, setIsInside] = useState(false);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const handleEnter = () => {
            setIsInside(true);
            onEnter?.();
        };

        const handleLeave = () => {
            setIsInside(false);
            onLeave?.();
        };

        target.addEventListener('mouseenter', handleEnter);
        target.addEventListener('mouseleave', handleLeave);

        return () => {
            target.removeEventListener('mouseenter', handleEnter);
            target.removeEventListener('mouseleave', handleLeave);
        };
    }, [targetRef, onEnter, onLeave]);

    return isInside;
}

export default useMouseMirror;
