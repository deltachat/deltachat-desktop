use anyhow::Context;
use log::warn;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::{state::menu_manager::MenuManager, TranslationState};

pub(crate) const CONFIG_FILE: &str = "config.json";

pub(crate) const LOCALE_KEY: &str = "locale";
pub(crate) const ZOOM_FACTOR_KEY: &str = "zoomFactor";
pub(crate) const HELP_ZOOM_FACTOR_KEY: &str = "helpZoomFactor";
pub(crate) const HTML_EMAIL_ZOOM_FACTOR_KEY: &str = "htmlEmailZoomFactor";
pub(crate) const WEBXDC_ZOOM_FACTOR_KEY: &str = "webxdcZoomFactor";
pub(crate) const CONTENT_PROTECTION_KEY: &str = "contentProtectionEnabled";
pub(crate) const CONTENT_PROTECTION_DEFAULT: bool = false;
pub(crate) const HTML_EMAIL_WARNING_KEY: &str = "HTMLEmailAskForRemoteLoadingConfirmation";
pub(crate) const HTML_EMAIL_WARNING_DEFAULT: bool = true;
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY: &str =
    "HTMLEmailAlwaysLoadRemoteContent";
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT: bool = false;

// runtime calls this when desktop settings change
#[tauri::command]
pub async fn change_desktop_settings_apply_side_effects(
    app: AppHandle,
    key: &str,
) -> Result<(), String> {
    match key {
        ZOOM_FACTOR_KEY => apply_zoom_factor(&app),
        // "minimizeToTray" => // TODO
        CONTENT_PROTECTION_KEY => apply_content_protection(&app),
        LOCALE_KEY => apply_language_change(&app).await,
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
    let store = app.store(CONFIG_FILE)?;
    let zoom_factor: f64 = store
        .get(ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);

    // at the moment this only affect the main window like in the electron version
    app.get_webview_window("main")
        .context("main window not found")?
        .set_zoom(zoom_factor)?;

    Ok(())
}

pub(crate) fn apply_zoom_factor_help_window(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store(CONFIG_FILE)?;
    let zoom_factor: f64 = store
        .get(HELP_ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);
    app.get_webview_window("help")
        .context("help window not found")?
        .set_zoom(zoom_factor)?;
    Ok(())
}

pub(crate) fn apply_zoom_factor_html_window(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store(CONFIG_FILE)?;
    let zoom_factor: f64 = store
        .get(HTML_EMAIL_ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);
    for (label, window) in app.windows().iter() {
        if label.starts_with("html-window:") {
            for webview in window.webviews() {
                webview.set_zoom(zoom_factor)?;
            }
        }
    }
    Ok(())
}

pub(crate) fn apply_zoom_factor_webxdc(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store(CONFIG_FILE)?;
    let zoom_factor: f64 = store
        .get(WEBXDC_ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);
    for (label, webview_window) in app.webview_windows().iter() {
        if label.starts_with("webxdc:") {
            webview_window.set_zoom(zoom_factor)?;
        }
    }
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

pub(crate) async fn apply_language_change(app: &AppHandle) -> anyhow::Result<()> {
    app.state::<TranslationState>()
        .reload_from_config(app)
        .await?;
    app.state::<MenuManager>().update_all(app);
    Ok(())
}

pub(crate) fn get_setting_bool_or(
    setting_load_result: Option<serde_json::Value>,
    default_value: bool,
) -> bool {
    setting_load_result
        .and_then(|v| v.as_bool())
        .unwrap_or(default_value)
}
