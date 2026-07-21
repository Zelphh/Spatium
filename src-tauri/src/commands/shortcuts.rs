use crate::models::shortcuts::{ShortcutBinding, UpdateShortcutPayload};
use crate::services::shortcuts::{get_shortcuts_service, update_shortcut_service};
use crate::shortcuts_runtime::apply_shortcut_update;
use crate::state::AppState;

use tauri::{AppHandle, State};

#[tauri::command]
pub async fn get_shortcuts(state: State<'_, AppState>) -> Result<Vec<ShortcutBinding>, String> {
    get_shortcuts_service(&state.db).await
}

#[tauri::command]
pub async fn update_shortcut(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: UpdateShortcutPayload,
) -> Result<ShortcutBinding, String> {
    let current = get_shortcuts_service(&state.db).await?;
    let binding = current
        .into_iter()
        .find(|b| b.action_id == payload.action_id)
        .ok_or_else(|| "Ação não encontrada".to_string())?;

    // Registra no SO primeiro: se o combo já estiver em uso por outro app, a falha
    // acontece aqui e o banco nunca fica com um atalho que não está realmente ativo.
    apply_shortcut_update(&app, &binding.keys, &payload.keys, &binding.action)?;

    if let Err(e) = update_shortcut_service(&state.db, payload.action_id, &payload.keys).await {
        let _ = apply_shortcut_update(&app, &payload.keys, &binding.keys, &binding.action);
        return Err(e);
    }

    Ok(ShortcutBinding {
        keys: payload.keys,
        ..binding
    })
}
