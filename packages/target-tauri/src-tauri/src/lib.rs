use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
    time::SystemTime,
};

use anyhow::{bail, Context};
use deltachat_jsonrpc::{
    api::{Accounts, CommandApi},
    yerpc::{RpcClient, RpcSession},
};
use futures_lite::stream::StreamExt;

use tauri::{
    async_runtime::JoinHandle,
    window::{Color, Effect, EffectState, EffectsBuilder},
    AppHandle, Emitter, EventTarget, Manager,
};
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

use log::{error, info};

mod blobs;
mod help_window;
mod locales;
mod runtime_info;
mod webxdc;

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
    pub(crate) inner: Arc<Mutex<InnerAppState>>,
    pub(crate) deltachat: Arc<RwLock<Accounts>>,
    pub(crate) deltachat_rpc_session: RpcSession<CommandApi>,
    pub(crate) deltachat_rpc_send_task: JoinHandle<anyhow::Result<()>>,
    pub(crate) startup_timestamp: SystemTime,
    pub(crate) current_log_file_path: String,
}

impl AppState {
    pub(crate) async fn try_new(
        app: &tauri::App,
        startup_timestamp: SystemTime,
    ) -> anyhow::Result<Self> {
        let handle = app.handle().clone();
        let get_current_log_file_task =
            tauri::async_runtime::spawn(async move { Self::get_current_log_file(handle).await });

        let data_dir = app.path().app_data_dir()?;
        info!("Data directory is {data_dir:?}");

        let accounts = Accounts::new(data_dir.join("accounts"), true).await?;
        let accounts = Arc::new(RwLock::new(accounts));
        let state = CommandApi::from_arc(accounts.clone()).await;
        let (client, mut out_receiver) = RpcClient::new();
        let session = RpcSession::new(client.clone(), state.clone());

        info!("account manager created");

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

        let current_log_file_path = get_current_log_file_task.await??;

        Ok(Self {
            inner: Arc::new(Mutex::new(InnerAppState::default())),
            deltachat: accounts,
            deltachat_rpc_session: session,
            deltachat_rpc_send_task: send_task,
            startup_timestamp,
            current_log_file_path,
        })
    }

    #[cfg(target_os = "ios")]
    async fn get_current_log_file(app: AppHandle) -> anyhow::Result<String> {
        Ok("does not exist on ios - because iOS uses the system os-log api".to_owned())
    }

    #[cfg(not(target_os = "ios"))]
    async fn get_current_log_file(app: AppHandle) -> anyhow::Result<String> {
        let mut log_files: Vec<(PathBuf, std::time::Duration)> =
            std::fs::read_dir(app.path().app_log_dir()?)?
                .filter_map(|entry| entry.ok())
                .map(|entry| {
                    let elapsed = entry.metadata()?.created()?.elapsed()?;
                    let path = entry.path();
                    if !path.to_string_lossy().ends_with(".log") {
                        bail!("not logfile")
                    }
                    anyhow::Ok((path, elapsed))
                })
                .filter_map(|entry| entry.ok())
                .collect();
        log_files.sort_by(|a, b| a.1.cmp(&b.1));
        let current_log_file_path = log_files
            .first()
            .context("current logfile does not exist")?
            .0
            .to_str()
            .context("invalid characters in logfile path, this should not happen")?
            .to_owned();
        info!("Current Logfile: {current_log_file_path}");
        Ok(current_log_file_path)
    }

    pub(crate) fn log_duration_since_startup(&self, label: &str) {
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

#[tauri::command]
fn get_current_logfile(state: tauri::State<AppState>) -> String {
    state.current_log_file_path.clone()
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
            ui_frontend_ready,
            get_current_logfile,
            locales::get_locale_data,
            webxdc::on_webxdc_message_changed,
            webxdc::on_webxdc_message_deleted,
            webxdc::on_webxdc_status_update,
            webxdc::on_webxdc_realtime_data,
            webxdc::delete_webxdc_account_data,
            webxdc::close_all_webxdc_instances,
            runtime_info::get_runtime_info,
            help_window::open_help_window,
        ])
        .register_asynchronous_uri_scheme_protocol("webxdc-icon", webxdc::webxdc_icon_protocol)
        .register_asynchronous_uri_scheme_protocol("dcblob", blobs::delta_blobs_protocol)
        .setup(move |app| {
            // Create missing directories for iOS (quick fix, better fix this upstream in tauri)
            #[cfg(target_os = "ios")]
            {
                // app_data_dir should be custom for iOS
                // should be sth like private/var/mobile/Containers/Data/Application/1348A16B-81C7-46C4-9441-0E2A31D362D9/
                // currently is private/var/mobile/Containers/Data/Application/1348A16B-81C7-46C4-9441-0E2A31D362D9/Library/Application Support/chat.delta.desktop.tauri
                // the latter is a problem, becuase the directories don't exist, so as quick fix we create them here
                std::fs::create_dir_all(app.path().app_data_dir()?)?;
                // same for app_log_dir and probably all other dirs
                std::fs::create_dir_all(app.path().app_log_dir()?)?; // though log dir is not used because it uses os-log on iOS
            }

            let (tauri_plugin_log, max_level, logger) = tauri_plugin_log::Builder::new()
                // default targets are file and stdout
                .max_file_size(5_000_000 /* bytes */)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll) // TODO: only keep last 10
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .level_for("pgp", log::LevelFilter::Warn)
                .level_for("async_imap", log::LevelFilter::Warn)
                .level_for("async_smtp", log::LevelFilter::Warn)
                .level_for("rustls", log::LevelFilter::Warn)
                .level_for("iroh_net", log::LevelFilter::Warn)
                // also emitted by tauri
                .level_for("tracing", log::LevelFilter::Warn)
                .level_for("igd_next", log::LevelFilter::Warn)
                // why do we use debug here at the moment?
                // because the message "[DEBUG][portmapper] failed to get a port mapping deadline has elapsed" looks like important
                // info for debugging add backup transfer feature. - so better be safe and set it to debug for now.
                .level_for("portmapper", log::LevelFilter::Debug)
                .split(app.handle())?;

            #[cfg(feature = "crabnebula_extras")]
            {
                let mut devtools_builder = tauri_plugin_devtools::Builder::default();
                devtools_builder.attach_logger(logger);
                app.handle().plugin(devtools_builder.init())?;
            }
            #[cfg(not(feature = "crabnebula_extras"))]
            {
                let _ = tauri_plugin_log::attach_logger(max_level, logger);
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

            let webview = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                webview.set_title_bar_style(tauri::TitleBarStyle::Overlay)?;
                webview.set_title("")?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
