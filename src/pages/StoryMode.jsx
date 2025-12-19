import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './StoryMode.css';

// Interactive stories
const stories = [
    {
        id: 'farm',
        title: 'A Day at the Farm',
        emoji: '🐔',
        pages: [
            { text: 'Once upon a time, there was a happy farm.', emoji: '🏡', action: null },
            { text: 'Click on the chicken to feed it!', emoji: '🐔', action: 'click', target: 'chicken' },
            { text: 'The chicken said "Cluck cluck!" and laid an egg!', emoji: '🥚', action: null },
            { text: 'Click on the cow to say hello!', emoji: '🐄', action: 'click', target: 'cow' },
            { text: 'The cow said "Mooo!" and gave us milk!', emoji: '🥛', action: null },
            { text: 'Click on the pig to play!', emoji: '🐷', action: 'click', target: 'pig' },
            { text: 'The pig rolled in the mud happily! Oink oink!', emoji: '💦', action: null },
            { text: 'What a wonderful day at the farm! The End.', emoji: '🌈', action: null },
        ],
    },
    {
        id: 'space',
        title: 'Journey to Space',
        emoji: '🚀',
        pages: [
            { text: 'Let\'s go on a space adventure!', emoji: '🚀', action: null },
            { text: 'Click the rocket to blast off!', emoji: '🚀', action: 'click', target: 'rocket' },
            { text: '3... 2... 1... Blast off! We\'re in space!', emoji: '✨', action: null },
            { text: 'Look! Click the moon to visit it!', emoji: '🌙', action: 'click', target: 'moon' },
            { text: 'Wow! The moon is so beautiful!', emoji: '🌟', action: null },
            { text: 'Click the star to make a wish!', emoji: '⭐', action: 'click', target: 'star' },
            { text: 'Your wish will come true!', emoji: '💫', action: null },
            { text: 'Time to go home. What an amazing adventure!', emoji: '🌍', action: null },
        ],
    },
    {
        id: 'ocean',
        title: 'Under the Sea',
        emoji: '🐠',
        pages: [
            { text: 'Let\'s explore the ocean!', emoji: '🌊', action: null },
            { text: 'Click the fish to say hi!', emoji: '🐟', action: 'click', target: 'fish' },
            { text: 'The fish swims in a circle!', emoji: '🔵', action: null },
            { text: 'Click the octopus to wave!', emoji: '🐙', action: 'click', target: 'octopus' },
            { text: 'The octopus waves all 8 arms!', emoji: '👋', action: null },
            { text: 'Click the turtle to race!', emoji: '🐢', action: 'click', target: 'turtle' },
            { text: 'The turtle wins! Slow and steady!', emoji: '🏆', action: null },
            { text: 'The ocean is amazing! The End.', emoji: '🐚', action: null },
        ],
    },
];

function StoryMode() {
    const navigate = useNavigate();
    const { speak, playSound } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [selectedStory, setSelectedStory] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [waitingForAction, setWaitingForAction] = useState(false);

    useEffect(() => {
        startSession('story');
        return () => endSession();
    }, []);

    const startStory = (story) => {
        setSelectedStory(story);
        setCurrentPage(0);
        speak(story.pages[0].text);
    };

    const handleClick = () => {
        if (!selectedStory) return;

        const page = selectedStory.pages[currentPage];

        if (page.action === 'click' && !waitingForAction) {
            setWaitingForAction(true);
            return;
        }

        if (waitingForAction) {
            playSound('click');
            setWaitingForAction(false);
        }

        if (currentPage < selectedStory.pages.length - 1) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            speak(selectedStory.pages[nextPage].text);

            if (selectedStory.pages[nextPage].action === 'click') {
                setWaitingForAction(false);
            }
        } else {
            // Story complete
            completeExercise('story');
            playSound('celebration');
            speak('Great job! You finished the story!');
        }
    };

    // Story selection
    if (!selectedStory) {
        return (
            <div className="story-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1 className="story-title">📖 Story Time</h1>
                <p className="story-subtitle">Choose a story:</p>

                <div className="story-selection">
                    {stories.map(story => (
                        <button
                            key={story.id}
                            className="story-card"
                            onClick={() => startStory(story)}
                        >
                            <span className="story-emoji">{story.emoji}</span>
                            <span className="story-name">{story.title}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const page = selectedStory.pages[currentPage];
    const isLastPage = currentPage === selectedStory.pages.length - 1;

    return (
        <div className="story-page reading" onClick={handleClick}>
            <button className="back-btn" onClick={(e) => { e.stopPropagation(); setSelectedStory(null); }}>
                ← Back
            </button>

            <div className="story-progress">
                {currentPage + 1} / {selectedStory.pages.length}
            </div>

            <div className="story-content animate-fadeIn">
                <span className={`page-emoji ${waitingForAction ? 'pulsing' : ''}`}>
                    {page.emoji}
                </span>
                <p className="page-text">{page.text}</p>

                {waitingForAction && (
                    <p className="click-hint animate-bounce">👆 Click!</p>
                )}

                {!waitingForAction && !isLastPage && (
                    <p className="next-hint">Click anywhere to continue...</p>
                )}

                {isLastPage && (
                    <div className="story-complete">
                        <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); startStory(selectedStory); }}>
                            Read Again
                        </button>
                        <button className="btn" onClick={(e) => { e.stopPropagation(); setSelectedStory(null); }}>
                            Pick New Story
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StoryMode;
