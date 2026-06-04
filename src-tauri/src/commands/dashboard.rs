use crate::state::AppState;
use crate::models::dashboard::{ChartData, DashboardDataResponse};
use crate::services::dashboard::{get_dashboard_chart, get_dashboard_data_service};

use tauri::State;

#[tauri::command]
pub async fn get_dashboard_data(state: State<'_, AppState>) -> Result<DashboardDataResponse, String> {
    get_dashboard_data_service(&state.db).await
}

#[tauri::command]
pub async fn get_dashboard_chart_data(
    state: State<'_, AppState>,
    periodicity: String,
) -> Result<ChartData, String> {
    get_dashboard_chart(&state.db, 1, periodicity).await
}
