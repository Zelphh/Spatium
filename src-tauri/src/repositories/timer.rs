use sqlx::{sqlite::SqliteQueryResult, SqlitePool};

use crate::models::timer::{AddTimerEventPayload, CreateTimerPayload};

pub async fn insert_timer_session(
    pool: &SqlitePool,
    payload: CreateTimerPayload,
) -> Result<SqliteQueryResult, String> {
    let CreateTimerPayload {
        name,
        duration,
        description,
        mode,
    } = payload;

    sqlx::query(
        r#"
        INSERT INTO timer_session (user_id, mode, duration_secs, notes, description)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
    )
    .bind(1_i64)
    .bind(mode)
    .bind(duration)
    .bind(name)
    .bind(description)
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao criar a sessão do timer: {error}"))
}

pub async fn insert_timer_event(
    pool: &SqlitePool,
    payload: AddTimerEventPayload,
) -> Result<SqliteQueryResult, String> {
    let AddTimerEventPayload { timer_id, event } = payload;

    sqlx::query(
        r#"
        INSERT INTO timer_session_event (session_id, event)
        VALUES (?1, ?2)
        "#,
    )
    .bind(timer_id)
    .bind(event.as_str())
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao registrar evento do timer: {error}"))
}