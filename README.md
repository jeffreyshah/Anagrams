# Scrambled: An Anagram Game

Scrambled is a web-based anagram game where players rearrange characters in a randomly shuffled word into valid English words.

## Features
- **Singleplayer Mode**: Rearrange letters in a randomly shuffled word to form valid English words.
- **Daily Challenge**: Solve a more challenging 7-letter anagram. The challenge resets daily.

## How to Play
1. Visit the game at [http://scrambled.cs.rpi.edu:3000](http://scrambled.cs.rpi.edu:3000).
2. Choose a mode:
   - **Singleplayer Mode**: Practice rearranging letters into real words.
   - **Daily Challenge**: Take on the daily 7-letter anagram for an extra challenge.

## Project Structure
- **Singleplayer Mode Logic**: Found in `src/app/singleplayer`
- **Daily Challenge Logic**: Found in `src/app/daily`

## Contributing

To ensure consistency and maintainability, please adhere to the following guidelines when contributing to this project:

### Component Documentation
All new components must include a docstring comment in the following format:

```javascript
/**
 * New Component
 *
 * This component is responsible for [...]. It includes:
 *   - Functionality A
 *   - Functionality B
 *   ...
 *   - Functionality N
 */
 ```
### Function Documentation
Each function should have a docstring comment explaining its purpose and functionality. For example:
```javascript
/**
 * This function takes an integer N and returns a scrambled word of length N.
 */
```

### Variable Naming
Use camelCase for variable names. 
Correct: variableName
Incorrect: variable_name