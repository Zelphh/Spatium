import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spatium-focus-goal";
const EVENT = "spatium-focus-goal-change";
export const FOCUS_GOAL_MIN = 0.5;
export const FOCUS_GOAL_MAX = 12;
const DEFAULT_GOAL = 4;

function readGoal(): number {
  try {
    const v = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(v) && v >= FOCUS_GOAL_MIN && v <= FOCUS_GOAL_MAX) return v;
  } catch {
    /* localStorage indisponível */
  }
  return DEFAULT_GOAL;
}

/** Meta diária de foco em horas, persistida no localStorage. */
export function useFocusGoal() {
  const [goal, setGoalState] = useState<number>(readGoal);

  useEffect(() => {
    const sync = () => setGoalState(readGoal());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setGoal = useCallback((value: number) => {
    const next = Math.min(FOCUS_GOAL_MAX, Math.max(FOCUS_GOAL_MIN, Math.round(value * 2) / 2));
    setGoalState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* ignora */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { goal, setGoal };
}

export function formatGoalHours(hours: number) {
  return `${String(hours).replace(".", ",")}h`;
}
