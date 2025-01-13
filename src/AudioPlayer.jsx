import React, { useRef, useState, useEffect } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef(null); // オーディオ要素を参照する
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>React MP3 Player</h1>
      <audio ref={audioRef} src="/audio/sample.mp3" preload="auto" />
      <div>
        <button onClick={togglePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div>
        <span>{Math.floor(currentTime)} / {Math.floor(duration)} sec</span>
      </div>
      <div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={(e) => {
            if (audioRef.current) {
              audioRef.current.volume = e.target.value;
            }
          }}
        />
        <span>Volume</span>
      </div>
    </div>
  );
};

export default AudioPlayer;