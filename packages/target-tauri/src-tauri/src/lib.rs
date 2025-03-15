use std::time::SystemTime;

use clipboard::copy_image_to_clipboard;

use menus::{handle_menu_event, main_menu::create_main_menu};

use settings::load_and_apply_desktop_settings_on_startup;
use state::{
    app::AppState, deltachat::DeltaChatAppState, html_email_instances::HtmlEmailInstancesState,
    menu_manager::MenuManager, translations::TranslationState,
};
use tauri::Manager;
use util::csp::add_custom_schemes_to_csp_for_window_and_android;

mod app_path;
mod blobs;
mod clipboard;
mod file_dialogs;
mod help_window;
mod html_window;
mod i18n;
mod menus;
mod runtime_capabilities;
mod runtime_info;
mod settings;
mod state;
mod stickers;
mod temp_file;
mod util;
mod webxdc;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn deltachat_jsonrpc_request(message: String, state: tauri::State<DeltaChatAppState>) {
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
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init());

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
            copy_image_to_clipboard,
            app_path::get_app_path,
            clipboard::get_clipboard_image_as_data_uri,
            file_dialogs::download_file,
            file_dialogs::show_open_file_dialog,
            i18n::commands::get_locale_data,
            i18n::commands::change_lang,
            temp_file::write_temp_file_from_base64,
            temp_file::write_temp_file,
            temp_file::remove_temp_file,
            temp_file::copy_blob_file_to_internal_tmp_dir,
            webxdc::on_webxdc_message_changed,
            webxdc::on_webxdc_message_deleted,
            webxdc::on_webxdc_status_update,
            webxdc::on_webxdc_realtime_data,
            webxdc::delete_webxdc_account_data,
            webxdc::close_all_webxdc_instances,
            runtime_info::get_runtime_info,
            settings::change_desktop_settings_apply_side_effects,
            help_window::open_help_window,
            html_window::open_html_window,
            html_window::commands::get_html_window_info,
            html_window::commands::html_email_open_menu,
            html_window::commands::html_email_set_load_remote_content,
        ])
        .register_asynchronous_uri_scheme_protocol("webxdc-icon", webxdc::webxdc_icon_protocol)
        .register_asynchronous_uri_scheme_protocol("dcblob", blobs::delta_blobs_protocol)
        .register_asynchronous_uri_scheme_protocol("dcsticker", stickers::delta_stickers_protocol)
        .register_asynchronous_uri_scheme_protocol(
            "email",
            html_window::email_scheme::email_protocol,
        )
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
                .level_for("iroh", log::LevelFilter::Warn)
                .level_for("iroh_quinn", log::LevelFilter::Warn)
                .level_for("iroh_quinn_proto", log::LevelFilter::Warn)
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
            app.manage(tauri::async_runtime::block_on(DeltaChatAppState::try_new(
                app,
            ))?);
            app.manage(HtmlEmailInstancesState::new());
            app.manage(MenuManager::new());
            app.manage(tauri::async_runtime::block_on(TranslationState::try_new(
                app,
            ))?);
            app.state::<AppState>()
                .log_duration_since_startup("base setup done");

            load_and_apply_desktop_settings_on_startup(app.handle())?;

            // we can only do this in debug mode, macOS doesn't not allow this in the appstore, because it uses private apis
            // we should think about wether we want it on other production builds (except store),
            // because having that console in production can be useful for fixing bugs..
            // depends on whether we can remove it from the context menu and make it dependent on --devmode?
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();

            let main_window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "macos")]
            {
                main_window.set_title_bar_style(tauri::TitleBarStyle::Overlay)?;
                main_window.set_title("")?;
            }

            let menu_manager = app.state::<MenuManager>();
            let main_window_clone = main_window.clone();
            tauri::async_runtime::block_on(menu_manager.register_window(
                app.handle(),
                &main_window,
                Box::new(move |app| create_main_menu(app, &main_window_clone)),
            ))?;

            app.on_menu_event(handle_menu_event);

            runtime_capabilities::add_runtime_capabilies(app.handle())?;

            app.state::<AppState>()
                .log_duration_since_startup("setup done");

            Ok(())
        })
        .run({
            let mut context = tauri::generate_context!("tauri.conf.json5");

            #[cfg(any(debug_assertions, target_os = "windows", target_os = "android"))]
            {
                let csp = context.config_mut().app.security.csp.clone();
                if let Some(csp) = csp {
                    context.config_mut().app.security.csp =
                        Some(add_custom_schemes_to_csp_for_window_and_android(csp, false));
                }
            }

            context
        })
        .expect("error while running tauri application");
}
