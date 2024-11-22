"use client";

import React, { useState, useEffect, useRef } from "react";
import { getSingleplayerWord, checkAnyWord } from "../server/game";
import "../style.css";

/**
 * 
 * @returns Singleplayer game page
 * 
 * This component is responsible for rendering the singleplayer game page as well as handling the game logic.
 * 
 * The player can:
 *    Input letters to form words
 *    Submit words to earn points
 *    View the scrambled word
 *    View the time left
 *    View the score
 *    Play again after the game is over
 * 
 * The game:
 *    Fetches a scrambled word from the server
 *    Starts a timer for the round
 *    Allows the player to input letters to form words
 *    Checks if the word is valid and adds it to the score
 *    Ends the game when the timer reaches 0
 * 
 */

const Singleplayer: React.FC = () => {
  const ROUND_TIME_LIMIT = 60;
  const [inputLetters, setInputLetters] = useState<string[]>(Array(6).fill(""));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [validWords, setValidWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_LIMIT);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false); // Shake state
  const [sounds, setSounds] = useState<{ reward: HTMLAudioElement; newArtifact: HTMLAudioElement; gameOver: HTMLAudioElement } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSounds({
      reward: new Audio("/sounds/reward.mp3"),
      newArtifact: new Audio("/sounds/newArtifact.mp3"),
      gameOver: new Audio("/sounds/hellnaw.mp3"),
    });
  }, []);
  
  // Reset the game to its initial state
  const resetGame = async () => {
    setInputLetters(Array(6).fill(""));
    setCurrentIndex(0);
    setValidWords(new Set());
    setScore(0);
    setTimeLeft(ROUND_TIME_LIMIT);
    setIsGameOver(false);

    try {
      const fetchedWord = await getSingleplayerWord();
      setScrambledWord(fetchedWord);
    } catch (error) {
      console.error("Error fetching word:", error);
    }

    if (timerRef.current) clearInterval(timerRef.current);
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

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  };

  // Fetch a new word from the server
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

  // Handle form submission and check if the word is valid
  // If the word is valid, add it to the score
  // If the word is invalid, trigger a shake animation
  const handleSubmitWord = async () => {
    const word = inputLetters.join("").trim();
    if (word.length >= 3 && word.length <= 6 && !validWords.has(word)) {
      const isValid = await checkAnyWord(word, scrambledWord);
      if (sounds && isValid) {
        const audioFile = word.length === 6 ? sounds.reward : sounds.newArtifact;
        audioFile.currentTime = 0
        audioFile.play().catch((error) => console.error("Error playing sound:", error));

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
        triggerShake(); // Trigger shake animation on invalid word
      }
    } else {
      triggerShake(); // Trigger shake animation for duplicate or invalid length
    }
    setInputLetters(Array(6).fill(""));
    setCurrentIndex(0);
    inputRefs.current[0]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false); 
    }, 500); 
  };

  // Handle key presses for backspace and enter
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

  // Play a sound effect on game over if the score is less than 1000
  useEffect(() => {
    if(isGameOver) {
        if(sounds && score < 1000) {
          sounds.gameOver.currentTime = 0
          sounds.gameOver.play().catch((error) => console.error("Error playing audio:", error));
        }
    }
  }, [isGameOver, score]);

  // Handle input changes and move to the next input field
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
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className="game-content">
        <h2 className="game-word">{scrambledWord}</h2>
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
              className={`game-input ${index === currentIndex ? "active" : ""} ${shake ? "shake" : ""}`}
              autoFocus={index === currentIndex}
            />
          ))}
        </div>
      </div>
      <div className="timer">Time Left: {timeLeft}s</div>
      <div className="score">Score: {score}</div>
      {isGameOver && (
        <div className="game-over">
          Game Over! Your score is {score}
          <button className="game-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Singleplayer;
