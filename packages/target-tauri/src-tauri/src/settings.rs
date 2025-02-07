use anyhow::{Context, Ok};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

pub(crate) const ZOOM_FACTOR_KEY: &str = "zoomFactor";
pub(crate) const CONTENT_PROTECTION_KEY: &str = "contentProtectionEnabled";

// runtime calls this when desktop settings change
#[tauri::command]
pub fn change_desktop_settings_apply_side_effects(app: AppHandle, key: &str) -> Result<(), String> {
    match key {
        ZOOM_FACTOR_KEY => apply_zoom_factor(&app),
        // "minimizeToTray" => // TODO
        CONTENT_PROTECTION_KEY => apply_content_protection(&app),
        _ => Ok(()),
    }
    .map_err(|err| format!("{err:#}"))
}

pub(crate) fn load_and_apply_desktop_settings_on_startup(app: &AppHandle) -> anyhow::Result<()> {
    apply_zoom_factor(app)?;
    // TODO: activate tray icon based on `minimizeToTray`
    apply_content_protection(app)?;
    Ok(())
}

pub(crate) fn apply_zoom_factor(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store("config.json")?;
    let zoom_factor:f64 = store
        .get("ZOOM_FACTOR_KEY")
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
    let store = app.store("config.json")?;
    let protected = store
        .get(CONTENT_PROTECTION_KEY)
        .map_or_else(|| Some(false), |f| f.as_bool())
        .unwrap_or(false);

    for (_label, window) in app.webview_windows().iter() {
        window.set_content_protected(protected)?;
    }

    Ok(())
}
