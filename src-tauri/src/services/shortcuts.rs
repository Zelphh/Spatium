use sqlx::SqlitePool;

use crate::models::shortcuts::ShortcutBinding;
use crate::repositories::shortcuts::{get_effective_shortcuts, upsert_shortcut_key};

pub async fn get_shortcuts_service(pool: &SqlitePool) -> Result<Vec<ShortcutBinding>, String> {
    get_effective_shortcuts(pool).await
}

pub async fn update_shortcut_service(
    pool: &SqlitePool,
    action_id: i64,
    keys: &str,
) -> Result<(), String> {
    upsert_shortcut_key(pool, action_id, keys).await
}
