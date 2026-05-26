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

export function createTimer(payload: CreateTimerPayload) {
  return invoke<CreateTimerResponse>("create_timer", { payload });
}

export function addEventTimer(payload: AddTimerEventPayload) {
  return invoke<AddTimerEventResponse>("add_event_timer", { payload });
}