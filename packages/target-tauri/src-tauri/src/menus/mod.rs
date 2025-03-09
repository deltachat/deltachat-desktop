use crate::settings::ZOOM_FACTOR_KEY;
use crate::{help_window::open_help_window, AppState};
use help_menu::create_help_menu;
use main_menu::create_main_menu;
use std::str::FromStr;
use std::sync::atomic::{AtomicBool, Ordering};
use strum::{AsRefStr, EnumString};
use tauri::menu::MenuId;
use tauri::{menu::MenuEvent, AppHandle, Emitter, Manager, WebviewWindow};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;
pub mod help_menu;
pub(crate) mod main_menu;

const HELP_ZOOM_FACTOR_KEY: &str = "helpZoomFactor";
static FLOATING: AtomicBool = AtomicBool::new(false);

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum MainMenuAction {
    Settings,
    Help,
    Quit,
    FloatOnTop,
    Zoom06,
    Zoom08,
    Zoom10,
    Zoom12,
    Zoom14,
    DevTools,
    LogFolder,
    CurrentLogFile,
    Keybindings,
    Contribute,
    Report,
    Learn,
    About,
}

impl From<MainMenuAction> for MenuId {
    fn from(action: MainMenuAction) -> Self {
        MenuId::new(action)
    }
}

impl TryFrom<&MenuId> for MainMenuAction {
    type Error = anyhow::Error;

    fn try_from(item: &MenuId) -> Result<Self, Self::Error> {
        MainMenuAction::from_str(item.as_ref()).map_err(|e| e.into())
    }
}

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum HelpMenuAction {
    HelpQuit,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    HelpFloatOnTop,
}

impl TryFrom<&MenuId> for HelpMenuAction {
    type Error = anyhow::Error;

    fn try_from(item: &MenuId) -> Result<Self, Self::Error> {
        HelpMenuAction::from_str(item.as_ref()).map_err(|e| e.into())
    }
}

impl From<HelpMenuAction> for MenuId {
    fn from(action: HelpMenuAction) -> Self {
        MenuId::new(action)
    }
}

pub fn handle_event(app: &AppHandle, event: MenuEvent) -> anyhow::Result<()> {
    if let Ok(action) = MainMenuAction::try_from(event.id()) {
        match action {
            MainMenuAction::Settings => {
                app.emit("showSettingsDialog", None::<String>).ok();
            }
            MainMenuAction::Help => {
                open_help_window(app.clone(), "", None).ok();

                let window = app
                    .get_webview_window("help")
                    .ok_or(anyhow::anyhow!("help window not found"))?;
                window.set_menu(create_help_menu(&app)?)?;
            }
            MainMenuAction::Quit => {
                app.exit(0);
            }
            MainMenuAction::FloatOnTop => {
                get_main_window(app)?.set_always_on_top(true).ok();
            }
            MainMenuAction::Zoom06 => {
                set_zoom(app, 0.6, "main")?;
            }
            MainMenuAction::Zoom08 => {
                set_zoom(app, 0.8, "main")?;
            }
            MainMenuAction::Zoom10 => {
                set_zoom(app, 1.0, "main")?;
            }
            MainMenuAction::Zoom12 => {
                set_zoom(app, 1.2, "main")?;
            }
            MainMenuAction::Zoom14 => {
                set_zoom(app, 1.4, "main")?;
            }
            MainMenuAction::DevTools => {
                get_main_window(&app)?.open_devtools();
            }
            MainMenuAction::LogFolder => {
                if let Ok(path) = &app.path().app_log_dir() {
                    if let Some(path) = path.to_str() {
                        app.opener().open_path(path, None::<String>).ok();
                    }
                }
            }
            MainMenuAction::CurrentLogFile => {
                let path = || app.state::<AppState>().current_log_file_path.clone();
                app.opener().open_path(path(), None::<String>).ok();
            }
            MainMenuAction::Keybindings => {
                app.emit("showKeybindingsDialog", None::<String>)?;
            }
            MainMenuAction::Contribute => {
                app.opener().open_url(
                    "https://github.com/deltachat/deltachat-desktop",
                    None::<String>,
                )?;
            }
            MainMenuAction::Report => {
                app.opener().open_url(
                    "https://github.com/deltachat/deltachat-desktop/issues",
                    None::<String>,
                )?;
            }
            MainMenuAction::Learn => {
                app.opener()
                    .open_url("https://delta.chat/de/", None::<String>)?;
            }
            MainMenuAction::About => {
                app.emit("showAboutDialog", None::<String>)?;
            }
        }
    }

    if let Ok(action) = HelpMenuAction::try_from(event.id()) {
        match action {
            HelpMenuAction::HelpQuit => {
                let window = app
                    .get_webview_window("help")
                    .ok_or(anyhow::anyhow!("help window not found"))?;
                window.close().ok();
            }
            HelpMenuAction::ZoomIn => {
                let store = app
                    .get_store("config.json")
                    .ok_or(anyhow::anyhow!("store not found"))?;
                let curr_zoom = store
                    .get(HELP_ZOOM_FACTOR_KEY)
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);
                let new_zoom = curr_zoom * 1.2;
                store.set(HELP_ZOOM_FACTOR_KEY, new_zoom);
                if let Some(window) = app.get_webview_window("help") {
                    window.set_zoom(new_zoom)?;
                }
            }
            HelpMenuAction::ZoomOut => {
                let store = app
                    .get_store("config.json")
                    .ok_or(anyhow::anyhow!("store not found"))?;
                let curr_zoom = store
                    .get(HELP_ZOOM_FACTOR_KEY)
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);
                let new_zoom = curr_zoom * 0.8;
                store.set(HELP_ZOOM_FACTOR_KEY, new_zoom);
                if let Some(window) = app.get_webview_window("help") {
                    window.set_zoom(new_zoom)?;
                }
            }
            HelpMenuAction::ResetZoom => {
                if let Some(window) = app.get_webview_window("help") {
                    window.set_zoom(1.0)?;
                }
            }
            HelpMenuAction::HelpFloatOnTop => {
                if let Some(window) = app.get_webview_window("help") {
                    let previous = FLOATING.fetch_xor(true, Ordering::SeqCst);
                    window.set_always_on_top(previous)?;
                }
            }
        }
    }

    Ok(())
}

pub(crate) fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    if let Err(e) = handle_event(app, event) {
        log::error!("{:?}", e);
    }
}

pub(crate) fn get_main_window(app: &AppHandle) -> anyhow::Result<WebviewWindow> {
    app.get_webview_window("main")
        .ok_or(anyhow::anyhow!("main window not found"))
}

pub(crate) fn set_zoom(app: &AppHandle, zoom: f64, window: &str) -> anyhow::Result<()> {
    let webview = app
        .get_webview_window(window)
        .ok_or(anyhow::anyhow!("webview not found"))?;
    webview.set_zoom(zoom)?;

    let store = app
        .get_store("config.json")
        .ok_or(anyhow::anyhow!("store not found"))?;
    store.set(ZOOM_FACTOR_KEY, zoom);

    app.set_menu(create_main_menu(app)?)?;

    Ok(())
}
