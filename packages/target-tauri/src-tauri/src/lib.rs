use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use deltachat_jsonrpc::{
    api::{Accounts, CommandApi},
    yerpc::{RpcClient, RpcSession},
};
use futures_lite::stream::StreamExt;
use serde::Serialize;
use serde_json::error;
use tauri::{
    async_runtime::JoinHandle,
    ipc::{Channel, InvokeResponseBody, IpcResponse},
    AppHandle, Emitter, EventTarget, Manager,
};
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

use log::{error, info};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Default)]
struct InnerAppState {
    ui_ready: bool,
    ui_frontend_ready: bool,
}

struct AppState {
    inner: Arc<Mutex<InnerAppState>>,
    deltachat: Arc<RwLock<Accounts>>,
    deltachat_rpc_session: RpcSession<CommandApi>,
    deltachat_rpc_send_task: JoinHandle<anyhow::Result<()>>,
    startup_timestamp: SystemTime,
}

impl AppState {
    async fn try_new(app: &tauri::App, startup_timestamp: SystemTime) -> anyhow::Result<Self> {
        let accounts = Accounts::new(PathBuf::from("../data/"), true).await?;
        let accounts = Arc::new(RwLock::new(accounts));
        let state = CommandApi::from_arc(accounts.clone()).await;
        let (client, mut out_receiver) = RpcClient::new();
        let session = RpcSession::new(client.clone(), state.clone());

        let handle = app.handle().clone();

        let send_task: JoinHandle<anyhow::Result<()>> = tauri::async_runtime::spawn(async move {
            loop {
                let message = match out_receiver.next().await {
                    None => break,
                    Some(message) => serde_json::to_string(&message)?,
                };
                // TODO fail will drop out of loop, do we want that here? or do we just want to log and ignore the error
                handle.emit_to(EventTarget::labeled("main"), "dc-jsonrpc-message", message)?;
            }
            Ok(())
        });

        Ok(Self {
            inner: Arc::new(Mutex::new(InnerAppState::default())),
            deltachat: accounts,
            deltachat_rpc_session: session,
            deltachat_rpc_send_task: send_task,
            startup_timestamp,
        })
    }

    fn log_duration_since_startup(&self, label: &str) {
        if let Ok(duration) = SystemTime::now().duration_since(self.startup_timestamp) {
            let micros = duration.as_micros();
            info!("{label} took {micros}μs");
        } else {
            info!("{label} took (error)μs");
        }
    }
}

#[tauri::command]
fn deltachat_jsonrpc_request(message: String, state: tauri::State<AppState>) {
    let session = state.deltachat_rpc_session.clone();
    tauri::async_runtime::spawn(async move {
        session.handle_incoming(&message).await;
    });
}

#[tauri::command]
fn ui_ready(state: tauri::State<AppState>) -> Result<(), String> {
    // TODO: theme update if theme was set via cli

    match state.inner.lock() {
        Ok(mut lock) => {
            lock.ui_ready = true;
        }
        Err(err) => return Err(format!("failed to aquire lock {err:#}")),
    };

    state.log_duration_since_startup("ui_ready");
    Ok(())
}

#[tauri::command]
fn ui_frontend_ready(state: tauri::State<AppState>) -> Result<(), String> {
    // TODO: deeplinking: -> send url to frontend

    match state.inner.lock() {
        Ok(mut lock) => {
            lock.ui_frontend_ready = true;
        }
        Err(err) => return Err(format!("failed to aquire lock {err:#}")),
    };
    state.log_duration_since_startup("ui_frontend_ready");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let startup_timestamp = SystemTime::now();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                // TODO: handle open url case
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }));
    }

    builder
        .invoke_handler(tauri::generate_handler![
            greet,
            deltachat_jsonrpc_request,
            ui_ready,
            ui_frontend_ready
        ])
        .setup(move |app| {
            let (tauri_plugin_log, max_level, logger) = tauri_plugin_log::Builder::new()
                // default targets are file and stdout
                .max_file_size(5_000_000 /* bytes */)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll) // TODO: only keep last 10
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .split(app.handle())?;

            #[cfg(feature = "crabnebula_extras")]
            {
                let mut devtools_builder = tauri_plugin_devtools::Builder::default();
                devtools_builder.attach_logger(logger);
                app.handle().plugin(devtools_builder.init())?;
            }
            #[cfg(not(feature = "crabnebula_extras"))]
            {
                tauri_plugin_log::attach_logger(max_level, logger);
            }
            app.handle().plugin(tauri_plugin_log)?;

            app.manage(tauri::async_runtime::block_on(AppState::try_new(
                app,
                startup_timestamp,
            ))?);
            app.state::<AppState>()
                .log_duration_since_startup("setup done");

            let store = app.store("config.json")?;
            // todo: activate tray icon based on minimizeToTray
            
            // we can only do this in debug mode, macOS doesn't not allow this in the appstore, because it uses private apis
            // we should think about wether we want it on other production builds (except store),
            // because having that console in production can be useful for fixing bugs..
            // depends on whether we can remove it from the context menu and make it dependent on --devmode?
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
