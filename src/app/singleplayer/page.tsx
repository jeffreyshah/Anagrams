"use client";

import React, { useState, useEffect, useRef } from "react";
import { getSingleplayerWord, checkAnyWord } from "../server/game";
import "../style.css";


/**
* The Single Player game page

* This page contains the logic for the single player game mode. 
* The player...
*     is given a scrambled word and has to unscramble it by typing the correct word. 
*     can submit words by typing them in the input boxes and pressing enter.
*     can also delete the previous letter by pressing backspace. 
*     earns points for each valid word submitted, the points are based on the length of the word.
* The game ends after 60 seconds. 
* The player can play again after the game ends.

* MVC Design Pattern:
* Model:
*  - State variables (score, validWords, etc.)
*  - Server-side getter functions (getSingleplayerWord, checkAnyWord)

* View:
*  - Render methods
*  - Responsible for UI representation
*  - Uses state to dynamically update UI

* Controller: 
*  - Component methods (handleSubmitWord, resetGame, etc.)
*  - Manages user interactions
*  - Updates model (State variables) based on user actions
*/

// Preloads sound files for use in the game
let sounds: { reward: HTMLAudioElement; newArtifact: HTMLAudioElement; 
              hellnaw: HTMLAudioElement; gameplay: HTMLAudioElement;};
if (typeof window !== "undefined") {
  // ensure audio is only initialized client-side
  sounds = {
    reward: new Audio("/sounds/reward.mp3"),
    newArtifact: new Audio("/sounds/newArtifact.mp3"),
    hellnaw: new Audio("/sounds/hellnaw.mp3"),
    gameplay: new Audio("/sounds/gameplay.mp3")
  };
}

/** 
 * Load list of images 
 */
const profilePics = [
  "/images/duck.jpg"
];

