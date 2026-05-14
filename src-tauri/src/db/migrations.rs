use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) {
    sqlx::migrate!("./src/db/migrations")
        .run(pool)
        .await
        .expect("Erro ao rodar migrations");

    print!("✓ Migrations aplicadas com sucesso\n");
}

pub async fn run_seeds(pool: &SqlitePool) -> Result<(), sqlx::Error> {

    let exists: Option<i64> = sqlx::query_scalar(
        "SELECT id FROM user LIMIT 1"
    )
    .fetch_optional(pool)
    .await?;

    if exists.is_some() {
        return Ok(());
    }

    let result = sqlx::query(
        r#"
        INSERT INTO user (name, created_at)
        VALUES (?1, datetime('now'))
        "#
    )
    .bind("User")
    .execute(pool)
    .await?;

    let user_id = result.last_insert_rowid();

    let categories = [
        ("Work", "#8B5CF6", "briefcase"),
        ("Study", "#3B82F6", "book"),
        ("Games", "#EC4899", "gamepad"),
    ];

    for (name, color, icon) in categories { 

        sqlx::query(
            r#"
            INSERT INTO category
            (user_id, name, color, icon, is_default)
            VALUES (?1, ?2, ?3, ?4, 1)
            "#
        )
        .bind(user_id)
        .bind(name)
        .bind(color)
        .bind(icon)
        .execute(pool)
        .await?;
    }

    Ok(())
}