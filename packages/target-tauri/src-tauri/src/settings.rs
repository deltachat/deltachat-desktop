use anyhow::Context;
use log::warn;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

pub(crate) const CONFIG_FILE: &str = "config.json";

pub(crate) const ZOOM_FACTOR_KEY: &str = "zoomFactor";
pub(crate) const CONTENT_PROTECTION_KEY: &str = "contentProtectionEnabled";
pub(crate) const CONTENT_PROTECTION_DEFAULT: bool = false;
pub(crate) const HTML_EMAIL_WARNING_KEY: &str = "HTMLEmailAskForRemoteLoadingConfirmation";
pub(crate) const HTML_EMAIL_WARNING_DEFAULT: bool = true;
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY: &str =
    "HTMLEmailAlwaysLoadRemoteContent";
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT: bool = false;
pub(crate) const AUTOSTART_KEY: &str = "autostart";
// IDEA: maybe we need to have more advanced logic for the default,
// if we have other builds like portable builds for example
pub(crate) const AUTOSTART_DEFAULT: bool = true;

// runtime calls this when desktop settings change
#[tauri::command]
pub fn change_desktop_settings_apply_side_effects(app: AppHandle, key: &str) -> Result<(), String> {
    match key {
        ZOOM_FACTOR_KEY => apply_zoom_factor(&app),
        // "minimizeToTray" => // TODO
        CONTENT_PROTECTION_KEY => apply_content_protection(&app),
        AUTOSTART_KEY => apply_autostart(&app),
        _ => Ok(()),
    }
    .map_err(|err| format!("{err:#}"))
}

pub(crate) fn load_and_apply_desktop_settings_on_startup(app: &AppHandle) -> anyhow::Result<()> {
    apply_zoom_factor(app)?;
    // TODO: activate tray icon based on `minimizeToTray`
    apply_content_protection(app)?;
    apply_autostart(&app)?;
    Ok(())
}

pub(crate) fn apply_zoom_factor(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store(CONFIG_FILE)?;
    let zoom_factor: f64 = store
        .get(ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);

    // at the moment this only affect the main window like in the electron version
    let webview = app
        .get_webview_window("main")
        .context("main window not found")?;
    webview.set_zoom(zoom_factor)?;

    Ok(())
}

#[cfg(any(target_os = "ios", target_os = "android"))]
pub(crate) fn apply_content_protection(app: &AppHandle) -> anyhow::Result<()> {
    Ok(())
}

#[cfg(not(any(target_os = "ios", target_os = "android")))]
pub(crate) fn apply_content_protection(app: &AppHandle) -> anyhow::Result<()> {
    let protected = get_content_protection(app);

    for (_label, window) in app.windows().iter() {
        window.set_content_protected(protected)?;
    }

    Ok(())
}

pub(crate) fn get_content_protection(app: &AppHandle) -> bool {
    match app.store(CONFIG_FILE) {
        Ok(store) => store
            .get(CONTENT_PROTECTION_KEY)
            .map_or(Some(CONTENT_PROTECTION_DEFAULT), |f| f.as_bool())
            .unwrap_or(CONTENT_PROTECTION_DEFAULT),
        Err(error) => {
            warn!("get_content_protection failed: {error:?}");
            CONTENT_PROTECTION_DEFAULT
        }
    }
}

pub(crate) fn get_setting_bool_or(
    setting_load_result: Option<serde_json::Value>,
    default_value: bool,
) -> bool {
    setting_load_result
        .and_then(|v| v.as_bool())
        .unwrap_or(default_value)
}

#[cfg(not(desktop))]
pub(crate) fn apply_autostart(app: &AppHandle) -> anyhow::Result<()> {
    Ok(())
}

#[cfg(desktop)]
pub(crate) fn apply_autostart(app: &AppHandle) -> anyhow::Result<()> {
    use tauri_plugin_autostart::ManagerExt;
    let store = app.store(CONFIG_FILE)?;
    let enabled = get_setting_bool_or(store.get(AUTOSTART_KEY), AUTOSTART_DEFAULT);

    let autostart_manager = app.autolaunch();

    if enabled {
        autostart_manager.enable()?;
    } else {
        autostart_manager.disable()?;
    }
    Ok(())
}
