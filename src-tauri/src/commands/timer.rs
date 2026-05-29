use crate::models::timer::{
    AddTimerEventPayload,
    CreateTimerPayload,
    CreateTimerResponse,
    TimerEventResponse,
};
use crate::services::timer::{
    add_event_timer_service,
    create_timer_service,
};
use crate::state::AppState;

use tauri::State;

#[tauri::command]
pub async fn create_timer(
    state: State<'_, AppState>,
    payload: CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {

    create_timer_service(&state.db, payload).await
}

#[tauri::command]
pub async fn add_event_timer(
    state: State<'_, AppState>,
    payload: AddTimerEventPayload,
) -> Result<TimerEventResponse, String> {
    add_event_timer_service(&state.db, payload).await
}
