import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_POMODORO_SETTINGS, TimerMode } from '@/pages/type';
import { addEventTimer, createTimer, type TimerEvent } from '@/lib/timer';

interface ResetOptions {
  recordEvent?: boolean;
}

interface TimerContextValue {
  isRunning: boolean;
  elapsedTime: number;
  sessionId: number | null;
  mode: TimerMode;
  customDuration: number;
  targetTime: number | null;
  displayTime: number;
  formattedTime: string;
  progress: number | null;
  isCompleted: boolean;
  setMode: (mode: TimerMode) => void;
  setCustomDuration: (duration: number) => void;
  start: (taskDescription?: string, categoryId?: number | null) => Promise<void>;
  pause: () => void;
  toggle: (taskDescription?: string, categoryId?: number | null) => void;
  reset: (options?: ResetOptions) => void;
  sendEvent: (event: TimerEvent) => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [mode, setModeState] = useState<TimerMode>('standard');
  const [customDuration, setCustomDurationState] = useState(25);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const targetTime = useMemo(() => {
    if (mode === 'pomodoro') return DEFAULT_POMODORO_SETTINGS.workDuration * 60;
    if (mode === 'custom') return customDuration * 60;
    return null;
  }, [mode, customDuration]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const sendEvent = useCallback(async (event: TimerEvent) => {
    const currentSessionId = sessionIdRef.current;
    if (currentSessionId === null) return;
    try {
      await addEventTimer({ timer_id: currentSessionId, event });
    } catch (error) {
      console.error('Falha ao registrar evento do timer:', error);
    }
  }, []);

  const closeSession = useCallback(async (event: Exclude<TimerEvent, 'started'>, finalElapsedTime: number) => {
    const currentSessionId = sessionIdRef.current;
    setIsRunning(false);
    setElapsedTime(finalElapsedTime);
    startTimeRef.current = null;
    sessionIdRef.current = null;
    setSessionId(null);
    if (currentSessionId === null) return;
    try {
      await addEventTimer({ timer_id: currentSessionId, event });
    } catch (error) {
      console.error('Falha ao finalizar a sessão do timer:', error);
    }
  }, []);

  const start = useCallback(async (taskDescription = '', categoryId: number | null = null) => {
    if (isRunning) return;
    const currentElapsedTime = sessionIdRef.current === null ? 0 : elapsedTime;
    if (sessionIdRef.current === null) {
      try {
        const trimmed = taskDescription.trim();
        const response = await createTimer({
          name: trimmed || (mode === 'pomodoro' ? 'Sessão Pomodoro' : mode === 'custom' ? 'Sessão personalizada' : 'Sessão padrão'),
          duration: targetTime ?? 0,
          description: trimmed || undefined,
          mode,
          ...(categoryId ? { category_id: categoryId } : {}),
        });
        sessionIdRef.current = response.id;
        setSessionId(response.id);
        setElapsedTime(0);
      } catch (error) {
        console.error('Falha ao criar a sessão do timer:', error);
        return;
      }
    } else {
      void sendEvent('unpaused');
    }
    setIsRunning(true);
    startTimeRef.current = Date.now() - currentElapsedTime * 1000;
  }, [elapsedTime, isRunning, mode, sendEvent, targetTime]);

  const pause = useCallback(() => {
    void sendEvent('paused');
    setIsRunning(false);
    startTimeRef.current = null;
  }, [sendEvent]);

  const reset = useCallback((options: ResetOptions = {}) => {
    const { recordEvent = true } = options;
    if (recordEvent) {
      void closeSession('finished', 0);
      return;
    }
    setIsRunning(false);
    setElapsedTime(0);
    startTimeRef.current = null;
    sessionIdRef.current = null;
    setSessionId(null);
  }, [closeSession]);

  const toggle = useCallback((taskDescription = '', categoryId: number | null = null) => {
    if (isRunning) {
      pause();
    } else {
      void start(taskDescription, categoryId);
    }
  }, [isRunning, pause, start]);

  const setMode = useCallback((newMode: TimerMode) => {
    if (!isRunning) setModeState(newMode);
  }, [isRunning]);

  const setCustomDuration = useCallback((duration: number) => {
    if (!isRunning) setCustomDurationState(duration);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedTime(newElapsed);
          if (targetTime !== null && newElapsed >= targetTime) {
            void closeSession('finished', targetTime);
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
  }, [closeSession, isRunning, targetTime]);

  const displayTime = targetTime !== null ? Math.max(0, targetTime - elapsedTime) : elapsedTime;
  const progress = targetTime !== null ? Math.min(100, (elapsedTime / targetTime) * 100) : null;
  const isCompleted = targetTime !== null && elapsedTime >= targetTime;

  return (
    <TimerContext.Provider value={{
      isRunning,
      elapsedTime,
      sessionId,
      mode,
      customDuration,
      targetTime,
      displayTime,
      formattedTime: formatTime(displayTime),
      progress,
      isCompleted,
      setMode,
      setCustomDuration,
      start,
      pause,
      toggle,
      reset,
      sendEvent,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimerContext must be used within TimerProvider');
  return context;
}
