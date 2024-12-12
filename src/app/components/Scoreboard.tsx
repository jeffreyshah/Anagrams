import React from 'react';

/* 
 * Scoreboard Component: Displays the player's profile picture, word count, and score in a formatted layout.
 */ 

interface ScoreboardProps {
  profilePic: string; // URL or path to the player's profile picture.
  validWordsCount: number;
  score: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ profilePic, validWordsCount, score }) => {
  // Formats the score to always show at least 4 digits, padding with leading zeros if necessary.
  const formattedScore = score.toString().padStart(4, '0');
  
  return (
    <div className="stats-container">
      <div className="stats-icon">
        <img src={profilePic} alt="Stats Icon" className="icon-image" />
      </div>
      <div className="stats-text">
        <div className="stats-words">WORDS: {validWordsCount}</div>
        <div className="stats-score">SCORE: {formattedScore}</div>
      </div>
    </div>
  );
};

export default Scoreboard;
