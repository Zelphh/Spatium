import { invoke } from "@tauri-apps/api/core";

export type StatsPeriod = "day" | "week" | "month";

export interface CategoryStat {
  name: string;
  color: string;
  total_secs: number;
  prev_total_secs: number;
  /** Segundos por período, do mais antigo ao atual. */
  evolution: number[];
}

export interface StatsData {
  total_secs: number;
  prev_total_secs: number;
  session_count: number;
  avg_secs: number;
  longest_secs: number;
  best_label: string;
  best_value: string | null;
  streak_days: number;
  period_days: number;
  categories: CategoryStat[];
  evolution_labels: string[];
  distribution: { short: number; medium: number; long: number };
  /** 7 linhas (Seg..Dom) x 24 colunas (horas), em segundos. */
  heatmap: number[][];
}

export function getStatsData(periodicity: StatsPeriod, date: string) {
  return invoke<StatsData>("get_stats_data", { periodicity, date });
}
