import { invoke } from "@tauri-apps/api/core";

export interface SessionListItem {
  id: number;
  category: string;
  category_color: string;
  mode: string;
  description: string;
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

export interface SerieData {
  name: string;
  data: number[];
  color: string;
}

export interface ChartData {
  label: string;
  categories: string[];
  series: SerieData[];
}

export function getDashboardChart(periodicity: string, date: string) {
  return invoke<ChartData>("get_dashboard_chart_data", { periodicity, date });
}


