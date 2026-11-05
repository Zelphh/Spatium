use serde::Serialize;
use sqlx::FromRow;

/// Sessão finalizada usada como matéria-prima das estatísticas.
#[derive(FromRow)]
pub struct StatsSessionRow {
    pub category: String,
    pub color: String,
    pub duration_secs: i64,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct CategoryStat {
    pub name: String,
    pub color: String,
    pub total_secs: i64,
    pub prev_total_secs: i64,
    /// Segundos por período, do mais antigo ao atual (alinhado com `evolution_labels`).
    pub evolution: Vec<i64>,
}

#[derive(Serialize)]
pub struct DurationDistribution {
    /// Menos de 25 min
    pub short: i64,
    /// 25 a 60 min
    pub medium: i64,
    /// Mais de 60 min
    pub long: i64,
}

#[derive(Serialize)]
pub struct StatsData {
    pub total_secs: i64,
    pub prev_total_secs: i64,
    pub session_count: i64,
    pub avg_secs: i64,
    pub longest_secs: i64,
    pub best_label: String,
    pub best_value: Option<String>,
    pub streak_days: i64,
    /// Quantidade de dias do período (usado para calcular a meta).
    pub period_days: i64,
    pub categories: Vec<CategoryStat>,
    pub evolution_labels: Vec<String>,
    pub distribution: DurationDistribution,
    /// 7 linhas (Seg..Dom) x 24 colunas (horas) com segundos de foco.
    pub heatmap: Vec<Vec<i64>>,
}
