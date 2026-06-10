use sqlx::SqlitePool;

use crate::models::dashboard::{SessionListItem};
use crate::models::history::{HistoryDataResponse};

pub async fn fetch_history_data(
    pool: &SqlitePool,
    user_id: i64,
) -> Result<HistoryDataResponse, String> {
    let total_secs: i64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(SUM(duration_secs), 0)
        FROM timer_session
        WHERE user_id = ?1
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|error| format!("Falha ao buscar total do histórico: {error}"))?;

    let sessions: Vec<SessionListItem> = sqlx::query_as(
        r#"
        SELECT
            id,
            category_name  AS category,
            category_color,
            mode,
            description,
            duration_secs,
            created_at
        FROM vw_history_sessions
        WHERE user_id = ?1
        ORDER BY datetime(created_at) DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|error| format!("Falha ao buscar sessões do histórico: {error}"))?;

    Ok(HistoryDataResponse { total_secs, sessions })
}
