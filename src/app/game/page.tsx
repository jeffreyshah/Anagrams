'use client'

import React, { useState, useEffect, useRef } from 'react';
import { getWord, checkWord } from '../server/game'; // Adjust the path as necessary

const GamePage: React.FC = () => {
    const [letters, setLetters] = useState<string[]>([]);
    const [word, setWord] = useState<string>('');
    const [isWordValid, setIsWordValid] = useState<boolean | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const fetchWord = async () => {
            try {
                const fetchedWord = await getWord();
                console.log('Fetched word:', fetchedWord); // Log the fetched word
                setWord(fetchedWord);
                setLetters(Array(fetchedWord.length).fill(''));
            } catch (error) {
                console.error('Error fetching word:', error);
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

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key === 'Enter') {
            const formedWord = letters.join('');
            const isValid = await checkWord(formedWord, word);
            console.log('Is ' + word + ' valid:', isValid); // Log if the word is valid
            setIsWordValid(isValid);

            if (!isValid) {
                // Clear the textboxes and reset cursor position
                setLetters(Array(word.length).fill(''));
                inputRefs.current[0]?.focus();
            }
        } else if (event.key === 'Backspace' && !letters[index]) {
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleFirstInputFocus = () => {
        setLetters(Array(word.length).fill(''));
    };

    return (
        <div>
            <h1>Game Page</h1>
            <div>
                <h2>{word}</h2>
                {letters.map((letter, index) => (
                    <input
                        key={index}
                        type="text"
                        value={letter}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, index)}
                        maxLength={1}
                        style={{ width: '20px', marginRight: '5px' }}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onFocus={index === 0 ? handleFirstInputFocus : undefined}
                    />
                ))}
            </div>
            {isWordValid !== null && (
                <div>
                    {isWordValid ? 'The word is valid!' : 'The word is not valid.'}
                </div>
            )}
        </div>
    );
};

export default GamePage;