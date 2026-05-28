use sqlx::{sqlite::SqliteQueryResult, SqlitePool};

use crate::models::timer::{
    AddTimerEventPayload,
    CreateTimerPayload,
    DashboardDataResponse,
    HistoryDataResponse,
    SessionListItem,
};

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

pub async fn fetch_dashboard_data(
    pool: &SqlitePool,
    user_id: i64,
) -> Result<DashboardDataResponse, String> {
    let today_hours: f64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(total_hours, 0.0)
        FROM vw_daily_summary
        WHERE user_id = ?1 AND day = date('now')
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|error| format!("Falha ao buscar horas de hoje: {error}"))?
    .unwrap_or(0.0);

    let week_hours: f64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(total_hours, 0.0)
        FROM vw_weekly_summary
        WHERE user_id = ?1 AND week_start = date('now', 'weekday 1', '-7 days')
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|error| format!("Falha ao buscar horas da semana: {error}"))?
    .unwrap_or(0.0);

    let daily_avg_hours: f64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(ROUND(AVG(total_hours), 2), 0.0)
        FROM vw_daily_summary
        WHERE user_id = ?1
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|error| format!("Falha ao buscar média diária: {error}"))?;

    let recent_sessions: Vec<SessionListItem> = sqlx::query_as(
        r#"
        SELECT
            id,
            category_name AS category,
            duration_secs,
            created_at
        FROM vw_history_sessions
        WHERE user_id = ?1
        ORDER BY datetime(created_at) DESC
        LIMIT 5
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|error| format!("Falha ao buscar sessões recentes: {error}"))?;

    let recent_total_secs = recent_sessions.iter().map(|session| session.duration_secs).sum();

    Ok(DashboardDataResponse {
        today_hours,
        week_hours,
        daily_avg_hours,
        recent_total_secs,
        recent_sessions,
    })
}

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
            category_name AS category,
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