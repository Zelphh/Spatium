use crate::state::AppState;
use crate::models::history::HistoryDataResponse;
use crate::services::history::get_history_data_service;

use tauri::State;

#[tauri::command]
pub async fn get_history_data(state: State<'_, AppState>) -> Result<HistoryDataResponse, String> {
    get_history_data_service(&state.db).await
}
