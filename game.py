import time
import threading
from collections import Counter
from english_words import get_english_words_set
import random as r

user_input = []

def scramble_word(word):
    word_list = list(word)
    r.shuffle(word_list)
    scrambled = ''.join(word_list)
    
    return scrambled

def take_input():
    global user_input
    user_input = input("Enter your input: ")

def check(word, target):
    target_count = Counter(target.lower())
    word_count = Counter(word.lower())
    
    # Check if the target has enough of each letter to cover the word
    for letter, count in word_count.items():
        if count > target_count.get(letter, 0):
            return False
    return True

inputs = set()
web2lowerset = get_english_words_set(['web2'], lower=True)
word=""
with open("words.txt","r") as file:
    lines = file.readlines()
    n = int(r.random() * len(lines))
    word = lines[n].strip()


start = time.time()
print("the word is",scramble_word(word))
# Create a thread for taking input
while (time.time() < 30 + start):
    input_thread = threading.Thread(target=take_input)
    input_thread.start()

    # Wait for 30 seconds or until input is received
    input_thread.join(timeout=30)

    # If input was received, print it
    if input_thread.is_alive() or time.time() > 30 + start:
        print("Time's up!")
        input_thread.join(timeout=0)  # Ensure thread is terminated
    else:
        if user_input in web2lowerset and check(user_input,word):
            if user_input in inputs:
                print("already entered!")
            else:
                inputs.add(user_input)
                print("You entered:", user_input, f"{len(user_input * 250)} points")