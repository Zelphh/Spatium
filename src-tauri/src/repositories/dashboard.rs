use sqlx::SqlitePool;

use crate::models::timer::{DashboardDataResponse, SessionListItem};

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
        SELECT COALESCE(ROUND(SUM(duration_secs) / 3600.0, 2), 0.0)
        FROM timer_session
        WHERE user_id = ?1
          AND date(created_at) >= date('now', 'weekday 0', '-6 days')
          AND date(created_at) < date(date('now', 'weekday 0', '-6 days'), '+7 days')
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|error| format!("Falha ao buscar horas da semana: {error}"))?;

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
            mode,
            description,
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

    let recent_total_secs: i64 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(SUM(duration_secs), 0)
        FROM (
            SELECT duration_secs
            FROM vw_history_sessions
            WHERE user_id = ?1
            ORDER BY datetime(created_at) DESC
            LIMIT 5
        )
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|error| format!("Falha ao buscar total de sessões recentes: {error}"))?;

    Ok(DashboardDataResponse {
        today_hours,
        week_hours,
        daily_avg_hours,
        recent_total_secs,
        recent_sessions,
    })
}
