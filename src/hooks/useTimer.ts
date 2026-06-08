import { useTimerContext } from '@/contexts/TimerContext';

export function useTimer() {
  return useTimerContext();
}
