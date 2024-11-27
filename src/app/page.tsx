"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import './style.css';

/**

The Home page

This page serves as the main entry point for the SCRAMBLED game. It includes:
- Navigation to different game modes: Singleplayer and Daily Challenge.
- A "How to Play" modal with game instructions.
- A toggle button for background music.
- Dynamic document title setting.

**/

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set the title 
  useEffect(() => {
    document.title = "SCRAMBLED."; 
  }, []);

  const [showInstructions, setShowInstructions] = useState(false);

  /** 
   * Toggle visibility of "How to Play" button 
   */
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  /** 
   * Toggles the background music playback. 
   */ 
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="container">
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
        <div className="button-container">
          <Link href="/singleplayer" className="game-button" id="join-button">Play</Link>
          <Link href="/daily" className="game-button" id="play-button">Daily Challenge</Link>
        </div>
        <button 
          className="info-button" 
          aria-label="How to play" 
          onClick={toggleInstructions}
        >
          <i className="fas fa-question-circle"></i>
        </button>
        <button className="music-toggle" onClick={toggleMusic}>
          <i className={`fas ${isPlaying ? "fa-volume-high" : "fa-volume-off"}`}></i>
        </button>
        <audio ref={audioRef} src="/sounds/tikiwho.mp3" loop />
      </h1>
      {showInstructions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="close-button" 
              onClick={toggleInstructions}
              aria-label="Close instructions"
            >
              &times;
            </button>
            <h2>How to Play</h2>
            <p><strong>Singleplayer:</strong> Combine letters to make words. Make as many words as you can in 60 seconds! </p>
            <p><strong>Daily Challenge:</strong> Rearrange all the given letters to form a single valid word. </p>
          </div>
        </div>
      )}
    </div>
  );
}