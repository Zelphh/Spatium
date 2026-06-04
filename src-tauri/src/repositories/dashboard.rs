use std::collections::HashMap;
use sqlx::SqlitePool;

use crate::models::dashboard::{DashboardDataResponse, SerieData, SessionBucketData, SessionListItem, SessionsToChartData};

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

pub async fn fetch_series_data(
    pool: &SqlitePool,
    user_id: i64,
    periodicity: &str,
    n_buckets: usize,
) -> Result<Vec<SerieData>, String> {
    let (bucket_expr, filter) = match periodicity {
        "day" => (
            "CAST(strftime('%H', tse.created_at) AS INTEGER)",
            "AND date(tse.created_at) = date('now')",
        ),
        "week" => (
            "CAST(strftime('%w', tse.created_at) AS INTEGER)",
            "AND date(tse.created_at) >= date('now', 'weekday 0', '-6 days') AND date(tse.created_at) < date(date('now', 'weekday 0', '-6 days'), '+7 days')",
        ),
        "month" => (
            "CAST(strftime('%d', tse.created_at) AS INTEGER)",
            "AND strftime('%Y-%m', tse.created_at) = strftime('%Y-%m', 'now')",
        ),
        _ => return Err("Periodicidade não suportada".to_string()),
    };

    let query = format!(
        r#"
        SELECT
            {bucket_expr} AS bucket,
            SUM(ts.duration_secs) / 60 AS minutes,
            COALESCE(c.name, 'Sem categoria') AS category
        FROM timer_session ts
        JOIN timer_session_event tse ON ts.id = tse.session_id AND tse.event = 'finished'
        LEFT JOIN category c ON ts.category_id = c.id
        WHERE ts.user_id = ?1
        {filter}
        GROUP BY category, bucket
        ORDER BY category, bucket
        "#
    );

    let rows: Vec<SessionBucketData> = sqlx::query_as(&query)
        .bind(user_id)
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Falha ao buscar dados do gráfico: {e}"))?;

    let mut map: HashMap<String, Vec<i64>> = HashMap::new();
    for row in rows {
        let entry = map.entry(row.category).or_insert_with(|| vec![0; n_buckets]);
        let idx = if periodicity == "month" {
            (row.bucket - 1) as usize
        } else {
            row.bucket as usize
        };
        if idx < n_buckets {
            entry[idx] = row.minutes;
        }
    }

    Ok(map.into_iter().map(|(name, data)| SerieData { name, data }).collect())
}
