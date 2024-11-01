# check if word exists in words.json. If not remove it.\
# If the word exists, convert it to json list of its anagrams

import json
import requests
from itertools import permutations

from tqdm import tqdm

FREE_DICTIONARY_API= "https://api.dictionaryapi.dev/api/v2/entries/en/"

def filter_words():
    # Load words from words.json
    with open('words.json', 'r') as file:
        data = json.load(file)
        words = data.get('words', [])

    filtered_words = []

    for word in tqdm(words, desc="Checking words"):        
        response = requests.get(FREE_DICTIONARY_API + word)
        if response.status_code == 200:
            filtered_words.append(word)

    # Save the filtered words back to words.json
    with open('words.json', 'w') as file:
        json.dump({'words': filtered_words}, file, indent=4)

def get_anagrams(word):
    anagrams = []
    for w in tqdm(permutations(word), "Getting anagrams for " + word):
        response = requests.get(FREE_DICTIONARY_API + ''.join(w))
        if (w != word and response.status_code == 200):
            anagrams.append(''.join(w))
    
    return anagrams

def convert_word_to_anagram_list():
    with open('words.json', 'r') as file:
        data = json.load(file)
        words = data.get('words', [])

    anagrams = {}
    for word in tqdm(words, desc="Converting words to anagrams"):
        anagramsForWord = get_anagrams(word)
        if len(anagramsForWord) != 1:
            anagrams[word] = anagramsForWord

    with open('anagrams.json', 'w') as file:
        json.dump(anagrams, file, indent=4)


convert_word_to_anagram_list()