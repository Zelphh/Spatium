use std::fs;
use std::path::PathBuf;

use tauri::Manager;

pub fn get_database_url(app: &tauri::AppHandle) -> String {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .expect("Erro ao obter AppData");

    println!("AppData dir: {:?}", app_data_dir);

    fs::create_dir_all(&app_data_dir)
        .expect("Erro ao criar diretório AppData");

    let db_path = app_data_dir.join("app.db");

    format!(
        "sqlite:{}",
        db_path.to_string_lossy().replace("\\", "/")
    )
}