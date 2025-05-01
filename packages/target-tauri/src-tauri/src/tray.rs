use anyhow::Context;
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder},
    AppHandle, Manager,
};
use tauri_plugin_store::StoreExt;

use crate::{
    menus::tray_menu::create_tray_menu, run_config::RunConfig, settings::StoreExtBoolExt,
    CONFIG_FILE, MINIMIZE_TO_TRAY, MINIMIZE_TO_TRAY_DEFAULT,
};

pub fn is_tray_icon_active(app: &AppHandle) -> anyhow::Result<bool> {
    let rc = app.state::<RunConfig>();
    let minimize_to_tray = app
        .get_store(CONFIG_FILE)
        .context("failed to load config")?
        .get_bool_or(MINIMIZE_TO_TRAY, MINIMIZE_TO_TRAY_DEFAULT);

    Ok(rc.forced_tray_icon || minimize_to_tray)
}

pub(crate) fn build_tray_icon(app: &AppHandle) -> anyhow::Result<TrayIcon> {
    let menu = create_tray_menu(app)?;

    let mut tray_builder = TrayIconBuilder::new().menu(&menu);

    #[cfg(feature = "flatpak")]
    {
        use std::str::FromStr;
        use std::{env, path::PathBuf};

        let xdg_runtime_dir =
            env::var("XDG_RUNTIME_DIR").expect("XDG_RUNTIME_DIR is not set, this shouldn't happen");
        let flatpak_app_id =
            env::var("FLATPAK_ID").expect("FLATPAK_ID is not set, this shouldn't happen");
        let path = PathBuf::from_str(&xdg_runtime_dir)
            .expect("XDG_RUNTIME_DIR is not a valid path")
            .join("app")
            .join(&flatpak_app_id);
        tray_builder = tray_builder.temp_dir_path(path);
    }

    tray_builder = tray_builder.icon(app.default_window_icon().unwrap().clone());

    // // special style icon for macOS
    // // (TODO, for now we use the tauri icon until dc tauri is really the default release?)
    // #[cfg(target_os = "macos")]
    // if let Some(icon) = app
    //     .asset_resolver()
    //     .get("images/tray/tray-icon-mac@2x.png".to_string())
    // {
    //     // TODO fix image scale
    //     tray_builder = tray_builder
    //         .icon(Image::from_bytes(&icon.bytes)?)
    //         .icon_as_template(true);
    // } else {
    //     log::error!("tray icon asset not found!")
    // }

    if !cfg!(target_os = "macos") {
        // outside of mac open app when clicking on tray icon
        tray_builder = tray_builder
            .show_menu_on_left_click(false)
            .on_tray_icon_event(|tray, event| {
                if let tauri::tray::TrayIconEvent::Click {
                    button: MouseButton::Left,
                    // For a regular click, we'd get two `TrayIconEvent::Click`,
                    // one for Down, the other for Up.
                    // Let's only run the handler once per click.
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
                    let Some(main_window) = tray.app_handle().get_window("main") else {
                        return;
                    };

                    // It'd be nice to use `.is_focused()` instead,
                    // but unfortunately, upon a tray icon click,
                    // it always loses focus before the event fires.
                    let is_visible = main_window.is_visible().unwrap_or(false);

                    if is_visible {
                        if let Err(err) = main_window.hide() {
                            log::error!("failed to hide window after click on tray icon: {err}");
                        }
                    } else {
                        if let Err(err) = main_window.show() {
                            log::error!("failed to restore window after click on tray icon: {err}");
                        }
                        if let Err(err) = main_window.set_focus() {
                            log::error!("failed to focus window after click on tray icon: {err}");
                        }
                    }
                }
            });
    }

    let tray = tray_builder.build(app)?;

    Ok(tray)
}
