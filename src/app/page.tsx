"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import './style.css';

export default function Home() {
  useEffect(() => {
    document.title = "SCRAMBLED"; // set the title dynamically
  }, []);

  const [showInstructions, setShowInstructions] = useState(false);

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
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