const Singleplayer: React.FC = () => {
  const ROUND_TIME_LIMIT = 60;
  const [inputLetters, setInputLetters] = useState<string[]>(Array(6).fill(""));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [validWords, setValidWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_LIMIT);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false); // State that tracks whether a "shake" animation is active for UX
  const [selectedProfilePic, setSelectedProfilePic] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set tab title 
  useEffect(() => {
    document.title = "Singleplayer \u2014 SCRAMBLED";
  }, []);

  /**
   * Resets the game state to start a new round
   * - Fetches a new word, resets score, timer, and input fields
   */
  const resetGame = async () => {
    setInputLetters(Array(6).fill(""));
    setCurrentIndex(0);
    setValidWords(new Set());
    setScore(0);
    setTimeLeft(ROUND_TIME_LIMIT);
    setIsGameOver(false);

    try { // fetch word from database
      const fetchedWord = await getSingleplayerWord();
      setScrambledWord(fetchedWord);
    } catch (error) {
      console.error("Error fetching word:", error);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(prevTime - 1, 0);
        // Out of time, end the game
        if (newTime === 0) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
        }
        return newTime;
      });
    }, 1000);

    // sounds.gameplay.currentTime = 0; 
    // sounds.gameplay.volume = 0.45;
    // sounds.gameplay.play().catch((error) =>
    //   console.error("Error playing gameplay audio:", error)
    // );

    setTimeout(() => {
      // Autofocuses cursor on first textbox
      inputRefs.current[0]?.focus(); 
    }, 0);
  };

  /**
   * Load audio files and set image icon
   */
  useEffect(() => {
    Object.values(sounds).forEach((audio) => {
      audio.load(); 
    });

    const randomIndex = Math.floor(Math.random() * profilePics.length);
    setSelectedProfilePic(profilePics[randomIndex]); // randomly select image icon

  }, []);

  /**
   * Fetches the scrambled word from the server and starts the timer.
   */
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const fetchedWord = await getSingleplayerWord();
        setScrambledWord(fetchedWord);
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    fetchWord();

    // sounds.gameplay.currentTime = 0; 
    // sounds.gameplay.volume = 0.45;
    // sounds.gameplay.play().catch((error) =>
    //   console.error("Error playing gameplay audio:", error)
    // );

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(prevTime - 1, 0);
        if (newTime === 0) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /**
  * Validates the submitted word and updates the player's score if valid.
  * - Triggers a shake animation for invalid words or duplicate submissions.
  */
  const handleSubmitWord = async () => {
    const word = inputLetters.join("").trim();
    if (word.length >= 3 && word.length <= 6 && !validWords.has(word)) {
      const isValid = await checkAnyWord(word, scrambledWord);
      if (isValid) {
        const audio = word.length === 6 ? sounds.reward : sounds.newArtifact;
        audio.currentTime = 0; // Reset playback
        audio.play().catch((error) => console.error("Error playing sound:", error));
        // Scoring logic for valid words
        setValidWords(new Set(validWords.add(word)));
        const scoreMapping: Record<number, number> = {
          3: 100,
          4: 400,
          5: 1200,
          6: 2000,
        };
        const points = scoreMapping[word.length] || 0;
        setScore((prevScore) => prevScore + points);
      } else {
        // Trigger shake animation on invalid word
        triggerShake(); 
      }
    } else {
      // Trigger shake animation for duplicate or invalid length
      triggerShake(); 
    }
    setInputLetters(Array(6).fill(""));
    setCurrentIndex(0);
    inputRefs.current[0]?.focus();
  };

  /**
   * Trigger visual shake animation to indicate invalid submission
   */
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false); 
    }, 500); 
  };

  /** Handles keyboard input for backspace and enter keys:
  * - Backspace clears the current letter and focuses on the previous input box.
  * - Enter submits the formed word for validation.
  */ 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !isGameOver) {
      const updatedLetters = [...inputLetters];
      updatedLetters[index] = "";
      if (index > 0) {
        updatedLetters[index - 1] = "";
        setCurrentIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
      setInputLetters(updatedLetters);
    } else if (e.key === "Enter" && !isGameOver) {
      handleSubmitWord();
    }
  };

  /** 
   * Play sound effect based on player's final score 
   */
  useEffect(() => {
    if(isGameOver) {
      sounds.gameplay.pause();
        if(score < 1000) {
          sounds.hellnaw.volume = 0.5
          sounds.hellnaw.currentTime = 0;
          sounds.hellnaw.play().catch((error) =>
            console.error("Error playing audio:", error)
          );
        }
      
    }
  }, [isGameOver, score]);

  /** Update the player's screen as they enter characters
   * - Move cursor to the next text box for each valid letter entered.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!isGameOver) {
      const value = e.target.value.toLowerCase();
      if (value.length === 1 && /^[a-z]$/.test(value)) {
        const updatedLetters = [...inputLetters];
        updatedLetters[index] = value;
        setInputLetters(updatedLetters);

        if (index < 5 && updatedLetters[index + 1] === "") {
          setCurrentIndex(index + 1);
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  /**
   * Formats the score, padding with leading zeros if necessary
   */ 
  const formattedScore = score.toString().padStart(4, "0");

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
      <div className="game-container">
        <button className="home-button" onClick={() => window.location.href = '/'}>
          <i className="fas fa-home"></i>
        </button>
        <h1 className="page-title">
          SCRAMB<span className="tilted-letter">L</span>ED
        </h1>
        {isGameOver ? (
      <div className="end-of-round-screen">
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
        <button className="game-button" onClick={resetGame}>
          Play Again <i className="fa fa-repeat fa-sm" style={{ marginLeft: '4px' }}></i>
        </button>
      </div>
        ) : (
          <>
            <div className="timer">Time Left: {timeLeft}s</div>
            {/* <div className="timer">
              <CircularTimer duration={ROUND_TIME_LIMIT} timeLeft={timeLeft} />
            </div> */}
            <div className={`game-content ${shake ? "shake" : ""}`}>
              <h2 className="game-word">{scrambledWord.split("").join(" ")}</h2>
              <div className="input-boxes">
                {inputLetters.map((letter, index) => (
                  <input
                    key={index}
                    type="text"
                    value={letter}
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={isGameOver}
                    className={`game-input ${shake ? "shake" : ""}`}
                    autoFocus={index === currentIndex}
                  />
                ))}
              </div>
            </div>
            <div className="stats-container">
              <div className="stats-icon">
                <img src={selectedProfilePic} alt="Stats Icon" className="icon-image" />
              </div>
              <div className="stats-text">
                <div className="stats-words">WORDS: {validWords.size} </div>
                <div className="stats-score">SCORE: {formattedScore}</div>
              </div>
            </div>
          </>
        )}
      </div>
    );
};

export default Singleplayer;
