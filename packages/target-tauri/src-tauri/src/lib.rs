use std::{path::PathBuf, str::FromStr, time::SystemTime};

use anyhow::Context;
use cli::parse_cli_options_from_args;
use clipboard::copy_image_to_clipboard;

use deeplink::handle_deep_link;
#[cfg(desktop)]
use menus::{handle_menu_event, main_menu::create_main_menu};

use resume_from_sleep::start_resume_after_sleep_detector;
use run_config::RunConfig;
use settings::{
    load_and_apply_desktop_settings_on_startup, CONFIG_FILE, MINIMIZE_TO_TRAY,
    MINIMIZE_TO_TRAY_DEFAULT,
};
use state::{
    app::{AppState, InnerAppState},
    deltachat::DeltaChatAppState,
    html_email_instances::HtmlEmailInstancesState,
    main_window_channels::MainWindowChannels,
    menu_manager::MenuManager,
    notification::Notifications,
    translations::TranslationState,
    tray_manager::TrayManager,
    webxdc_instances::WebxdcInstancesState,
};

use tauri::{
    async_runtime::{block_on, spawn},
    AppHandle, Manager, WebviewUrl, WebviewWindowBuilder,
};

use tauri_plugin_log::{Target, TargetKind};

use tray::is_tray_icon_active;

mod app_path;
mod autostart;
mod blobs;
#[cfg(desktop)]
mod cli;
mod clipboard;
mod deeplink;
mod drag_and_drop;
mod file_dialogs;
mod help_window;
mod html_window;
mod i18n;

// menus are not available on mobile
mod chat_background_image;
mod media_permissions;
#[cfg(desktop)]
mod menus;
mod network_isolation_dummy_proxy;
// currently we have no mobile support for notifications
// but then there would also be the question if they would even work
// with the current architecture where everything is controled by the frontend
// (so the main window needs to be running to send notifications)
mod notifications;
mod resume_from_sleep;
mod run_config;
mod runtime_capabilities;
mod runtime_info;
mod settings;
mod state;
mod stickers;
mod temp_file;
mod themes;
mod tray;
mod util;
mod webxdc;

const DEFAULT_WINDOW_WIDTH: f64 = 800.;
const DEFAULT_WINDOW_HEIGHT: f64 = 600.;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

#[tauri::command]
fn deltachat_jsonrpc_request(
    message: deltachat_jsonrpc::yerpc::Message,
    state: tauri::State<DeltaChatAppState>,
) {
    let session = state.deltachat_rpc_session.clone();
    tauri::async_runtime::spawn(async move {
        session.handle_incoming_parsed(message).await;
    });
}

#[tauri::command]
async fn ui_ready(state: tauri::State<'_, AppState>) -> Result<(), String> {
    // TODO: theme update if theme was set via cli

    let mut lock = state.inner.lock().await;
    lock.ui_ready = true;
    state.log_duration_since_startup("ui_ready");
    Ok(())
}

#[tauri::command]
async fn ui_frontend_ready(
    app: AppHandle,
    rc: tauri::State<'_, RunConfig>,
    state: tauri::State<'_, AppState>,
    mwc: tauri::State<'_, MainWindowChannels>,
    notifications: tauri::State<'_, Notifications>,
) -> Result<(), String> {
    let mut lock = state.inner.lock().await;

    if !lock.ui_frontend_ready {
        // don't run again on reload
        if let Some(deeplink_or_xdc) = lock.deeplink.take().or(rc.deeplink.clone()) {
            let app_clone = app.clone();
            let deeplink_or_xdc = deeplink_or_xdc.to_owned();
            spawn(async move {
                if let Err(err) = handle_deep_link(
                    &app_clone,
                    None,
                    deeplink_or_xdc,
                    #[cfg(target_os = "windows")]
                    true, // This is the initial launch, handle `dcnotification:`.
                )
                .await
                {
                    log::error!("error handling deeplink: {err:?}");
                }
            });
        }
    }

    lock.ui_frontend_ready = true;

    state.log_duration_since_startup("ui_frontend_ready");

    deeplink::register();

    notifications.ask_for_permission();

    if let Err(err) = mwc.emit_deferred_events().await {
        log::error!("emit_deferred_events {err:?}")
    }

    Ok(())
}

