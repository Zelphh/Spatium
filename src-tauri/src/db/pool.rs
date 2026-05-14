use sqlx::{
    SqlitePool, sqlite::{SqliteConnectOptions, SqliteJournalMode}
};
use std::str::FromStr;

pub async fn create_pool(database_url: &str) -> SqlitePool {

    let options = SqliteConnectOptions::from_str(database_url)
        .expect("URL inválida")
        .journal_mode(SqliteJournalMode::Wal)
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(options)
        .await
        .expect(&format!(
            "Erro ao conectar no banco! URL: {}",
            database_url
        ));
    print!("✓ Pool criado com sucesso\n");
    return pool;
}