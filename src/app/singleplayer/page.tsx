"use client";
import React, { useState, useEffect, useRef } from "react";
import { getSingleplayerWord, checkAnyWord } from "../server/game";
import { useTimer } from "../hooks/useTimer";
import { InputBox, GameStats, Scoreboard, TimerDisplay } from "../components";
import AudioManager from "../utils/AudioManager";
import "../style.css";

/**

The Single Player game page

This page contains the logic for the single player game mode. 
The player...
    is given a scrambled word and has to unscramble it by typing the correct word. 
    can submit words by typing them in the input boxes and pressing enter.
    can also delete the previous letter by pressing backspace. 
    earns points for each valid word submitted, the points are based on the length of the word.
The game ends after 60 seconds. 
The player can play again after the game ends.

**/

// Defines sound files for use in the game
const defaultSounds = {
  reward: "/sounds/reward.mp3",
  newArtifact: "/sounds/newArtifact.mp3",
  hellnaw: "/sounds/hellnaw.mp3",
  gameplay: "/sounds/gameplay.mp3",
};

/** 
 * Load list of images 
 */
const profilePics = [
  "/images/me.jpg"
];

const Singleplayer: React.FC = () => {
  const ROUND_TIME_LIMIT = 60;
  const [inputLetters, setInputLetters] = useState<string[]>(Array(6).fill(""));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [validWords, setValidWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false); // State that tracks whether a "shake" animation is active for UX
  const [selectedProfilePic, setSelectedProfilePic] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  /**
   * Load audio files into AudioManager instance
   */
  const audioManager = new AudioManager();
  useEffect(() => {
    audioManager.loadSounds(defaultSounds);
  }, [audioManager]);

  const onTimeEnd = () => setIsGameOver(true);
  const { timeLeft, resetTimer } = useTimer(ROUND_TIME_LIMIT, onTimeEnd);

  // Set tab title 
  useEffect(() => {
    document.title = "Singleplayer \u2014 SCRAMBLED";
  }, []);

  /**
   * Sets randomized image icon
   */
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * profilePics.length);
    setSelectedProfilePic(profilePics[randomIndex]); // randomly select image icon

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
    setIsGameOver(false);

    try {
      const fetchedWord = await getSingleplayerWord();
      setScrambledWord(fetchedWord);
    } catch (error) {
      console.error("Error fetching word:", error);
    }

    resetTimer();
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  /**
   * Fetches the scrambled word from the server and starts the timer.
   */
  useEffect(() => {
    resetGame();
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
        const audio = word.length === 6 ? "reward" : "newArtifact";
        audioManager.setCurrentTime(audio, 0);
        audioManager.playSound(audio);
        // Scoring logic for valid words
        setValidWords(new Set(validWords.add(word)));
        const scoreMapping: Record<number, number> = {
          3: 100, 4: 400, 5: 1200, 6: 2000,
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
    setTimeout(() => { setShake(false); }, 500); 
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
        if(score < 1000) {
          const audio = "hellnaw";
          audioManager.setVolume(audio, 0.5);
          audioManager.setCurrentTime(audio, 0);
          audioManager.playSound(audio);
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
            <GameStats score={score} validWords={validWords} />
            <button className="game-button" onClick={resetGame}>
              Play Again <i className="fa fa-repeat fa-sm" style={{ marginLeft: '4px' }}></i>
            </button>
          </div>
        ) : (
          <>
            <TimerDisplay timeRemaining={timeLeft}/>
            <div className={`game-content ${shake ? "shake" : ""}`}>
              <h2 className="game-word">{scrambledWord.split("").join(" ")}</h2>
              <div className="input-boxes">
                {inputLetters.map((letter, index) => (
                  <InputBox
                  key={index} 
                  value={letter} 
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  isDisabled={isGameOver} isFocused={index === currentIndex}
                  inputRef={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  shake={shake && !isGameOver && letter === ""}
                  />
                ))}
              </div>
            </div>
            <Scoreboard 
              profilePic={selectedProfilePic} 
              validWordsCount={validWords.size} 
              score={score} 
            />
          </>
        )}
      </div>
    );
};

export default Singleplayer;
