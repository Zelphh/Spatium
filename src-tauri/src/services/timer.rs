// use tauri::webview::NewWindowResponse::Create;

// use serde::{Deserialize, Serialize};
use crate::models::timer::{CreateTimerPayload, CreateTimerResponse};

pub async fn create_timer_service(
    payload: CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {
    let CreateTimerPayload {
        name,
        duration,
        description
    } = payload;

    print!("Creating timer with name: {:?}, duration: {}, description: {:?}",
    name, duration, description);

    let generated_id = 1; // Simulação de ID gerado pelo banco

    Ok(CreateTimerResponse {
        id: generated_id,
    })
}