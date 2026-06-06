use chrono::{Duration, Utc};
use sqlx::SqlitePool;

// (hour, minute, duration_mins, mode, description)
const TEMPLATES: &[(u32, u32, i64, &str, Option<&str>)] = &[
    (8,  30, 25,  "pomodoro", Some("Foco matinal")),
    (9,  0,  50,  "pomodoro", Some("Revisão de tarefas")),
    (10, 0,  45,  "pomodoro", Some("Sprint planning")),
    (11, 0,  60,  "standard", Some("Trabalho focado")),
    (12, 30, 30,  "standard", Some("Task rápida")),
    (13, 30, 45,  "standard", Some("Sessão da tarde")),
    (14, 0,  75,  "standard", Some("Desenvolvimento")),
    (15, 30, 90,  "standard", Some("Projeto principal")),
    (16, 0,  30,  "standard", Some("Code review")),
    (17, 0,  60,  "custom",   Some("Estudo técnico")),
    (19, 0,  50,  "standard", Some("Estudo noturno")),
    (20, 0,  90,  "standard", Some("Projeto pessoal")),
    (20, 30, 120, "standard", Some("Maratona de jogos")),
    (21, 0,  60,  "standard", Some("Revisão final")),
    (22, 0,  45,  "standard", None),
];

pub async fn seed_sessions(pool: &SqlitePool) -> Result<usize, String> {
    let today_midnight = Utc::now()
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap()
        .and_utc();

    let mut total = 0usize;

    for day_idx in 0i64..30 {
        let num_sessions = 2 + (day_idx % 3) as usize; // 2, 3, or 4 sessions per day

        for slot in 0..num_sessions {
            let tmpl_idx = ((day_idx as usize * 3) + slot) % TEMPLATES.len();
            let &(hour, minute, duration_mins, mode, description) = &TEMPLATES[tmpl_idx];

            let category_id: i64 = if hour >= 19 && (day_idx + slot as i64) % 3 == 0 {
                3 // Games — evening, occasionally
            } else if (day_idx + slot as i64) % 2 == 0 {
                1 // Work
            } else {
                2 // Study
            };

            let session_start = today_midnight
                - Duration::days(day_idx)
                + Duration::hours(hour as i64)
                + Duration::minutes(minute as i64);
            let session_end = session_start + Duration::minutes(duration_mins);

            let start_ts = session_start.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
            let end_ts = session_end.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();

            let result = sqlx::query(
                r#"INSERT INTO timer_session
                   (user_id, category_id, mode, duration_secs, description, created_at)
                   VALUES (1, ?1, ?2, ?3, ?4, ?5)"#,
            )
            .bind(category_id)
            .bind(mode)
            .bind(duration_mins * 60)
            .bind(description)
            .bind(&start_ts)
            .execute(pool)
            .await
            .map_err(|e| format!("Erro ao inserir sessão: {e}"))?;

            let session_id = result.last_insert_rowid();

            sqlx::query(
                "INSERT INTO timer_session_event (session_id, event, created_at) VALUES (?1, 'started', ?2)",
            )
            .bind(session_id)
            .bind(&start_ts)
            .execute(pool)
            .await
            .map_err(|e| format!("Erro ao inserir evento started: {e}"))?;

            sqlx::query(
                "INSERT INTO timer_session_event (session_id, event, created_at) VALUES (?1, 'finished', ?2)",
            )
            .bind(session_id)
            .bind(&end_ts)
            .execute(pool)
            .await
            .map_err(|e| format!("Erro ao inserir evento finished: {e}"))?;

            total += 1;
        }
    }

    Ok(total)
}

pub async fn clear_sessions(pool: &SqlitePool) -> Result<usize, String> {
    sqlx::query(
        "DELETE FROM timer_session_event WHERE session_id IN (SELECT id FROM timer_session WHERE user_id = 1)",
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Erro ao limpar eventos: {e}"))?;

    let result = sqlx::query("DELETE FROM timer_session WHERE user_id = 1")
        .execute(pool)
        .await
        .map_err(|e| format!("Erro ao limpar sessões: {e}"))?;

    Ok(result.rows_affected() as usize)
}
