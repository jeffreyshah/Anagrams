import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that manages a countdown timer.
 * 
 * This hook initializes a timer with a given `initialTime` in seconds and provides functionality
 * to track the remaining time (`timeLeft`). It automatically decrements the time every second,
 * and calls the `onTimeEnd` callback when the timer reaches 0.
 * 
 * It also exposes a `resetTimer` function to reset the countdown to the initial time and restart
 * the countdown process.
 * 
 */

export const useTimer = (initialTime: number, onTimeEnd: () => void) => {
   const [timeLeft, setTimeLeft] = useState(initialTime);
   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const onTimeEndRef = useRef(onTimeEnd);

   /**
   * Effect to update the `onTimeEndRef` whenever the `onTimeEnd` function changes
   * This ensures that the latest function is always used when the timer reaches zero
   */ 
   useEffect(() => {
      onTimeEndRef.current = onTimeEnd;
   }, [onTimeEnd]);

   /**
   * Effect to set up the timer when the hook is first initialized
   */ 
   useEffect(() => {
      timerRef.current = setInterval(() => {
         setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              // If time reaches 0, stop the timer and call `onTimeEnd`
               clearInterval(timerRef.current!);
               onTimeEndRef.current();
               return 0;
            }
            return newTime;
         });
      }, 1000);

      // Cleanup function to clear the timer when the component unmounts or when `useEffect` re-runs
      return () => {
         if (timerRef.current) {
            clearInterval(timerRef.current);
         }
      };
   }, []); // Run only once on mount

   /**
   * Resets the timer back to the initial time
   */ 
   const resetTimer = () => {
      if (timerRef.current) {
         clearInterval(timerRef.current);
      }
      setTimeLeft(initialTime);
      timerRef.current = setInterval(() => {
         setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
               clearInterval(timerRef.current!);
               onTimeEndRef.current();
               return 0;
            }
            return newTime;
         });
      }, 1000);
   };

   return { timeLeft, resetTimer };
};
