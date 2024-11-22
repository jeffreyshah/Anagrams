"use client";

import React, { useState, useEffect, useRef } from "react";
import { getDailyWord, checkWord } from "../server/game";
import "../style.css"; // Adjust the path as necessary
import Link from "next/link";

/**
 * 
 * @returns Daily challenge page
 * 
 * This component is responsible for rendering the game page as well as handling the game logic.
 * 
 * The player can:
 *    Input letters to form words
 *    Submit words to check if they are valid
 *    View the scrambled word
 *    Play again after the game is over
 * 
 * The game:
 *    Fetches a scrambled word from the server
 *    Allows the player to input letters to form words
 *    Checks if the word is valid
 *    Ends the game when the word is valid
 * 
 */

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(1); // Initialize attempts as state
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Allow nulls during initialization

  // Fetch a new word when the component mounts
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const fetchedWord = await getDailyWord();
        console.log("Fetched word:", fetchedWord); // Log the fetched word
        setWord(fetchedWord);
        setLetters(Array(fetchedWord.length).fill(""));
        // Ensure refs array matches the word length
        inputRefs.current = Array(fetchedWord.length)
          .fill(null);
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    fetchWord();
  }, []);

  useEffect(() => {
    // Focus the first input once the word is fetched
    if (word.length > 0) {
      inputRefs.current[0]?.focus();
    }
  }, [word]);

  // Handle input changes and move to the next input field
  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newLetters = [...letters];
      newLetters[index] = value;
      setLetters(newLetters);

      // Move to the next input field if it exists
      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle key presses for form submission
  // Check if the word is valid and log the result
  // Play a sound effect if the word is invalid
  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Enter") {
      const formedWord = letters.join("");
      const isValid = await checkWord(formedWord, word);
      console.log("Is " + word + " valid:", isValid); // Log if the word is valid
      setIsWordValid(isValid);

      if (!isValid) {
        const invalid = new Audio("/sounds/brick-on-metal.mp3");
        invalid.play().catch((error) =>
          console.error("Error playing sound:", error)
        );
        setLetters(Array(word.length).fill(""));
        inputRefs.current[0]?.focus();
        setAttempts((prevAttempts) => prevAttempts + 1); // Increment attempts correctly
      }
    } else if (event.key === "Backspace" && !letters[index]) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle focus on the first input 
  const handleFirstInputFocus = () => {
    setLetters(Array(word.length).fill(""));
  };

  return (
    <body 
      className="game-container">
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className="game-container">
        <button className="home-button" onClick={() => window.location.href = '/'}>
          <i className="fas fa-home"></i> 
        </button>
        <h2 className="game-word">{word}</h2>
        {letters.map((letter, index) => (
        <input
          className="game-input"
          key={index}
          type="text"
          value={letter}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, index)}
          maxLength={1}
          ref={(el) => {
            inputRefs.current[index] = el; // Assign without returning
          }}
          onFocus={index === 0 ? handleFirstInputFocus : undefined}
        />
      ))}

      </div>
      <div className="game-footer">
        {isWordValid !== null && (
          <div className="game-over-div">
            {isWordValid
              ? `The word is valid! Succeeded in ${attempts} attempt(s)!`
              : "Try Again!"}
          </div>
        )}
      </div>
    </body>
  );
};

export default GamePage;
