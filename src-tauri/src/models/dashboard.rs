use serde::Serialize;
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct SessionListItem {
    pub id: i64,
    pub category: String,
    pub mode: String,
    pub description: String,
    pub duration_secs: i64,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct DashboardDataResponse {
    pub today_hours: f64,
    pub week_hours: f64,
    pub daily_avg_hours: f64,
    pub recent_total_secs: i64,
    pub recent_sessions: Vec<SessionListItem>,
}

#[derive(Serialize)]
pub struct SerieData {
    pub name: String,
    pub data: Vec<i64>,
}

#[derive(Serialize)]
pub struct ChartData {
    pub label: String,
    pub categories: Vec<String>,
    pub series: Vec<SerieData>,
}
