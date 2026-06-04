import { invoke } from "@tauri-apps/api/core";
import { SessionListItem } from "./dashboard";

export interface HistoryDataResponse {
  total_secs: number;
  sessions: SessionListItem[];
}

export function getHistoryData() {
  return invoke<HistoryDataResponse>("get_history_data");
}