#[tauri::command]
fn get_current_logfile(state: tauri::State<AppState>) -> String {
    state.current_log_file_path.clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> i32 {
    let startup_timestamp = SystemTime::now();

    #[cfg(desktop)]
    let run_config = cli::parse_cli_options();
    #[cfg(not(desktop))]
    let run_config = RunConfig::default();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(desktop)]
    let (deeplink_tx, deeplink_rx) =
        std::sync::mpsc::sync_channel::<deeplink::DeepLinkInvocation>(4);

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(
                tauri_plugin_window_state::Builder::new()
                    .map_label(|original_label| {
                        if original_label.starts_with("html-window:") {
                            // HTML email viewer window label
                            // contains account ID and message ID.
                            // Let's not store state
                            // for each individual message.
                            "html-window:"
                        } else {
                            original_label
                        }
                    })
                    .build(),
            )
            .plugin(tauri_plugin_single_instance::init(move |app, args, cwd| {
                log::info!("second instance launched, focusing the original instance instead");

                let cwd = PathBuf::from_str(&cwd).unwrap();
                log::debug!("tauri_plugin_single_instance {args:?} {cwd:?}");

                let options = parse_cli_options_from_args(args);
                if let Some(deeplink) = options.deeplink {
                    // just calling the method here was unreliable, so using a channel now
                    //
                    // how unreliable was it?:
                    // it did not react on the first call and then always took the data of the previous call
                    if let Err(err) = deeplink_tx.send(deeplink::DeepLinkInvocation {
                        content: deeplink,
                        cwd: Some(cwd),
                    }) {
                        log::error!("deeplink_tx: send error: {err:?}");
                    }
                }
                let window = app.get_webview_window("main").expect("no main window");
                window
                    .show()
                    .context("failed to show window after second instance launch attempt")
                    .inspect_err(|err| log::error!("{err}"))
                    .ok();
                window
                    .set_focus()
                    .context("failed to focus window after second instance launch attempt")
                    .inspect_err(|err| log::error!("{err}"))
                    .ok();
            }));

        // registering here does not seem to work
    }

    // sepcified here, so the open handler does not rely on appstate to be ready
    // (that it can be used "outside" of tauri)
    let inner_appstate = InnerAppState::new();
    let cloned_inner_appstate = inner_appstate.clone();

    let app = builder
        .invoke_handler(tauri::generate_handler![
            // When adding a command, don't forget to also add it
            // to `.commands()` in `build.rs`, and to `permissions`
            // in `capabilities`.
            greet,
            state::main_window_channels::set_main_window_channels,
            run_config::get_frontend_run_config,
            deltachat_jsonrpc_request,
            ui_ready,
            ui_frontend_ready,
            get_current_logfile,
            copy_image_to_clipboard,
            autostart::get_autostart_state,
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
            chat_background_image::copy_background_image_file,
            // not yet available on mobile
            #[cfg(desktop)]
            webxdc::commands_main_window::on_webxdc_message_changed,
            // not yet available on mobile
            #[cfg(desktop)]
            webxdc::commands_main_window::on_webxdc_message_deleted,
            webxdc::commands_main_window::on_webxdc_status_update,
            webxdc::commands_main_window::on_webxdc_realtime_data,
            // not yet available on mobile
            #[cfg(desktop)]
            webxdc::commands_main_window::delete_webxdc_account_data,
            // not yet available on mobile,
            // also curretly you can not switch or delete an account on mobile while there is a webxdc open
            #[cfg(desktop)]
            webxdc::commands_main_window::close_all_webxdc_instances,
            webxdc::commands_main_window::open_webxdc,
            webxdc::commands::send_webxdc_update,
            webxdc::commands::get_webxdc_updates,
            webxdc::commands::join_webxdc_realtime_channel,
            webxdc::commands::leave_webxdc_realtime_channel,
            webxdc::commands::send_webxdc_realtime_data,
            webxdc::commands::register_webxdc_channel,
            webxdc::commands::webxdc_send_to_chat,
            #[cfg(target_vendor = "apple")]
            webxdc::data_storage::debug_get_datastore_ids,
            #[cfg(desktop)]
            notifications::show_notification,
            #[cfg(desktop)]
            notifications::clear_all_notifications,
            #[cfg(desktop)]
            notifications::clear_notifications,
            runtime_info::get_runtime_info,
            settings::change_desktop_settings_apply_side_effects,
            help_window::open_help_window,
            // not yet available on mobile
            #[cfg(desktop)]
            html_window::open_html_window,
            // not yet available on mobile
            #[cfg(desktop)]
            html_window::commands::get_html_window_info,
            // not yet available on mobile
            #[cfg(desktop)]
            html_window::commands::html_email_open_menu,
            // not yet available on mobile
            #[cfg(desktop)]
            html_window::commands::html_email_set_load_remote_content,
            // not available on mobile
            #[cfg(desktop)]
            state::tray_manager::update_tray_icon_badge,
            themes::commands::get_available_themes,
            themes::commands::get_theme,
            themes::commands::get_current_active_theme_address,
            media_permissions::check_media_permission,
            media_permissions::request_media_permission,
            drag_and_drop::drag_file_out,
        ])
        .register_asynchronous_uri_scheme_protocol(
            "webxdc-icon",
            webxdc::icon_scheme::webxdc_icon_protocol,
        )
        .register_asynchronous_uri_scheme_protocol("dcblob", blobs::delta_blobs_protocol)
        .register_asynchronous_uri_scheme_protocol("dcsticker", stickers::delta_stickers_protocol)
        .register_asynchronous_uri_scheme_protocol(
            "dcchatbgimage",
            chat_background_image::delta_chat_background_image_protocol,
        )
        .register_asynchronous_uri_scheme_protocol(
            "email",
            html_window::email_scheme::email_protocol,
        )
        .register_asynchronous_uri_scheme_protocol("webxdc", webxdc::webxdc_scheme::webxdc_protocol)
        .setup(move |app| {
            app.manage(run_config.clone());

            let main_window = {
                #[allow(unused_mut)]
                let mut window_builder = WebviewWindowBuilder::new(
                    app,
                    "main",
                    WebviewUrl::App("tauri_main.html".into()),
                )
                .title("Delta Chat Tauri")
                .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);

                #[cfg(target_os = "macos")]
                {
                    window_builder = window_builder.allow_link_preview(false);
                }

                window_builder.build()?
            };

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

            let mut log_targets = vec![Target::new(TargetKind::LogDir { file_name: None })];
            if run_config.log_to_console {
                log_targets.push(Target::new(TargetKind::Stdout))
            }

            #[allow(unused_mut)]
            let mut logger_builder = tauri_plugin_log::Builder::new()
                .clear_targets()
                .targets(log_targets)
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
                .level_for("iroh_gossip", log::LevelFilter::Warn)
                .level_for("iroh_net_report", log::LevelFilter::Warn)
                .level_for("iroh_relay", log::LevelFilter::Warn)
                .level_for("netwatch", log::LevelFilter::Warn)
                .level_for("hyper_util", log::LevelFilter::Warn)
                // also emitted by tauri
                .level_for("tracing", log::LevelFilter::Warn)
                .level_for("igd_next", log::LevelFilter::Warn)
                // why do we use debug here at the moment?
                // because the message "[DEBUG][portmapper] failed to get a port mapping deadline has elapsed" looks like important
                // info for debugging add backup transfer feature. - so better be safe and set it to debug for now.
                // .level_for("tao", log::LevelFilter::Trace)
                // .level_for("webview::JS::render", log::LevelFilter::Error)
                // .level_for("webview::JS::renderer", log::LevelFilter::Error);
                .level_for("portmapper", log::LevelFilter::Debug);

            if run_config.log_debug {
                logger_builder = logger_builder.level(log::LevelFilter::Debug);
            } else {
                logger_builder = logger_builder.level(log::LevelFilter::Info);
            }

            #[cfg(target_os = "android")]
            {
                // logs on android
                logger_builder = logger_builder.target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ));
            }

            let (tauri_plugin_log, max_level, logger) = logger_builder.split(app.handle())?;

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

            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;

                app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec!["--autostart"]),
                    // TODO: `--autostart` should show a different message why the tray option is disabled
                ))?;
            }

            app.manage(tauri::async_runtime::block_on(AppState::try_new(
                app,
                cloned_inner_appstate,
                startup_timestamp,
            ))?);
            app.manage(MainWindowChannels::new());
            // Note that `DeltaChatAppState::try_new` depends on
            // `MainWindowChannels` to be managed already.
            app.manage(tauri::async_runtime::block_on(DeltaChatAppState::try_new(
                app,
            ))?);
            app.manage(HtmlEmailInstancesState::new());
            app.manage(MenuManager::new());
            app.manage(tauri::async_runtime::block_on(TranslationState::try_new(
                app,
            ))?);
            app.manage(WebxdcInstancesState::new());
            app.manage(TrayManager::new());
            app.state::<AppState>()
                .log_duration_since_startup("base setup done");

            block_on(load_and_apply_desktop_settings_on_startup(app.handle()))?;

            // we can only do this in debug mode, macOS doesn't not allow this in the appstore, because it uses private apis
            // we should think about wether we want it on other production builds (except store),
            // because having that console in production can be useful for fixing bugs..
            // depends on whether we can remove it from the context menu and make it dependent on --devmode?
            if run_config.devtools {
                #[cfg(debug_assertions)]
                app.get_webview_window("main").unwrap().open_devtools();
            }

            #[cfg(target_os = "macos")]
            {
                main_window.set_title_bar_style(tauri::TitleBarStyle::Overlay)?;
                main_window.set_title("")?;
            }

            let main_window_clone = main_window.clone();
            main_window.on_window_event(move |ev| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = ev {
                    let res = || {
                        let minimize_to_tray = is_tray_icon_active(main_window_clone.app_handle())?;
                        if cfg!(target_os = "macos") || minimize_to_tray {
                            api.prevent_close();
                            let _ = main_window_clone.hide();
                        } else {
                            main_window_clone.app_handle().exit(0);
                        }
                        Ok::<(), anyhow::Error>(())
                    };
                    if let Err(err) = res() {
                        log::error!("CloseRequested: failed to execute: {err}");
                    }
                }
            });

            #[cfg(desktop)]
            {
                let menu_manager = app.state::<MenuManager>();
                let main_window_clone = main_window.clone();
                tauri::async_runtime::block_on(menu_manager.register_window(
                    app.handle(),
                    &main_window,
                    Box::new(move |app| create_main_menu(app, &main_window_clone)),
                ))?;

                app.on_menu_event(handle_menu_event);
            }

            runtime_capabilities::add_runtime_capabilies(app.handle())?;

            start_resume_after_sleep_detector(app.handle());

            #[cfg(desktop)]
            {
                if run_config.translation_watch {
                    i18n::watch_translations(app.handle().clone());
                }
            }

            let app_id = app.config().identifier.clone();
            let notifications = Notifications::new(app_id);
            notifications.initialize(app.handle().clone());
            app.manage(notifications);

            app.state::<AppState>()
                .log_duration_since_startup("setup done");

            if run_config.minimized_window {
                let _ = main_window.hide();
            }

            themes::cli::run_cli(app.handle(), &run_config)?;

            main_window.show()?;
            Ok(())
        })
        .build({
            #[allow(unused_mut)]
            let mut context = tauri::generate_context!("tauri.conf.json5");

            #[cfg(any(debug_assertions, target_os = "windows", target_os = "android"))]
            {
                use util::csp::add_custom_schemes_to_csp_for_window_and_android;

                let csp = context.config_mut().app.security.csp.clone();
                if let Some(csp) = csp {
                    context.config_mut().app.security.csp =
                        Some(add_custom_schemes_to_csp_for_window_and_android(csp, false));
                }
            }

            context
        })
        .expect("error while building tauri application");

    #[cfg(desktop)]
    {
        let app_clone = app.handle().clone();
        tauri::async_runtime::spawn_blocking(move || {
            let deeplink_rx = deeplink_rx;
            while let Ok(deeplink) = deeplink_rx.recv() {
                if let Err(err) = block_on(handle_deep_link(
                    &app_clone,
                    deeplink.cwd,
                    deeplink.content,
                    #[cfg(target_os = "windows")]
                    false, // Not the initial launch, ignore `dcnotification:`
                )) {
                    log::error!("error handling deeplink: {err:?}");
                }
            }
        });
    }

    let app_handle = app.handle().clone();
    tauri::async_runtime::spawn(async move {
        tokio::signal::ctrl_c()
            .await
            .inspect(|_| log::info!("Received Ctrl+C. Exiting gracefully."))
            .inspect_err(|err| log::error!("Failed to listen on Ctrl+C: {err}"))
            .ok();
        // https://tokio.rs/tokio/topics/shutdown says
        // that we should shut down regardless of the Result.
        // Is it always appropriate though?

        // [`tokio::signal::ctrl_c`] docs say that on Unix,
        // normal OS signal handling will not be restored,
        // so we have to listen for another Ctrl+C manually.
        //
        // Spawning this prior to calling `app_handle.exit(0)`
        // in case that blocks.
        tauri::async_runtime::spawn(async move {
            tokio::signal::ctrl_c().await.ok();
            log::error!("Received a second Ctrl+C, exiting forcefully");
            std::process::exit(1);
        });

        app_handle.exit(0);
    });

    #[cfg(target_os = "macos")]
    let cloned_inner_appstate = inner_appstate.clone();

    #[allow(clippy::single_match)]
    let exit_code = app.run_return(move |app_handle, run_event| match run_event {
        // tauri::RunEvent::ExitRequested { code, api, .. } => {}
        #[cfg(target_os = "macos")]
        tauri::RunEvent::Opened { urls } => {
            if let Some(url) = urls.first().map(|s| s.to_string()) {
                match cloned_inner_appstate.try_lock() {
                    Ok(mut lock) => {
                        if !lock.ui_frontend_ready {
                            lock.deeplink.replace(url);
                        } else {
                            drop(lock);
                            let app_clone = app_handle.clone();
                            spawn(async move {
                                if let Err(err) = handle_deep_link(&app_clone, None, url).await {
                                    log::error!("error handling deeplink: {err:?}");
                                }
                            });
                        }
                    }
                    Err(err) => {
                        log::error!("failed to aquire lock on AppState:{err:?}")
                    }
                }
            }
        }
        #[cfg(target_os = "macos")]
        tauri::RunEvent::Reopen { .. } => {
            // handle clicks on dock on macOS (because on macOS main window never really closes)
            if let Err(err) = app_handle
                .get_webview_window("main")
                .context("main window not found")
                .and_then(|main_window| {
                    main_window
                        .show()
                        .and_then(|_| main_window.set_focus())
                        .context("failed to call show or set_focus")
                })
            {
                log::error!("failed to focus and show main_window {err:?}");
            }
        }
        tauri::RunEvent::Exit => {
            log::info!("Exiting: starting cleanup...");
            tauri::async_runtime::block_on(cleanup(app_handle));
            log::info!("Cleanup done. Quitting now. Bye.");
        }
        _ => {}
    });
    exit_code
}

async fn cleanup(app_handle: &tauri::AppHandle) {
    app_handle.state::<DeltaChatAppState>().destroy().await;

    let _ = temp_file::clear_tmp_folder(app_handle)
        .await
        .context("cleanup: failed to clear tmp folder")
        .inspect_err(|err| log::error!("{err}"));
}
