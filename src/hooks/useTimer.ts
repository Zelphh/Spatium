import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DEFAULT_POMODORO_SETTINGS, TimerMode } from '@/pages/type';
import {
  addEventTimer,
  createTimer,
  type AddTimerEventPayload,
  type TimerEvent,
} from '@/lib/timer';

interface UseTimerProps {
  mode: TimerMode;
  customDuration?: number;
  taskDescription?: string;
  categoryId?: number | null;
}

interface ResetOptions {
  recordEvent?: boolean;
}

export function useTimer({
  mode,
  customDuration = 25,
  taskDescription = '',
  categoryId,
}: UseTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const targetTime = useMemo(() => {
    if (mode === 'pomodoro') {
      return DEFAULT_POMODORO_SETTINGS.workDuration * 60;
    }

    if (mode === 'custom') {
      return customDuration * 60;
    }

    return null;
  }, [mode, customDuration]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const buildCreatePayload = useCallback(() => {
    const trimmedDescription = taskDescription.trim();

    return {
      name:
        trimmedDescription ||
        (mode === 'pomodoro'
          ? 'Sessão Pomodoro'
          : mode === 'custom'
            ? 'Sessão personalizada'
            : 'Sessão padrão'),
      duration: targetTime ?? 0,
      description: trimmedDescription || undefined,
      mode,
      ...(categoryId ? { category_id: categoryId } : {}),
    };
  }, [categoryId, mode, targetTime, taskDescription]);

  const sendEvent = useCallback(async (event: TimerEvent) => {
    const currentSessionId = sessionIdRef.current;

    if (currentSessionId === null) {
      return;
    }

    const payload: AddTimerEventPayload = {
      timer_id: currentSessionId,
      event,
    };

    try {
      await addEventTimer(payload);
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

    if (currentSessionId === null) {
      return;
    }

    try {
      await addEventTimer({
        timer_id: currentSessionId,
        event,
      });
    } catch (error) {
      console.error('Falha ao finalizar a sessão do timer:', error);
    }
  }, []);

  const start = useCallback(async () => {
    if (!isRunning) {
      const currentElapsedTime = sessionIdRef.current === null ? 0 : elapsedTime;

      if (sessionIdRef.current === null) {
        try {
          const response = await createTimer(buildCreatePayload());

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
    }
  }, [buildCreatePayload, elapsedTime, isRunning, sendEvent]);

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

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      void start();
    }
  }, [isRunning, pause, start]);

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
    sessionId,
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
