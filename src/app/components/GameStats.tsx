import React from 'react';

/*
 * GameStats Component: 
 * Displays the score and valid words along with their respective scores at the end of the game.
 */

interface GameStatsProps {
  score: number;
  validWords: Set<string>;
}

const GameStats: React.FC<GameStatsProps> = ({ score, validWords }) => {
  // Formats the score to always show at least 4 digits, padding with leading zeros if necessary.
  const formattedScore = score.toString().padStart(4, "0");
  
  /**
   * Returns the score for a word based on its length.
   */ 
  const getScoreForWord = (word: string): number => {
    const scoreMapping: Record<number, number> = {
      3: 100,
      4: 400,
      5: 1200,
      6: 2000,
    };
    return scoreMapping[word.length] || 0;
  };

  return (
    <>
      <div className="end-stats-box">
        <p className="end-stat-score">Score: <span className="end-stat-value score">{formattedScore}</span></p>
      </div>
      <div className="word-list-box">
        <p className="end-stat-words">Words: <span className="end-stat-value">{validWords.size}</span></p>
          <ul className="word-list">
          {Array.from(validWords) // Convert the Set to an array
            .sort((a, b) => b.length - a.length) // Sort by word length
            .map((word, index) => (
                <li key={index} className="word-item">
                  <span className="word-text">{word}</span>
                  <span className="word-score">{getScoreForWord(word)}</span>
                </li>
              ))}
          </ul>
      </div>
    </>
  );
};

export default GameStats;
