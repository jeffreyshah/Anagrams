"use client";

import React, { useState, useEffect, useRef } from "react";
import { getSingleplayerWord, checkAnyWord } from "../server/game";
import "../style.css";
import Image from 'next/image';

/**

The Single PLayer game page

This page contains the logic for the single player game mode. 
The player...
    is given a scrambled word and has to unscramble it by typing the correct word. 
    can submit words by typing them in the input boxes and pressing enter.
    can also delete the previous letter by pressing backspace. 
    earns points for each valid word submitted, the points are based on the length of the word.
The game ends after 60 seconds. 
The player can play again after the game ends.

**/

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

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Resets game to initial state (triggered on on play again)
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

  // Check if the word is valid and update score. Trigger shake animation on invalid word
  const handleSubmitWord = async () => {
    const word = inputLetters.join("").trim();
    if (word.length >= 3 && word.length <= 6 && !validWords.has(word)) {
      const isValid = await checkAnyWord(word, scrambledWord);
      if (isValid) {

        const audioFile = word.length === 6 ? "/sounds/reward.mp3" : "/sounds/newArtifact.mp3";
        const audio = new Audio(audioFile);
        audio.play().catch((error) => console.error("Error playing sound:", error));

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

  // Handle backspace and enter key press (removes the previous letter on backspace, submits the word on enter)
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

  // Play sound on game over
  useEffect(() => {
    if(isGameOver) {
        if(score < 1000) {
            const audio= new Audio("/sounds/hellnaw.mp3");
            audio.play().catch((error) => console.error("Error playing audio:", error));
        }
      
    }
  }, [isGameOver, score]);

  // Handle input change and move to next input field
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

  const formattedScore = score.toString().padStart(4, "0");

  return (
    <div className="game-container">
      <button className="home-button" onClick={() => window.location.href = '/'}> 
        <i className="fas fa-home"></i> 
      </button>
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className={`game-content ${shake ? "shake" : ""}`}>
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
              className={`game-input ${index === currentIndex ? "active" : ""}`}
              autoFocus={index === currentIndex}
            />
          ))}
        </div>
        <div className="stats-container">
          <div className="stats-icon">
            <img src="/images/lebron.webp" alt="Stats Icon" className="icon-image" />
          </div>
          <div className="stats-text">
            <div className="stats-words">WORDS: {validWords.size} </div>
            <div className="stats-score">SCORE: {formattedScore}</div>
          </div>
        </div>
      </div>
      <div className="timer">Time Left: {timeLeft}s</div>
      {isGameOver && (
        <div className="game-over">
          Game Over!
          <button className="game-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Singleplayer;
