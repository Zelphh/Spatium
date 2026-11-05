use sqlx::SqlitePool;

use crate::models::stats::StatsSessionRow;

/// Todas as sessões finalizadas do usuário. O recorte por período é feito no service,
/// em horário local, já que `created_at` é armazenado em UTC.
pub async fn fetch_finished_sessions(
    pool: &SqlitePool,
    user_id: i64,
) -> Result<Vec<StatsSessionRow>, String> {
    sqlx::query_as(
        r#"
        SELECT
            COALESCE(c.name, 'Sem categoria') AS category,
            COALESCE(c.color, '#6b7280')      AS color,
            ts.duration_secs,
            ts.created_at
        FROM timer_session ts
        LEFT JOIN category c ON ts.category_id = c.id
        WHERE ts.user_id = ?1
          AND ts.deleted_at IS NULL
          AND EXISTS (
              SELECT 1 FROM timer_session_event tse
              WHERE tse.session_id = ts.id AND tse.event = 'finished'
          )
        ORDER BY ts.created_at
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Falha ao buscar sessões para estatísticas: {e}"))
}
