// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;

mod models;

mod repositories {
    pub mod timer;
    pub mod dashboard;
    pub mod history;
    pub mod dev;
    pub mod shortcuts;
}

mod services {
    pub mod timer;
    pub mod dashboard;
    pub mod history;
    pub mod shortcuts;
}

mod commands {
    pub mod timer;
    pub mod dashboard;
    pub mod history;
    pub mod dev;
    pub mod shortcuts;
}
mod db {
    pub mod pool;
    pub mod connection;
    pub mod migrations;
}
mod shortcuts_runtime;

use commands::timer::create_timer;
use commands::timer::get_active_timer_session;
use commands::timer::add_event_timer;
use commands::timer::change_timer_category;
use commands::timer::change_timer_description;
use commands::timer::change_timer_notes;
use commands::timer::get_categories;
use commands::timer::create_category;
use commands::timer::update_category;
use commands::timer::delete_category;
use commands::dashboard::get_dashboard_data;
use commands::dashboard::get_dashboard_chart_data;
use commands::history::get_history_data;
use commands::dev::{seed_sample_data, clear_sample_data};
use commands::shortcuts::{get_shortcuts, update_shortcut};

use state::AppState;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

use db::{
    pool::create_pool,
    connection::get_database_url,
    migrations::{run_migrations, run_seeds},
};

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden".into()]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(shortcuts_runtime::handle_shortcut_event)
                .build(),
        )
        .setup(|app| {
            if std::env::args().any(|arg| arg == "--hidden") {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let init_result = initialize_database(&app_handle).await;
                let state = match init_result {
                    Ok(state) => state,
                    Err(e) => {
                        eprintln!("✗ Falha ao inicializar o banco de dados: {}", e);
                        std::process::exit(1);
                    }
                };

                #[cfg(debug_assertions)]
                println!("✓ Database iniciado com sucesso");

                if let Err(e) = shortcuts_runtime::register_all_from_db(&app_handle, &state.db).await {
                    eprintln!("✗ Falha ao registrar atalhos globais: {e}");
                }
                #[cfg(debug_assertions)]
                if let Ok(list) = services::shortcuts::get_shortcuts_service(&state.db).await {
                    println!("[debug] atalhos efetivos: {:?}", list);
                }

                app_handle.manage(state);
            });

            let show_item = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
            let quick_start_item =
                MenuItem::with_id(app, "quick_start", "Início Rápido", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_item, &quick_start_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quick_start" => {
                        shortcuts_runtime::open_quick_start_window(app);
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "main" {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            create_timer,
            get_active_timer_session,
            add_event_timer,
            change_timer_category,
            change_timer_description,
            change_timer_notes,
            get_dashboard_data,
            get_dashboard_chart_data,
            get_history_data,
            seed_sample_data,
            clear_sample_data,
            get_categories,
            create_category,
            update_category,
            delete_category,
            get_shortcuts,
            update_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao rodar app");
}

async fn initialize_database(app_handle: &tauri::AppHandle) -> Result<AppState, String> {
    let database_url = get_database_url(app_handle);
    let pool = create_pool(&database_url).await;
    run_migrations(&pool).await;
    run_seeds(&pool).await.expect("✗ Erro ao rodar seeds\n");
    
    Ok(AppState { db: pool })
}