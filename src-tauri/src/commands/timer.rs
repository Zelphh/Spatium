use crate::models::timer::{
    AddTimerEventPayload, Category, ChangeCategoryPayload, ChangeDescriptionPayload, ChangeNotesPayload, CreateCategoryPayload, CreateTimerPayload, CreateTimerResponse, TimerEventResponse
};
use crate::services::timer::{
    add_event_timer_service,
    change_timer_category_service,
    change_timer_description_service,
    change_timer_notes_service,
    create_category_service,
    create_timer_service, get_categories_service,
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

#[tauri::command]
pub async fn change_timer_category(
    state: State<'_, AppState>,
    payload: ChangeCategoryPayload,
) -> Result<(), String> {
    change_timer_category_service(&state.db, payload).await
}

#[tauri::command]
pub async fn change_timer_description(
    state: State<'_, AppState>,
    payload: ChangeDescriptionPayload,
) -> Result<(), String> {
    change_timer_description_service(&state.db, payload).await
}

#[tauri::command]
pub async fn change_timer_notes(
    state: State<'_, AppState>,
    payload: ChangeNotesPayload,
) -> Result<(), String> {
    change_timer_notes_service(&state.db, payload).await
}

#[tauri::command]
pub async fn get_categories(state: State<'_, AppState>) -> Result<Vec<Category>, String> {
    get_categories_service(&state.db).await
}

#[tauri::command]
pub async fn create_category(
    state: State<'_, AppState>,
    payload: CreateCategoryPayload,
) -> Result<Category, String> {
    create_category_service(&state.db, payload).await
}

