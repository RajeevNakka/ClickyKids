import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../contexts/ProgressContext';
import './MusicKeyboard.css';

// Piano notes with frequencies
const notes = [
    { key: 'C', freq: 261.63, color: 'white' },
    { key: 'C#', freq: 277.18, color: 'black' },
    { key: 'D', freq: 293.66, color: 'white' },
    { key: 'D#', freq: 311.13, color: 'black' },
    { key: 'E', freq: 329.63, color: 'white' },
    { key: 'F', freq: 349.23, color: 'white' },
    { key: 'F#', freq: 369.99, color: 'black' },
    { key: 'G', freq: 392.00, color: 'white' },
    { key: 'G#', freq: 415.30, color: 'black' },
    { key: 'A', freq: 440.00, color: 'white' },
    { key: 'A#', freq: 466.16, color: 'black' },
    { key: 'B', freq: 493.88, color: 'white' },
];

// Simple songs to play
const songs = [
    {
        name: 'Mary Had a Little Lamb',
        emoji: '🐑',
        notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
    },
    {
        name: 'Twinkle Twinkle',
        emoji: '⭐',
        notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G'],
    },
    {
        name: 'Happy Birthday',
        emoji: '🎂',
        notes: ['C', 'C', 'D', 'C', 'F', 'E'],
    },
];

function MusicKeyboard() {
    const navigate = useNavigate();
    const { speak, playSound } = useAudio();
    const { startSession, endSession, completeExercise } = useProgress();

    const [mode, setMode] = useState('free'); // 'free' or 'song'
    const [currentSong, setCurrentSong] = useState(null);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
    const [pressedKey, setPressedKey] = useState(null);
    const [audioContext, setAudioContext] = useState(null);

    useEffect(() => {
        startSession('music');
        // Initialize audio context
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
        return () => {
            endSession();
            ctx.close();
        };
    }, []);

    const playNote = useCallback((freq, duration = 0.5) => {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }, [audioContext]);

    const handleKeyClick = (note) => {
        playNote(note.freq);
        setPressedKey(note.key);
        setTimeout(() => setPressedKey(null), 200);

        if (mode === 'song' && currentSong) {
            const expectedNote = currentSong.notes[currentNoteIndex];
            if (note.key === expectedNote) {
                if (currentNoteIndex === currentSong.notes.length - 1) {
                    // Song complete!
                    completeExercise('music');
                    setTimeout(() => {
                        speak('Great job! You played the song!');
                        setCurrentSong(null);
                        setCurrentNoteIndex(0);
                    }, 500);
                } else {
                    setCurrentNoteIndex(prev => prev + 1);
                }
            }
        }
    };

    const startSong = (song) => {
        setMode('song');
        setCurrentSong(song);
        setCurrentNoteIndex(0);
        speak(`Let's play ${song.name}! Follow the highlighted key.`);
    };

    const whiteKeys = notes.filter(n => n.color === 'white');
    const blackKeys = notes.filter(n => n.color === 'black');

    return (
        <div className="music-page">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h1 className="music-title">🎹 Musical Keyboard</h1>

            {/* Mode Switcher */}
            <div className="mode-tabs">
                <button
                    className={`tab ${mode === 'free' ? 'active' : ''}`}
                    onClick={() => { setMode('free'); setCurrentSong(null); }}
                >
                    🎵 Free Play
                </button>
                <button
                    className={`tab ${mode === 'song' ? 'active' : ''}`}
                    onClick={() => setMode('song')}
                >
                    📝 Learn Songs
                </button>
            </div>

            {/* Song Selection (only in song mode without active song) */}
            {mode === 'song' && !currentSong && (
                <div className="song-selection">
                    <p>Choose a song to learn:</p>
                    <div className="song-list">
                        {songs.map((song, i) => (
                            <button
                                key={i}
                                className="song-btn"
                                onClick={() => startSong(song)}
                            >
                                <span className="song-emoji">{song.emoji}</span>
                                <span>{song.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Song Progress */}
            {currentSong && (
                <div className="song-progress">
                    <span>{currentSong.emoji} {currentSong.name}</span>
                    <span>Note {currentNoteIndex + 1}/{currentSong.notes.length}</span>
                </div>
            )}

            {/* Piano */}
            <div className="piano">
                <div className="piano-keys">
                    {/* White keys */}
                    {whiteKeys.map((note, i) => {
                        const isHighlighted = currentSong && currentSong.notes[currentNoteIndex] === note.key;
                        return (
                            <button
                                key={note.key}
                                className={`white-key ${pressedKey === note.key ? 'pressed' : ''} ${isHighlighted ? 'highlight' : ''}`}
                                onClick={() => handleKeyClick(note)}
                            >
                                <span className="key-label">{note.key}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Black keys positioned absolutely */}
                <div className="black-keys">
                    {blackKeys.map((note) => {
                        const isHighlighted = currentSong && currentSong.notes[currentNoteIndex] === note.key;
                        // Position black keys between specific white keys
                        const positions = { 'C#': 1, 'D#': 2, 'F#': 4, 'G#': 5, 'A#': 6 };
                        return (
                            <button
                                key={note.key}
                                className={`black-key ${pressedKey === note.key ? 'pressed' : ''} ${isHighlighted ? 'highlight' : ''}`}
                                style={{ '--position': positions[note.key] }}
                                onClick={() => handleKeyClick(note)}
                            />
                        );
                    })}
                </div>
            </div>

            <p className="music-hint">
                {mode === 'free' ? 'Click the keys to play!' : currentSong ? 'Click the highlighted key!' : ''}
            </p>
        </div>
    );
}

export default MusicKeyboard;
