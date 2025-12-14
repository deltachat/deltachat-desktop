use anyhow::Context;
use log::{error, warn};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::{
    state::menu_manager::MenuManager, themes::update_theme_in_other_windows, TranslationState,
    TrayManager,
};

pub(crate) const CONFIG_FILE: &str = "config.json";

pub(crate) const LOCALE_KEY: &str = "locale";
pub(crate) const ZOOM_FACTOR_KEY: &str = "zoomFactor";
pub(crate) const HELP_ZOOM_FACTOR_KEY: &str = "helpZoomFactor";
pub(crate) const HTML_EMAIL_ZOOM_FACTOR_KEY: &str = "htmlEmailZoomFactor";
pub(crate) const WEBXDC_ZOOM_FACTOR_KEY: &str = "webxdcZoomFactor";
pub(crate) const ENABLE_WEBXDC_DEV_TOOLS_KEY: &str = "enableWebxdcDevTools";
pub(crate) const ENABLE_WEBXDC_DEV_TOOLS_DEFAULT: bool = false;
pub(crate) const CONTENT_PROTECTION_KEY: &str = "contentProtectionEnabled";
pub(crate) const CONTENT_PROTECTION_DEFAULT: bool = false;
pub(crate) const HTML_EMAIL_WARNING_KEY: &str = "HTMLEmailAskForRemoteLoadingConfirmation";
pub(crate) const HTML_EMAIL_WARNING_DEFAULT: bool = true;
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY: &str =
    "HTMLEmailAlwaysLoadRemoteContent";
pub(crate) const HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT: bool = false;
pub(crate) const MINIMIZE_TO_TRAY: &str = "minimizeToTray";
pub(crate) const MINIMIZE_TO_TRAY_DEFAULT: bool = true;
pub(crate) const NOTIFICATIONS: &str = "notifications";
pub(crate) const NOTIFICATIONS_DEFAULT: bool = true;
pub(crate) const SYNC_ALL_ACCOUNTS: &str = "syncAllAccounts";
pub(crate) const SYNC_ALL_ACCOUNTS_DEFAULT: bool = true;
pub(crate) const THEME: &str = "activeTheme";
pub(crate) const THEME_DEFAULT: &str = "system";

pub(crate) const AUTOSTART_KEY: &str = "autostart";
// IDEA: maybe we need to have more advanced logic for the default,
// if we have other builds like portable builds for example
pub(crate) const AUTOSTART_DEFAULT: bool = cfg!(not(debug_assertions));

// runtime calls this when desktop settings change
#[tauri::command]
pub async fn change_desktop_settings_apply_side_effects(
    app: AppHandle,
    key: &str,
) -> Result<(), String> {
    match key {
        ZOOM_FACTOR_KEY => apply_zoom_factor(&app),
        CONTENT_PROTECTION_KEY => apply_content_protection(&app),
        LOCALE_KEY => apply_language_change(&app).await,
        MINIMIZE_TO_TRAY => {
            app.state::<TrayManager>()
                .apply_wanted_active_state(&app)
                .await
        }
        // update "mute notification" menu item with new state
        NOTIFICATIONS => app.state::<TrayManager>().update_menu(&app).await,
        THEME => update_theme_in_other_windows(&app).context("update theme in other windows"),
        AUTOSTART_KEY => apply_autostart(&app).await,
        _ => Ok(()),
    }
    .map_err(|err| format!("{err:#}"))
}

pub(crate) async fn load_and_apply_desktop_settings_on_startup(
    app: &AppHandle,
) -> anyhow::Result<()> {
    apply_zoom_factor(app)?;
    apply_content_protection(app)?;
    app.state::<TrayManager>()
        .apply_wanted_active_state(app)
        .await?;

    if let Err(err) = apply_autostart(app)
        .await
        .context("failed to apply autostart")
    {
        // Not too critical, let's just log.
        error!("{err}")
    };
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
pub(crate) fn apply_content_protection(_app: &AppHandle) -> anyhow::Result<()> {
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
    #[cfg(desktop)]
    app.state::<MenuManager>().update_all(app);
    Ok(())
}

pub trait StoreExtBoolExt {
    fn get_bool_or(&self, settings_key: impl AsRef<str>, default_value: bool) -> bool;
}

impl<R: tauri::Runtime> StoreExtBoolExt for tauri_plugin_store::Store<R> {
    fn get_bool_or(&self, settings_key: impl AsRef<str>, default_value: bool) -> bool {
        self.get(settings_key)
            .and_then(|v| v.as_bool())
            .unwrap_or(default_value)
    }
}

#[cfg(not(desktop))]
pub(crate) async fn apply_autostart(app: &AppHandle) -> anyhow::Result<()> {
    Ok(())
}

#[cfg(all(desktop, feature = "flatpak"))]
pub(crate) async fn apply_autostart(app: &AppHandle) -> anyhow::Result<()> {
    let store = app.store(CONFIG_FILE)?;
    if store.get(AUTOSTART_KEY).is_none() {
        store.set(AUTOSTART_KEY, AUTOSTART_DEFAULT);
    }
    let enable = store.get_bool_or(AUTOSTART_KEY, AUTOSTART_DEFAULT);
    crate::autostart::flatpak_set_auto_start(enable).await?;
    Ok(())
}

#[cfg(all(desktop, not(feature = "flatpak")))]
pub(crate) async fn apply_autostart(app: &AppHandle) -> anyhow::Result<()> {
    use tauri_plugin_autostart::ManagerExt;
    let store = app.store(CONFIG_FILE)?;
    if store.get(AUTOSTART_KEY).is_none() {
        store.set(AUTOSTART_KEY, AUTOSTART_DEFAULT);
    }
    let enable = store.get_bool_or(AUTOSTART_KEY, AUTOSTART_DEFAULT);

    let autostart_manager = app.autolaunch();

    let is_enabled = autostart_manager
        .is_enabled()
        .context("failed to check whether autostart is enabled")?;
    if enable == is_enabled {
        // If we don't return here, `autostart_manager.disable()` below
        // will return an error, at least on Windows.
        return Ok(());
    }

    if enable {
        autostart_manager
            .enable()
            .context("failed to enable autostart")?;
    } else {
        autostart_manager
            .disable()
            .context("failed to disable autostart")?;
    }
    Ok(())
}
