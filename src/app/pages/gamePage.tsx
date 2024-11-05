import React, { useState, useEffect } from 'react';
import { getWord, checkWord } from '../server/game'; // Adjust the path as necessary
import "../../style.css";

const GamePage: React.FC = () => {
    const [letters, setLetters] = useState<string[]>(Array(5).fill(''));
    const [word, setWord] = useState<string>('');
    const [isWordValid, setIsWordValid] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchWord = async () => {
            const fetchedWord = await getWord();
            setWord(fetchedWord);
        };
        fetchWord();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newLetters = [...letters];
            newLetters[index] = value;
            setLetters(newLetters);
        }
    };

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const formedWord = letters.join('');
            const isValid = await checkWord(formedWord);
            setIsWordValid(isValid);
        }
    };

    return (
        <body className="game-page">
            <h1 className="game-title">SCRAMB<span className="tilted-letter">L</span>ED</h1>
            <div className="game-container">
                <h2 className="game-word">{word}</h2>
                {letters.map((letter, index) => (
                    <input className="game-input"
                        key={index}
                        type="text"
                        value={letter}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={handleKeyPress}
                        maxLength={1}
                        style={{
                            height: '100px',
                            width: '90px',
                            marginRight: '20px',
                            textAlign: 'center',
                            fontFamily: 'Habibi, serif',
                            fontSize: '60px',
                            color: '#000000',
                            backgroundColor: '#e5e1d4',
                            border: '2px solid #000000',
                            borderRadius: '5px'
                        }}
                    />
                ))}
            </div>
            {isWordValid !== null && (
                <div>
                    {isWordValid ? 'The word is valid!' : 'The word is not valid.'}
                </div>
            )}
        </body>
    );
};

export default GamePage;