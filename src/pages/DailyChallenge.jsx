import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useRewards } from '../contexts/RewardsContext';
import './DailyChallenge.css';

// Challenge types
const challengeTypes = [
    {
        id: 'click',
        name: 'Click Challenge',
        icon: '🖱️',
        description: 'Click the targets as fast as you can!',
        generate: () => {
            const count = 5 + Math.floor(Math.random() * 5);
            return { type: 'click', targetCount: count };
        },
    },
    {
        id: 'memory',
        name: 'Memory Challenge',
        icon: '🧠',
        description: 'Remember and repeat the pattern!',
        generate: () => {
            const length = 3 + Math.floor(Math.random() * 3);
            const pattern = [];
            for (let i = 0; i < length; i++) {
                pattern.push(Math.floor(Math.random() * 4));
            }
            return { type: 'memory', pattern };
        },
    },
    {
        id: 'math',
        name: 'Math Challenge',
        icon: '🔢',
        description: 'Solve the math problems!',
        generate: () => {
            const problems = [];
            for (let i = 0; i < 3; i++) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                problems.push({ a, b, answer: a + b });
            }
            return { type: 'math', problems };
        },
    },
];

function DailyChallenge() {
    const navigate = useNavigate();
    const { speak, playSound, feedback } = useAudio();
    const { addStars } = useRewards();

    // Get today's challenge based on date
    const todaysChallenge = useMemo(() => {
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const typeIndex = seed % challengeTypes.length;
        const type = challengeTypes[typeIndex];
        return {
            ...type,
            data: type.generate(),
            date: today,
        };
    }, []);

    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(() => {
        const saved = localStorage.getItem('daily-challenge-completed');
        return saved === todaysChallenge.date;
    });
    const [score, setScore] = useState(0);

    // Click challenge state
    const [targets, setTargets] = useState([]);
    const [clicksNeeded, setClicksNeeded] = useState(0);

    // Memory challenge state
    const [memoryPhase, setMemoryPhase] = useState('show'); // 'show' or 'input'
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [playerPattern, setPlayerPattern] = useState([]);

    // Math challenge state
    const [currentProblem, setCurrentProblem] = useState(0);
    const [mathAnswer, setMathAnswer] = useState('');

    const startChallenge = () => {
        setStarted(true);
        speak(`Today's challenge: ${todaysChallenge.description}`);

        if (todaysChallenge.data.type === 'click') {
            setClicksNeeded(todaysChallenge.data.targetCount);
            spawnTarget();
        } else if (todaysChallenge.data.type === 'memory') {
            showPattern();
        }
    };

    // Click challenge
    const spawnTarget = () => {
        const x = 10 + Math.random() * 70;
        const y = 20 + Math.random() * 50;
        setTargets([{ id: Date.now(), x, y }]);
    };

    const handleTargetClick = (id) => {
        playSound('click');
        setTargets([]);
        setScore(s => s + 1);
        setClicksNeeded(c => {
            if (c <= 1) {
                completeChallenge();
                return 0;
            }
            setTimeout(spawnTarget, 300);
            return c - 1;
        });
    };

    // Memory challenge
    const showPattern = async () => {
        setMemoryPhase('show');
        const pattern = todaysChallenge.data.pattern;
        for (let i = 0; i < pattern.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            setHighlightedIndex(pattern[i]);
            playSound('click');
            await new Promise(r => setTimeout(r, 400));
            setHighlightedIndex(-1);
        }
        await new Promise(r => setTimeout(r, 300));
        setMemoryPhase('input');
        setPlayerPattern([]);
    };

    const handleMemoryClick = (index) => {
        if (memoryPhase !== 'input') return;

        playSound('click');
        const newPattern = [...playerPattern, index];
        setPlayerPattern(newPattern);

        const correctPattern = todaysChallenge.data.pattern;

        // Check if wrong
        if (newPattern[newPattern.length - 1] !== correctPattern[newPattern.length - 1]) {
            playSound('wrong');
            speak('Try again!');
            setPlayerPattern([]);
            setTimeout(showPattern, 1000);
            return;
        }

        // Check if complete
        if (newPattern.length === correctPattern.length) {
            setScore(correctPattern.length);
            completeChallenge();
        }
    };

    // Math challenge
    const handleMathSubmit = (e) => {
        e.preventDefault();
        const problem = todaysChallenge.data.problems[currentProblem];

        if (parseInt(mathAnswer) === problem.answer) {
            playSound('success');
            setScore(s => s + 1);
            setMathAnswer('');

            if (currentProblem >= todaysChallenge.data.problems.length - 1) {
                completeChallenge();
            } else {
                setCurrentProblem(p => p + 1);
            }
        } else {
            playSound('wrong');
            speak('Try again!');
        }
    };

    const completeChallenge = () => {
        setCompleted(true);
        localStorage.setItem('daily-challenge-completed', todaysChallenge.date);
        feedback('Challenge complete! +10 stars!', 'celebration');
        addStars(10);
    };

    // Not started yet
    if (!started) {
        return (
            <div className="daily-page">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

                <h1 className="daily-title">🌟 Daily Challenge</h1>

                <div className="challenge-preview">
                    <span className="challenge-icon">{todaysChallenge.icon}</span>
                    <h2>{todaysChallenge.name}</h2>
                    <p>{todaysChallenge.description}</p>

                    {completed ? (
                        <div className="already-done">
                            <span>✅ Completed Today!</span>
                            <p>Come back tomorrow for a new challenge!</p>
                        </div>
                    ) : (
                        <button className="btn btn-success" onClick={startChallenge}>
                            Start Challenge
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Challenge in progress
    return (
        <div className="daily-page playing">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <div className="challenge-hud">
                <span>Score: {score}</span>
            </div>

            {/* Click Challenge */}
            {todaysChallenge.data.type === 'click' && (
                <div className="click-area">
                    <p>Clicks left: {clicksNeeded}</p>
                    {targets.map(t => (
                        <button
                            key={t.id}
                            className="click-target animate-pop"
                            style={{ left: `${t.x}%`, top: `${t.y}%` }}
                            onClick={() => handleTargetClick(t.id)}
                        >
                            🎯
                        </button>
                    ))}
                </div>
            )}

            {/* Memory Challenge */}
            {todaysChallenge.data.type === 'memory' && (
                <div className="memory-area">
                    <p>{memoryPhase === 'show' ? 'Watch the pattern...' : 'Repeat the pattern!'}</p>
                    <div className="memory-grid">
                        {[0, 1, 2, 3].map(i => (
                            <button
                                key={i}
                                className={`memory-tile ${highlightedIndex === i ? 'active' : ''}`}
                                onClick={() => handleMemoryClick(i)}
                                disabled={memoryPhase === 'show'}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Math Challenge */}
            {todaysChallenge.data.type === 'math' && (
                <div className="math-area">
                    <p>Problem {currentProblem + 1} of {todaysChallenge.data.problems.length}</p>
                    <div className="math-problem">
                        {todaysChallenge.data.problems[currentProblem]?.a} + {todaysChallenge.data.problems[currentProblem]?.b} = ?
                    </div>
                    <form onSubmit={handleMathSubmit}>
                        <input
                            type="number"
                            value={mathAnswer}
                            onChange={(e) => setMathAnswer(e.target.value)}
                            autoFocus
                            className="math-input"
                        />
                        <button type="submit" className="btn btn-success">Check</button>
                    </form>
                </div>
            )}

            {completed && (
                <div className="challenge-complete">
                    <h2>🎉 Complete!</h2>
                    <p>+10 Stars earned!</p>
                    <button className="btn" onClick={() => navigate('/')}>Back Home</button>
                </div>
            )}
        </div>
    );
}

export default DailyChallenge;
