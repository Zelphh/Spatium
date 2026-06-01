import { invoke } from "@tauri-apps/api/core";
import { TimerMode } from "@/pages/type";

export type TimerEvent = "started" | "finished" | "paused" | "unpaused";

export interface CreateTimerPayload {
  name: string;
  duration: number;
  description?: string;
  mode: TimerMode;
}

export interface CreateTimerResponse {
  id: number;
}

export interface AddTimerEventPayload {
  timer_id: number;
  event: TimerEvent;
}

export interface AddTimerEventResponse {
  id: number;
}

export interface ChangeCategoryPayload {
  session_id: number;
  category_id: number;
}

export function createTimer(payload: CreateTimerPayload) {
  return invoke<CreateTimerResponse>("create_timer", { payload });
}

export function addEventTimer(payload: AddTimerEventPayload) {
  return invoke<AddTimerEventResponse>("add_event_timer", { payload });
}

export function changeCategory(payload: ChangeCategoryPayload) {
  return invoke("change_timer_category", { payload });
}

export const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
