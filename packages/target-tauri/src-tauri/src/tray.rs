use anyhow::Context;
use tauri::{
    tray::{MouseButton, TrayIcon, TrayIconBuilder},
    AppHandle, Manager,
};
use tauri_plugin_store::StoreExt;

use crate::{
    get_setting_bool_or, menus::tray_menu::create_tray_menu, CONFIG_FILE, MINIMIZE_TO_TRAY,
    MINIMIZE_TO_TRAY_DEFAULT,
};

pub fn is_tray_icon_active(app: &AppHandle) -> anyhow::Result<bool> {
    // TODO test for --minimized flag or --autostart flag
    let minimize_to_tray = get_setting_bool_or(
        app.get_store(CONFIG_FILE)
            .context("failed to load config")?
            .get(MINIMIZE_TO_TRAY),
        MINIMIZE_TO_TRAY_DEFAULT,
    );
    Ok(minimize_to_tray)
}

pub fn init_tray_icon(app: &AppHandle) -> anyhow::Result<()> {
    if is_tray_icon_active(app)? {
        let tray = build_tray_icon(app)?;

        // TODO tray.set_icon(icon) - to update for badge on non macOS
        // todo register it that we can later unregister it
    }
    Ok(())
}

fn build_tray_icon(app: &AppHandle) -> anyhow::Result<TrayIcon> {
    let menu = create_tray_menu(app)?;

    let mut tray_builder = TrayIconBuilder::new()
        .menu(&menu)
        .icon(app.default_window_icon().unwrap().clone());

    if !cfg!(target_os = "macos") {
        // outside of mac open app when clicking on tray icon
        tray_builder = tray_builder
            .show_menu_on_left_click(false)
            .on_tray_icon_event(|tray, event| {
                if let tauri::tray::TrayIconEvent::Click {
                    button: MouseButton::Left,
                    ..
                } = event
                {
                    if let Some(main_window) = tray.app_handle().get_window("main") {
                        if let Err(err) = main_window.show() {
                            log::error!("failed to restore window after click on tray icon: {err}")
                        }
                    }
                }
            });
    }

    let tray = tray_builder.build(app)?;

    Ok(tray)
}

// TODO tray icon state.
