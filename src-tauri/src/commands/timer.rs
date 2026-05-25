use serde::{Serialize, Deserialize};

#[derive(Deserialize)]
pub struct CreateTimerPayload {
    pub name: String,
    pub duration: i64,
}

#[derive(Serialize)]
pub struct CreateTimerResponse {
    pub id: i64,
}

#[tauri::command]
pub async fn create_timer(
    payload: CreateTimerPayload,
) -> Result<CreateTimerResponse, String> {

    // Simulação de insert no banco
    // depois você colocaria sqlx/sqlite aqui

    let generated_id = 1;

    Ok(CreateTimerResponse {
        id: generated_id,
    })
}