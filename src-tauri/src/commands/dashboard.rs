use crate::state::AppState;
use crate::models::timer::DashboardDataResponse;
use crate::services::dashboard::get_dashboard_data_service;

use tauri::State;

#[tauri::command]
pub async fn get_dashboard_data(state: State<'_, AppState>) -> Result<DashboardDataResponse, String> {
    get_dashboard_data_service(&state.db).await
}
