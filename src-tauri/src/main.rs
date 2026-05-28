// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;

mod models;

mod repositories {
    pub mod timer;
}

mod services {
    pub mod timer;
}

mod commands {
    pub mod timer;
    // pub mod category;
    // pub mod task;
}
mod db {
    pub mod pool;
    pub mod connection;
    pub mod migrations;
}

use commands::timer::create_timer;
use commands::timer::add_event_timer;
use commands::timer::get_dashboard_data;
use commands::timer::get_history_data;

use state::AppState;
use tauri::Manager;

use db::{
    pool::create_pool,
    connection::get_database_url,
    migrations::{run_migrations, run_seeds},
};

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                match initialize_database(&app_handle).await {
                    Ok(state) => {
                        app_handle.manage(state);
                        #[cfg(debug_assertions)]
                        println!("✓ Database iniciado com sucesso");
                    }
                    Err(e) => {
                        eprintln!("✗ Falha ao inicializar o banco de dados: {}", e);
                        std::process::exit(1);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_timer,
            add_event_timer,
            get_dashboard_data,
            get_history_data,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao rodar app");
}

async fn initialize_database(app_handle: &tauri::AppHandle) -> Result<AppState, Box<dyn std::error::Error>> {
    let database_url = get_database_url(app_handle);
    let pool = create_pool(&database_url).await;
    run_migrations(&pool).await;
    run_seeds(&pool).await.expect("✗ Erro ao rodar seeds\n");
    
    Ok(AppState { db: pool })
}