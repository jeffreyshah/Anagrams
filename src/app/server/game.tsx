import words from './words.json';

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

export const getWord = async (): Promise<string> => {
    const randomIndex = Math.floor(Math.random() * words.words.length);
    return words.words[randomIndex];
};
