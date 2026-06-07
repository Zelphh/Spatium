export type TimerMode = "standard" | "pomodoro" | "custom";

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string | null;
}

export interface TimerSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  mode: TimerMode;
  category: Category;
  isCompleted: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number; // in seconds
  mode: TimerMode;
  category: Category | null;
  pomodoroSettings: {
    workDuration: number; // in minutes
    breakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };
  customDuration: number; // in minutes
}

export const DEFAULT_POMODORO_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};
