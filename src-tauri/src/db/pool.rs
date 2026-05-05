use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};

pub async fn create_pool(database_url: &str) -> SqlitePool {
    SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .expect(format!("Erro ao conectar no banco! URL: {}", database_url).as_str())
}