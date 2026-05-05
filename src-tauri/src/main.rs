// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;
mod db {
    pub mod pool;
    pub mod connection;
    pub mod migrations;
}

use state::AppState;
use db::{
    pool::create_pool,
    connection::get_database_url,
    migrations::run_migrations,
};

#[tokio::main]
async fn main() {
    let database_url = get_database_url();

    let pool = create_pool(&database_url).await;

    run_migrations(&pool).await;

    tauri::Builder::default()
        .manage(AppState { db: pool })
        .invoke_handler(tauri::generate_handler![
            // seus commands
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao rodar app");
}