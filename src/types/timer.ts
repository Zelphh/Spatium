export type TimerMode = 'standard' | 'pomodoro' | 'custom';

export type CategoryType = 'work' | 'study' | 'games' | 'custom';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
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

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Trabalho', type: 'work', color: 'category-work' },
  { id: 'study', name: 'Estudo', type: 'study', color: 'category-study' },
  { id: 'games', name: 'Jogos', type: 'games', color: 'category-games' },
];

export const DEFAULT_POMODORO_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};
