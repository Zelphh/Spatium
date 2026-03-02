import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, Category, DEFAULT_POMODORO_SETTINGS } from '@/types/timer';

interface UseTimerProps {
  mode: TimerMode;
  customDuration?: number; // in minutes
}

export function useTimer({ mode, customDuration = 25 }: UseTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate target time based on mode
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTargetTime(DEFAULT_POMODORO_SETTINGS.workDuration * 60);
    } else if (mode === 'custom') {
      setTargetTime(customDuration * 60);
    } else {
      setTargetTime(null); // Standard mode has no target
    }
  }, [mode, customDuration]);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime * 1000;
    }
  }, [isRunning, elapsedTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(newElapsed);
          
          // Check if target reached for countdown modes
          if (targetTime !== null && newElapsed >= targetTime) {
            setIsRunning(false);
            setElapsedTime(targetTime);
          }
        }
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, targetTime]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const displayTime = targetTime !== null 
    ? Math.max(0, targetTime - elapsedTime) 
    : elapsedTime;

  const progress = targetTime !== null 
    ? Math.min(100, (elapsedTime / targetTime) * 100) 
    : null;

  const isCompleted = targetTime !== null && elapsedTime >= targetTime;

  return {
    isRunning,
    elapsedTime,
    displayTime,
    formattedTime: formatTime(displayTime),
    progress,
    isCompleted,
    start,
    pause,
    reset,
    toggle,
    targetTime,
  };
}
