import { invoke } from "@tauri-apps/api/core";

export interface SessionListItem {
  id: number;
  category: string;
  duration_secs: number;
  created_at: string;
}

export interface DashboardDataResponse {
  today_hours: number;
  week_hours: number;
  daily_avg_hours: number;
  recent_total_secs: number;
  recent_sessions: SessionListItem[];
}

export function getDashboardData() {
  return invoke<DashboardDataResponse>("get_dashboard_data");
}


