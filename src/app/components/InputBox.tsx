import React from "react";

/* 
 * InputBox Component: A reusable input field component for the game, allowing 
 * single-character input with focused state management.
 */

interface InputBoxProps {
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // The handler function to update the value of the input field.
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; // The handler function to handle keyboard events (e.g., Enter, Backspace).
  isDisabled: boolean; 
  isFocused: boolean;  
  inputRef: React.Ref<HTMLInputElement>;
  shake?: boolean; // Shake state
}

const InputBox: React.FC<InputBoxProps> = ({ value, onChange, onKeyDown, isDisabled, isFocused, inputRef, shake }) => {
  return (
    <input
      type="text"
      value={value}
      maxLength={1}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      className={`game-input ${isFocused ? "focused" : ""} ${shake ? "shake" : ""}`}
      ref={inputRef}
      autoFocus={isFocused}
    />
  );
};

export default InputBox;
