"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getScrambledDailyWord, getUnscrambledDailyWord, checkAnyWord } from "../server/game";
import Confetti from "react-confetti";
import { InputBox, GameStats, Scoreboard, TimerDisplay } from "../components";
import AudioManager from "../utils/AudioManager";
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
 */

// Defines sound files for use in the game
const defaultSounds = {
  brick: "/sounds/boom.mp3",
  nuhuh: "/sounds/wrong.mp3",
  duhduh: "/sounds/pony.mp3",
  dailyplay: "/sounds/dailyplay.mp3",
};

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false); // State for confetti
  const [displayMessage, setDisplayMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const audioManager = useMemo(() => {
    // Only initialize audio manager if window exists (client-side)
    if (typeof window !== 'undefined') {
      const manager = new AudioManager();
      manager.loadSounds(defaultSounds);
      return manager;
    }
    // Return a dummy manager for server-side
    return {
      playSound: () => {},
      pauseSound: () => {},
      setCurrentTime: () => {},
    };
  }, []);

  useEffect(() => {
    document.title = "Daily Challenge \u2014 SCRAMBLED"; 
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

    if (typeof window !== 'undefined' && audioManager.playSound) {
      audioManager.playSound("dailyplay", { 
        loop: true, 
      });
    }
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
  
      if (isValid) {
        setDisplayMessage("You unscrambled the word!");
        setAttempts((prev) => prev + 1);
        setIsGameOver(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 26000);

        audioManager.pauseSound("dailyplay");
        audioManager.playSound("duhduh");

      } else if (formedWord.length < 7) {
        setDisplayMessage("Enter a 7 letter word!");
        audioManager.setCurrentTime("nuhuh", 0);
        audioManager.playSound("nuhuh");
      } else {
        setDisplayMessage("Try Again!");
        triggerShake();
        if (formedWord.length === scrambledWord.length) {
          setAttempts((prev) => prev + 1);
          audioManager.setCurrentTime("brick", 0);
          audioManager.playSound("brick");
        }
        else {
          audioManager.setCurrentTime("nuhuh", 0);
          audioManager.playSound("nuhuh");
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
      <h1 className="page-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className={`game-content ${shake ? "shake" : ""}`}>
        <h2 className="game-word">{scrambledWord}</h2>
        <div className="input-boxes">
          {letters.map((letter, index) => (
            <InputBox
            key={index} 
            value={letter} 
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            isDisabled={isGameOver} isFocused={index === currentIndex}
            inputRef={(el) => {
              inputRefs.current[index] = el;
            }}
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
