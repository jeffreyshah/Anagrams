"use client";

import React, { useState, useEffect, useRef } from "react";
import { getDailyWord, checkWord } from "../server/game";
import "../style.css"; // Adjust the path as necessary
import Link from "next/link";

const GamePage: React.FC = () => {
  const [letters, setLetters] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");
  const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  let attempts = 1;

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
        const invalid= new Audio("/sounds/brick-on-metal.mp3");
        invalid.play().catch((error) => console.error("Error playing sound:", error));
        setLetters(Array(word.length).fill(""));
        inputRefs.current[0]?.focus();
        attempts = attempts+1;
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
            ref={(el) => (inputRefs.current[index] = el)}
            onFocus={index === 0 ? handleFirstInputFocus : undefined}
          />
        ))}
      </div>
      <div className="game-footer">
        {isWordValid !== null && (
          <div className="game-over-div">
            {isWordValid ? `The word is valid! Succeeded in ${attempts} attempt(s)!` : "Try Again!"}
          </div>
        )}
        <Link href="/"
          className="home-button">
          Home
        </Link>
      </div>
    </body>
  );
  
};

export default GamePage;