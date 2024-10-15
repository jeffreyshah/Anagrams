// Note: Word will need to be pulled from server 

import { readFile } from "fs";
import { normalize } from "path";

// For now uses getWord function 
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en_US/';

export function getWord(): Promise<string> {
    return Promise.resolve("words");
}

export async function checkWord(word: string, orig: string): Promise<boolean> {
    try {
        const response = await fetch(DICTIONARY_API + word);
        const data = await response.json();
        console.log('Data:', data);
        return data.title !== 'No Definitions Found' && checkWordComp(word, orig) 
        && word !== orig;
         
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

export function checkWordComp(word: string, orig: string): boolean {
    const normalizeWord = (w: string) => w.split('').sort().join('');
    return normalizeWord(word) === normalizeWord(orig);
}

