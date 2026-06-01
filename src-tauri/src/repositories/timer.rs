use sqlx::{sqlite::SqliteQueryResult, SqlitePool};
use chrono::{DateTime};

use crate::models::timer::{
    AddTimerEventPayload, ChangeCategoryPayload,
    CreateTimerPayload,
    // SessionListItem,
};

pub async fn calc_session_duration_secs(pool: &SqlitePool, session_id: &i64) -> Result<i64, String> {
    let events: Vec<(String, String)> = sqlx::query_as(
        r#"
        SELECT event, created_at FROM timer_session_event
         WHERE session_id = ?1
         ORDER BY created_at ASC
        "#,
    )
    .bind(session_id)
    .fetch_all(pool)
    .await
    .map_err(|error| format!("Falha ao obter a duração da sessão do timer: {error}"))?;

    let mut total_secs: i64 = 0;
    let mut start_time: Option<i64> = None;

    for (event, created_at) in events {
        let timestamp = DateTime::parse_from_rfc3339(&created_at)
            .map_err(|e| format!("Falha ao parsear created_at: {e}"))?
            .timestamp();

        match event.as_str() {
            "started" | "unpaused" => {
                start_time = Some(timestamp);
            }
            "paused" | "finished" => {
                if let Some(start) = start_time {
                    total_secs += timestamp - start;
                    start_time = None;
                }
            }
            _ => {}
        }
    }

    Ok(total_secs)
}

pub async fn add_total_secs_to_session(
    pool: &SqlitePool,
    session_id: i64,
    total_secs: i64,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE timer_session
        SET duration_secs = ?1
        WHERE id = ?2
        "#,
    )
    .bind(total_secs)
    .bind(session_id)
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao atualizar a duração da sessão do timer: {error}"))?;
    Ok(())
}

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
    payload: &AddTimerEventPayload,
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

pub async fn change_category(
    pool: &SqlitePool,
    payload: ChangeCategoryPayload,
) -> Result<SqliteQueryResult, String> {
    let ChangeCategoryPayload { session_id, category_id } = payload;

    sqlx::query(
        r#"
        UPDATE timer_session
        SET category_id = ?1
        WHERE id = ?2
        "#,
    )
    .bind(category_id)
    .bind(session_id)
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao vincular categoria à sessão do timer: {error}"))
}

