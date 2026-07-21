use sqlx::SqlitePool;

use crate::models::shortcuts::ShortcutBinding;

pub async fn get_effective_shortcuts(pool: &SqlitePool) -> Result<Vec<ShortcutBinding>, String> {
    sqlx::query_as(
        r#"
        SELECT
            a.id AS action_id,
            a.action,
            a.action_label,
            COALESCE(
                (
                    SELECT sk.keys
                    FROM shortcut_key sk
                    WHERE sk.action_id = a.id
                      AND sk.user_id = 1
                      AND sk.deleted_at IS NULL
                    ORDER BY sk.created_at DESC
                    LIMIT 1
                ),
                a.default_key
            ) AS keys
        FROM action a
        ORDER BY a.id
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|error| format!("Falha ao buscar atalhos: {error}"))
}

pub async fn upsert_shortcut_key(
    pool: &SqlitePool,
    action_id: i64,
    keys: &str,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE shortcut_key
        SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE user_id = 1 AND action_id = ?1 AND deleted_at IS NULL
        "#,
    )
    .bind(action_id)
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao remover atalho anterior: {error}"))?;

    sqlx::query(
        r#"
        INSERT INTO shortcut_key (user_id, action_id, keys)
        VALUES (1, ?1, ?2)
        "#,
    )
    .bind(action_id)
    .bind(keys)
    .execute(pool)
    .await
    .map_err(|error| format!("Falha ao salvar novo atalho: {error}"))?;

    Ok(())
}
