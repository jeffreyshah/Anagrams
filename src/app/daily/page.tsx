"use client";

import React, { useState, useEffect, useRef } from "react";
import { getScrambledDailyWord, getUnscrambledDailyWord, checkAnyWord } from "../server/game";
import Confetti from "react-confetti";
import "../style.css";

/**
 * Daily Challenge Component
 *
 * Main component for the daily scrambled word challenge.
 * This component handles:
 * - Fetching the daily scrambled word from the server.
 * - Managing user input and game state.
 * - Validating the player's submitted word.
 * - Displaying game results and retry options.
 * 
 * MVC Design Pattern:
 * Model:
 *  - State variables (score, validWords, etc.)
 *  - Server-side getter functions (getScrambledDailyWord, checkAnyWord)

 * View:
 *  - Render methods
 *  - Responsible for UI representation
 *  - Uses state to dynamically update UI

 * Controller: 
 *  - Component methods (handleSubmitWord, resetGame, etc.)
 *  - Manages user interactions
 *  - Updates model (State variables) based on user actions
 * 
*/

// Preloads sound files for use in the game
let sounds: { brick: HTMLAudioElement; nuhuh: HTMLAudioElement; duhduh: HTMLAudioElement;
              dailyplay: HTMLAudioElement };
if (typeof window !== "undefined") {
  // Ensure Audio is only initialized on the client
  sounds = {
    brick: new Audio("/sounds/boom.mp3"),
    nuhuh: new Audio("/sounds/wrong.mp3"),
    duhduh: new Audio("/sounds/pony.mp3"),
    dailyplay: new Audio("/sounds/dailyplay.mp3")
  };
}

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  // const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [displayMessage, setDisplayMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    document.title = "Daily Challenge \u2014 SCRAMBLED"; 
  }, []);

  useEffect(() => {
    Object.values(sounds).forEach((audio) => {
      audio.load(); 
    });
  }, []);

  /**
   * Fetch the daily scrambled word from the server.
   * - Sets the scrambled word.
   * - Initializes the letter input boxes.
   * - Prepares input refs for focusing.
   */
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const fetchedWord = await getScrambledDailyWord();
        const fetchedAnswer = await getUnscrambledDailyWord();
        setScrambledWord(fetchedWord);
        setAnswer(fetchedAnswer);
        setLetters(Array(fetchedWord.length).fill(""));
        inputRefs.current = Array(fetchedWord.length).fill(null);
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    fetchWord();

    sounds.dailyplay.currentTime = 0; 
    sounds.dailyplay.play().catch((error) =>
      console.error("Error playing gameplay audio:", error)
    );
  }, []);

  /**
   * Ensures the first input field is focused when the scrambled word changes.
   * This is triggered when a new word is fetched.
   */
  useEffect(() => {
    if (scrambledWord.length > 0) {
      inputRefs.current[0]?.focus();
    }
  }, [scrambledWord]);

  /**
   * Triggers a shake animation for invalid submissions.
   * - Sets `shake` to true, initiating the CSS shake effect.
   * - Resets `shake` to false after a short delay.
   */
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); 
  };

  /**
   * Handles character input in the letter boxes.
   * - Updates the current letter at the given index.
   * - Automatically moves focus to the next input box if valid input is entered.
   */
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

  /**
   * Handles keyboard events in the letter boxes.
   * - Backspace: Deletes the current letter and moves focus backward.
   * - Enter: Submits the current word for validation.
   */
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
      const isValid =
        formedWord.length === scrambledWord.length &&
        (await checkAnyWord(formedWord, scrambledWord) || formedWord === answer);
  
      // setIsWordValid(isValid);
  
      if (isValid) {
        setDisplayMessage("You unscrambled the word!");
        setAttempts((prev) => prev + 1);
        setIsGameOver(true);
        sounds.dailyplay.pause();
        setShowConfetti(true); 
        setTimeout(() => setShowConfetti(false), 26000);
        sounds.duhduh.play().catch((error) => console.error("Error playing audio:", error));
      } else if (formedWord.length < 7) {
        setDisplayMessage("Enter a 7 letter word!");
        sounds.nuhuh.currentTime = 0;
        sounds.nuhuh.play().catch((error) =>
          console.error("Error playing audio:", error)
        );
      } else {
        setDisplayMessage("Try Again!");
        triggerShake();
        if (formedWord.length === scrambledWord.length) {
          setAttempts((prev) => prev + 1);
          sounds.brick.currentTime = 0; 
          sounds.brick.play().catch((error) => console.error("Error playing audio:", error));
        }
        else {
          sounds.nuhuh.volume = 0.5;
          sounds.nuhuh.currentTime = 0; 
          sounds.nuhuh.play().catch((error) => console.error("Error playing audio:", error));
        }
        setLetters(Array(scrambledWord.length).fill(""));
        inputRefs.current[0]?.focus();
      }
  
      // Reset the letters and focus for the next attempt
      setLetters(Array(scrambledWord.length).fill(""));
      inputRefs.current[0]?.focus();
    }
  };
  
  return (
    <div className="game-container">
      {showConfetti && <Confetti />} {/* Render confetti when `showConfetti` is true */}
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
          {displayMessage}
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
