use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Serialize, Deserialize, Debug, Clone, FromRow)]
pub struct ShortcutBinding {
    pub action_id: i64,
    pub action: String,
    pub action_label: String,
    pub keys: String,
}

#[derive(Deserialize, Debug)]
pub struct UpdateShortcutPayload {
    pub action_id: i64,
    pub keys: String,
}
