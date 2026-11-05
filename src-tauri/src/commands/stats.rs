use tauri::State;

use crate::models::stats::StatsData;
use crate::services::stats;
use crate::state::AppState;

#[tauri::command]
pub async fn get_stats_data(
    state: State<'_, AppState>,
    periodicity: String,
    date: String,
) -> Result<StatsData, String> {
    stats::get_stats_data(&state.db, 1, periodicity, date).await
}
