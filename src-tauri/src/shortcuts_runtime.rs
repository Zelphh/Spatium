use std::collections::HashMap;
use std::sync::Mutex;

use sqlx::SqlitePool;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutEvent, ShortcutState};

use crate::models::timer::{AddTimerEventPayload, CreateTimerPayload, TimerEventType};
use crate::services::shortcuts::get_shortcuts_service;
use crate::services::timer::{add_event_timer_service, create_timer_service, get_active_session_id_service};
use crate::state::AppState;

/// Mapa em memória de id do atalho (hash de mods+tecla) -> nome da ação (`action.action`),
/// usado pelo handler único registrado no `Builder::with_handler` para saber o que disparar.
pub struct ShortcutRegistry(pub Mutex<HashMap<u32, String>>);

fn shortcut_id(keys: &str) -> Result<u32, String> {
    keys.parse::<Shortcut>()
        .map(|s| s.id())
        .map_err(|e| format!("Atalho inválido '{keys}': {e}"))
}

/// Registra no plugin todos os atalhos persistidos no banco. Chamado uma vez no startup,
/// depois que o pool do banco está disponível.
pub async fn register_all_from_db(app: &AppHandle, pool: &SqlitePool) -> Result<(), String> {
    let bindings = get_shortcuts_service(pool).await?;

    let mut map = HashMap::new();
    let mut errors = Vec::new();

    // Cada atalho é tentado individualmente: um combo já em uso por outro app não pode
    // impedir os demais de registrar, nem deixar o `ShortcutRegistry` sem ser gerenciado
    // (chamadas futuras a `app.state::<ShortcutRegistry>()` entrariam em pânico).
    for binding in &bindings {
        match app.global_shortcut().register(binding.keys.as_str()) {
            Ok(()) => match shortcut_id(&binding.keys) {
                Ok(id) => {
                    map.insert(id, binding.action.clone());
                }
                Err(e) => errors.push(e),
            },
            Err(e) => errors.push(format!("Falha ao registrar atalho '{}': {e}", binding.keys)),
        }
    }

    app.manage(ShortcutRegistry(Mutex::new(map)));

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors.join("; "))
    }
}

/// Desregistra o atalho antigo e registra o novo. Chamado quando o usuário reatribui um
/// atalho pelas Configurações — feito ANTES de persistir no banco (ver `commands::shortcuts::update_shortcut`),
/// para que um combo já em uso por outro app nunca chegue a ser salvo.
pub fn apply_shortcut_update(
    app: &AppHandle,
    old_keys: &str,
    new_keys: &str,
    action: &str,
) -> Result<(), String> {
    if old_keys == new_keys {
        return Ok(());
    }

    app.global_shortcut()
        .register(new_keys)
        .map_err(|e| format!("Falha ao registrar atalho '{new_keys}': {e}"))?;

    let _ = app.global_shortcut().unregister(old_keys);

    let new_id = shortcut_id(new_keys)?;
    let old_id = shortcut_id(old_keys)?;

    let registry = app.state::<ShortcutRegistry>();
    let mut map = registry.0.lock().unwrap();
    map.remove(&old_id);
    map.insert(new_id, action.to_string());

    Ok(())
}

/// Handler único passado ao `Builder::with_handler`, despachado para toda ação registrada.
pub fn handle_shortcut_event(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    if event.state() != ShortcutState::Pressed {
        return;
    }

    let action = {
        let registry = app.state::<ShortcutRegistry>();
        let map = registry.0.lock().unwrap();
        map.get(&shortcut.id()).cloned()
    };

    match action.as_deref() {
        Some("start_timer_now") => {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                start_timer_now(&app).await;
            });
        }
        Some("open_quick_start") => {
            open_quick_start_window(app);
        }
        _ => {}
    }
}

/// Abre (ou foca, se já existir) a janela pequena de início rápido. Chamada tanto pelo
/// atalho global `open_quick_start` quanto pelo item "Início Rápido" do menu da bandeja.
pub fn open_quick_start_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("quick-start") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let result = tauri::webview::WebviewWindowBuilder::new(
        app,
        "quick-start",
        tauri::WebviewUrl::App("index.html?window=quick-start-popup".into()),
    )
    .title("Início Rápido")
    .inner_size(360.0, 440.0)
    .resizable(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .center()
    .build();

    if let Err(e) = result {
        eprintln!("[shortcuts] falha ao abrir janela de início rápido: {e}");
    }
}

/// Toggle sem UI: sem sessão ativa, inicia uma nova (sem categoria); com sessão ativa,
/// finaliza essa sessão. Usado pelo atalho "iniciar timer imediatamente".
async fn start_timer_now(app: &AppHandle) {
    let Some(state) = app.try_state::<AppState>() else {
        eprintln!("[shortcuts] banco de dados ainda não inicializado, ignorando atalho");
        return;
    };
    let pool: SqlitePool = state.db.clone();

    match get_active_session_id_service(&pool, 1).await {
        Ok(Some(session_id)) => {
            if let Err(e) = add_event_timer_service(
                &pool,
                AddTimerEventPayload {
                    timer_id: session_id,
                    event: TimerEventType::Finished,
                },
            )
            .await
            {
                eprintln!("[shortcuts] falha ao finalizar timer: {e}");
                return;
            }
            println!("[shortcuts] timer finalizado (session_id={session_id})");
            let _ = app.emit("timer-session-finished", session_id);
        }
        Ok(None) => {
            let payload = CreateTimerPayload {
                name: Some("Sessão rápida".to_string()),
                duration: 0,
                description: None,
                mode: "standard".to_string(),
                category_id: None,
            };
            match create_timer_service(&pool, payload).await {
                Ok(response) => {
                    println!("[shortcuts] timer iniciado (session_id={})", response.id);
                    let _ = app.emit("timer-session-started", response.id);
                }
                Err(e) => eprintln!("[shortcuts] falha ao iniciar timer: {e}"),
            }
        }
        Err(e) => eprintln!("[shortcuts] falha ao verificar sessão ativa: {e}"),
    }
}
