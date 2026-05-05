use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) {
    let sql = include_str!("./migrations/init.sql");

    sqlx::query(sql)
        .execute(pool)
        .await
        .expect("Erro ao rodar migrations");
}