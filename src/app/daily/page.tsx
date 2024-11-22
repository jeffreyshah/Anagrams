"use client";

import React, { useState, useEffect, useRef } from "react";
import { getDailyWord, checkWord } from "../server/game";
import "../style.css";
import Image from "next/image";

/**

Game Page (Daily Challenge)

This component handles the game logic for the daily challenge.
The player...
    receives a scrambled word.
    attempts to unscramble it by typing letters in order.
    submits the word by pressing Enter.
    earns completion after submitting a valid word.
Players can try again if the word is invalid.

**/

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(1);
  const [shake, setShake] = useState<boolean>(false);
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch the daily scrambled word on mount
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const fetchedWord = await getDailyWord();
        setScrambledWord(fetchedWord);
        setLetters(Array(fetchedWord.length).fill(""));
        inputRefs.current = Array(fetchedWord.length).fill(null);
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    fetchWord();
  }, []);

  // Reset focus to the first input when the word changes
  useEffect(() => {
    if (scrambledWord.length > 0) {
      inputRefs.current[0]?.focus();
    }
  }, [scrambledWord]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // Shake duration
  };

  const resetGame = () => {
    setLetters(Array(scrambledWord.length).fill(""));
    setCurrentIndex(0);
    setIsWordValid(null);
    setAttempts(1);
    setIsGameOver(false);
    inputRefs.current[0]?.focus();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (isGameOver) return;

    const value = e.target.value.toLowerCase();
    if (value.length === 1 && /^[a-z]$/.test(value)) {
      const updatedLetters = [...letters];
      updatedLetters[index] = value;
      setLetters(updatedLetters);

      if (index < scrambledWord.length - 1 && updatedLetters[index + 1] === "") {
        setCurrentIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (isGameOver) return;

    if (e.key === "Backspace") {
      const updatedLetters = [...letters];
      updatedLetters[index] = "";
      if (index > 0) {
        updatedLetters[index - 1] = "";
        setCurrentIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
      setLetters(updatedLetters);
    } else if (e.key === "Enter") {
      const formedWord = letters.join("");
      const isValid = await checkWord(formedWord, scrambledWord);
      setIsWordValid(isValid);

      if (isValid) {
        setIsGameOver(true);
      } else {
        triggerShake();
        if (formedWord.length == 7) {
          setAttempts((prev) => prev + 1);          
        }
        setLetters(Array(scrambledWord.length).fill(""));
        inputRefs.current[0]?.focus();
      }
    }
  };

  return (
    <div className="game-container">
      <button className="home-button" onClick={() => (window.location.href = "/")}>
        <i className="fas fa-home"></i>
      </button>
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className={`game-content ${shake ? "shake" : ""}`}>
        <h2 className="game-word">{scrambledWord}</h2>
        <div className="input-boxes">
          {letters.map((letter, index) => (
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
        <div className="stats-text">
          <div className="stats-attempts">Attempts: {attempts}</div>
          {isWordValid !== null && (
            <div className="game-over-message">
              {isWordValid ? "You unscrambled the word!" : "Try Again!"}
            </div>
          )}
        </div>
      </div>
      {isGameOver && (
        <div className="game-over">
          <button className="game-button" onClick={() => window.location.href = '/'}>
            Home
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
