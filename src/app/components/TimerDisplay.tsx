import React from 'react';

/* 
 * TimerDisplay Component: Displays the remaining time in seconds.
 */

interface TimerDisplayProps {
  timeRemaining: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining }) => (
  <div className="timer">Time Left: {timeRemaining}s</div>
);

export default TimerDisplay;
