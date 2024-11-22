"use client";

import React, { useState, useEffect, useRef } from "react";
import { getDailyWord, checkWord } from "../server/game";
import "../style.css"; // Adjust the path as necessary
import Link from "next/link";


/**
 * The game page
 * 
 * This page contains the logic for the daily challenge game mode.
 * The player...
 *     is given a scrambled word and has to unscramble it by typing the correct word.
 *     can submit words by typing them in the input boxes and pressing enter.
 *     can also delete the previous letter by pressing backspace.
 *     earns points for each valid word submitted, the points are based on the length of the word.
 * The player can play again after the game ends.
 **/

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const fetchedWord = await getDailyWord();
        console.log("Fetched word:", fetchedWord); // Log the fetched word
        setWord(fetchedWord);
        setLetters(Array(fetchedWord.length).fill(""));
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    };
    fetchWord();
  }, []);

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
        // Clear the textboxes and reset cursor position
        setLetters(Array(word.length).fill(""));
        inputRefs.current[0]?.focus();
      }
    } else if (event.key === "Backspace" && !letters[index]) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFirstInputFocus = () => {
    setLetters(Array(word.length).fill(""));
  };

  return (
    <body className="game-page">
      <h1 className="game-title">
        SCRAMB<span className="tilted-letter">L</span>ED
      </h1>
      <div className="game-container">
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
              inputRefs.current[index] = el;
            }}
            onFocus={index === 0 ? handleFirstInputFocus : undefined}
          />
        ))}
      </div>
      {isWordValid !== null && (
        <div className="game-over-div">
          {isWordValid ? "The word is valid! +2000pts" : "The word is not valid."}
          {isWordValid ? (
            <Link
              href="/game"
              className="game-button"
              onClick={() => window.location.reload()}
            >
              Play again
            </Link>
          ) : null}
        </div>
      )}
    </body>
  );
};

export default GamePage;
