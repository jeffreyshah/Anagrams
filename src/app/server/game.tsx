import words6 from './words-6.json';
import dailyWords from './dailyWords.json';

/**

Word Database

This component serves as the interface for managing and retrieving words used in the game. It includes:
- A collection of daily challenge words (`dailyWords.json`) and a singleplayer word pool (`words-6.json`).
- Functions for checking word validity, including whether a word can be formed from a scrambled word, and checking if two words are anagrams.
- A function to fetch a scrambled daily word and its unscrambled version based on the current date (in EST).
- Utilities for scrambling words and checking if words exist in a dictionary via an external API.

**/

// Type definition for a daily word entry, containing both unscrambled and scrambled states
type DailyWordEntry = {
    unscrambled: string;
    scrambled: string;
};

// Typecast the dailyWords data to match the DailyWordEntry structure
const typedDailyWords: Record<string, DailyWordEntry> = dailyWords as Record<string, DailyWordEntry>;

// Checks if the input word is a valid subset of the scrambled word. This function 
// ensures that the letters in the input word are available in the scrambled word 
// with matching frequencies.
export const checkAnyWord = async (inputWord: string, scrambledWord: string): Promise<boolean> => {

    // Helper function to check if the input is a valid subset of scrambled letters
    const isSubset = (input: string, scrambled: string): boolean => {
        const scrambledCount: Record<string, number> = {};
        scrambled.toLowerCase().split('').forEach(letter => {
            scrambledCount[letter] = (scrambledCount[letter] || 0) + 1;
        });

        for (const letter of input.toLowerCase()) {
            if (!scrambledCount[letter]) return false;
            scrambledCount[letter]--;
        }

        return true;
    };

    if (!isSubset(inputWord, scrambledWord)) {
        return false; 
    }

    try { // Make a request to an external dictionary API to verify the input word
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputWord}`);
        if (response.ok) {
            return true;
        }
        if (response.status == 404) {
            return false;
        }
        throw new Error(`Unexpected error: ${response.status}`);
    } 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (error) {  // Catch any errors during the API request and return false
        return false;
    }
};

// Fetch a random scrambled word from the 6-letter singleplayer word database
export const getSingleplayerWord = async (): Promise<string> => {
    const randomIndex = Math.floor(Math.random() * words6.words.length);
    const word = words6.words[randomIndex]
    console.log(`Fetched word: ${word}`)
    return scrambleWord(word);
};

// Get the current date in EST
const getESTDate = (): string => {
    const now = new Date();
    const utcDate = new Date(now.toISOString());
    const offset = now.getMonth() >= 3 && now.getMonth() <= 10 ? 4 : 5; // Account for Daylight Saving
    utcDate.setHours(utcDate.getHours() - offset);
    const dateString = utcDate.toISOString().split('T')[0];
    return dateString;
};

// Fetch the daily word in its scrambled state from the dailyWords DB based on the current date
export const getScrambledDailyWord = async (): Promise<string> => {
    const dateString = getESTDate(); // Get the current date in EST
    const word = typedDailyWords[dateString];

    if (!word) {
        throw new Error(`No word found for date: ${dateString}`);
    }

    console.log(`Fetched word for ${dateString}: ${word.unscrambled}`);
    return word.scrambled;
};

// Fetch the daily word in its unscrambled state from the dailyWords DB based on the current date
export const getUnscrambledDailyWord = async (): Promise<string> => {
    const dateString = getESTDate(); // Get the current date in EST
    const word = typedDailyWords[dateString];

    if (!word) {
        throw new Error(`No word found for date: ${dateString}`);
    }

    console.log(`Fetched word for ${dateString}: ${word.unscrambled}`);
    return word.unscrambled;
};

// Scramble a word by shuffling its letters
export const scrambleWord = (word: string): string => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}
