use crate::models::timer::{CreateTimerPayload, CreateTimerResponse};
use crate::services::timer::create_timer_service;

#[tauri::command]
pub async fn create_timer(
    payload: CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {

    let response = create_timer_service(payload).await;
    return response
}

#[tauri::command]
pub async fn add_event_timer(
    _payload: CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {

    // Simulação de insert no banco
    // depois você colocaria sqlx/sqlite aqui

    Ok(CreateTimerResponse { id: 1 })
}