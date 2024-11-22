import words6 from './words-6.json';
import dailyWords from './dailyWords.json';
type DailyWordEntry = {
    unscrambled: string;
    scrambled: string;
};

const typedDailyWords: Record<string, DailyWordEntry> = dailyWords as Record<string, DailyWordEntry>;


export const checkAnyWord = async (inputWord: string, scrambledWord: string): Promise<boolean> => {

    // check if the inputWord is a valid subset of scrambledWord
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

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputWord}`);
        return response.status === 200;
    } catch {
        return false; 
    }
};

// Check if two words are anagrams of each other using the dictionary API
export const checkWord = async (word1: string, word2: string): Promise<boolean | null> => {
    const normalize = (word: string) => word ? word.toLowerCase().split('').sort().join('') : '';
    if (normalize(word1) !== normalize(word2)) {
        return false;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word1}`);
        return response.status === 200;
    } catch {
        return false;
    }
};

// Fetch a scrambled word from the server
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
    const offset = now.getMonth() >= 3 && now.getMonth() <= 10 ? 4 : 5; 
    utcDate.setHours(utcDate.getHours() - offset);
    const dateString = utcDate.toISOString().split('T')[0];
    return dateString;
};

// Fetch the daily word from the server based on the current date
export const getDailyWord = async (): Promise<string> => {
    const dateString = getESTDate(); // Get the current date in EST
    const word = typedDailyWords[dateString];

    if (!word) {
        throw new Error(`No word found for date: ${dateString}`);
    }

    console.log(`Fetched word for ${dateString}: ${word.unscrambled}`);
    return word.scrambled;
};

// Scramble a word by shuffling its letters
export const scrambleWord = (word: string): string => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}
