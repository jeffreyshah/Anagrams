import random
import json
from datetime import datetime, timedelta

'''
Return list of words from the file
'''
def load_words(file_path):
    with open(file_path, "r") as file:
        return [line.strip() for line in file.readlines()]

'''
Randomly scramble given word
'''
def scramble_word(word):
    word_list = list(word)
    random.shuffle(word_list)
    return ''.join(word_list)

'''
Generate 365 words and their scrambled form, and save to a json file.
This ensures that all words are scrambled the same way for all users. 
'''
def generate_daily_words(words, start_date, days=365):

    random.shuffle(words)

    daily_words = {}
    for i in range(days):
        current_date = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        word = words[i].lower()
        shuffled_word = scramble_word(word)
        daily_words[current_date] = {
            'unscrambled': word,
            'scrambled': shuffled_word
        }

    return daily_words

'''
Save words to json
'''
def save_daily_words(daily_words, output_file):
    with open(output_file, "w") as file:
        json.dump(daily_words, file, indent=4)

'''
Driver function for creating daily words
'''
def main():
    words_file = 'words-7.txt'  
    output_file = 'dailyWords.json'
    words = load_words(words_file)
    start_date = datetime.today()

    try:
        daily_words = generate_daily_words(words, start_date)
        save_daily_words(daily_words, output_file)
        print(f"Daily words generated successfully.")
    except ValueError as e:
        print(e)

if __name__ == "__main__":
    main()
