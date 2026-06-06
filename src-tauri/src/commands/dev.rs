use crate::repositories::dev::{clear_sessions, seed_sessions};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn seed_sample_data(state: State<'_, AppState>) -> Result<String, String> {
    if !cfg!(debug_assertions) {
        return Err("Disponível apenas em modo de desenvolvimento.".to_string());
    }
    let count = seed_sessions(&state.db).await?;
    Ok(format!("{count} sessões de exemplo geradas com sucesso!"))
}

#[tauri::command]
pub async fn clear_sample_data(state: State<'_, AppState>) -> Result<String, String> {
    if !cfg!(debug_assertions) {
        return Err("Disponível apenas em modo de desenvolvimento.".to_string());
    }
    let count = clear_sessions(&state.db).await?;
    Ok(format!("{count} sessões removidas com sucesso!"))
}
