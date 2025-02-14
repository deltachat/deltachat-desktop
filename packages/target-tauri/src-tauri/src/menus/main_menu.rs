use std::{borrow::BorrowMut, path::PathBuf};

use log::info;
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Builder, Emitter, Manager, Runtime,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use crate::{help_window::open_help_window, settings::ZOOM_FACTOR_KEY, state::app::AppState};

pub(crate) fn create_main_menu<A: Runtime>(builder: Builder<A>) -> Builder<A> {
    let builder = builder.menu(|handle| {
        // let store = handle.get_store("config.json").unwrap();

        // let zoom_factor: f64 = store
        //     .get(ZOOM_FACTOR_KEY)
        //     .and_then(|f| f.as_f64())
        //     .unwrap_or(10.0);

        let zoom_factor = 1.0;
        Menu::with_items(
            handle,
            &[
                &Submenu::with_items(
                    handle,
                    "File",
                    true,
                    &[
                        &MenuItem::with_id(handle, "quit", "Quit", true, None::<&str>)?,
                        &MenuItem::with_id(handle, "settings", "Settings", true, None::<&str>)?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "Edit",
                    true,
                    &[
                        &PredefinedMenuItem::undo(handle, Some("Undo"))?,
                        &PredefinedMenuItem::redo(handle, Some("Redo"))?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::cut(handle, Some("Cut"))?,
                        &PredefinedMenuItem::copy(handle, Some("Copy"))?,
                        &PredefinedMenuItem::paste(handle, Some("Paste"))?,
                        &MenuItem::with_id(handle, "delete", "Delete", true, None::<&str>)?,
                        &PredefinedMenuItem::select_all(handle, Some("Select All"))?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "View",
                    true,
                    &[
                        &MenuItem::with_id(
                            handle,
                            "float_on_top",
                            "Float on Top",
                            false,
                            None::<&str>,
                        )?,
                        &Submenu::with_items(
                            handle,
                            "Zoom",
                            true,
                            &[
                                &CheckMenuItem::with_id(
                                    handle,
                                    "zoom_06",
                                    "0.6x Extra Small",
                                    true,
                                    zoom_factor == 0.6,
                                    None::<&str>,
                                )?,
                                &CheckMenuItem::with_id(
                                    handle,
                                    "zoom_08",
                                    "0.8x Small",
                                    true,
                                    zoom_factor == 0.8,
                                    None::<&str>,
                                )?,
                                &CheckMenuItem::with_id(
                                    handle,
                                    "zoom_10",
                                    "1.0x Normal",
                                    true,
                                    zoom_factor == 1.0,
                                    None::<&str>,
                                )?,
                                &CheckMenuItem::with_id(
                                    handle,
                                    "zoom_12",
                                    "1.2x Large",
                                    true,
                                    zoom_factor == 1.2,
                                    None::<&str>,
                                )?,
                                &CheckMenuItem::with_id(
                                    handle,
                                    "zoom_14",
                                    "1.4x Extra Large",
                                    true,
                                    zoom_factor == 1.4,
                                    None::<&str>,
                                )?,
                            ],
                        )?,
                        &Submenu::with_items(
                            handle,
                            "Developer",
                            true,
                            &[
                                // Use `with_id` instead of new, add new parameter after `handle`
                                &MenuItem::with_id(
                                    handle,
                                    "dev_tools",
                                    "Open Developer Tools",
                                    true,
                                    None::<&str>,
                                )?,
                                &MenuItem::with_id(
                                    handle,
                                    "log_folder",
                                    "Open the Log Folder",
                                    true,
                                    None::<&str>,
                                )?,
                                &MenuItem::with_id(
                                    handle,
                                    "current_log_file",
                                    "Open Current Log File",
                                    true,
                                    None::<&str>,
                                )?,
                            ],
                        )?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "Help",
                    true,
                    &[
                        &MenuItem::with_id(handle, "help", "Help", true, None::<&str>)?,
                        &MenuItem::with_id(
                            handle,
                            "keybindings",
                            "Keybindings",
                            true,
                            None::<&str>,
                        )?,
                        &MenuItem::with_id(
                            handle,
                            "learn",
                            "Learn more about Delta Chat",
                            true,
                            None::<&str>,
                        )?,
                        &MenuItem::with_id(
                            handle,
                            "contribute",
                            "Contribute on Github",
                            true,
                            None::<&str>,
                        )?,
                        &PredefinedMenuItem::separator(handle)?,
                        &MenuItem::with_id(
                            handle,
                            "report",
                            "Report an Issue",
                            true,
                            None::<&str>,
                        )?,
                        &MenuItem::with_id(
                            handle,
                            "about",
                            "About Delta Chat",
                            true,
                            None::<&str>,
                        )?,
                    ],
                )?,
            ],
        )
    });
    builder.on_menu_event(|app, event| {
        match event.id().as_ref() {
            "settings" => {
                app.emit("showSettingsDialog", None::<String>).ok();
            }
            "help" => {
                open_help_window(app.clone(), "", None).ok();
            }
            "quit" => {
                app.exit(0);
            }
            "delete" => { /* Not supported by Tauri */ }
            "float_on_top" => {
                /* Not supported by Tauri
                https://docs.rs/tauri/latest/tauri/window/struct.Window.html#method.set_visible_on_all_workspaces
                */
            }
            "zoom_06" => {
                app.menu()
                    .unwrap()
                    .get("zoom_06")
                    .unwrap()
                    .as_check_menuitem()
                    .unwrap()
                    .set_checked(true)
                    .unwrap();
                set_zoom(app, 0.6);
            }
            "zoom_08" => {
                set_zoom(app, 0.8);
            }
            "zoom_10" => {
                set_zoom(app, 1.0);
            }
            "zoom_12" => {
                set_zoom(app, 1.2);
            }
            "zoom_14" => {
                set_zoom(app, 1.4);
            }
            "dev_tools" => {
                app.get_webview_window("main").unwrap().open_devtools();
            }
            "log_folder" => {
                if let Ok(path) = &app.path().app_log_dir() {
                    if let Some(path) = path.to_str() {
                        app.opener().open_path(path, None::<String>).ok();
                    }
                }
            }
            "current_log_file" => {
                let path = || app.state::<AppState>().current_log_file_path.clone();
                app.opener().open_path(path(), None::<String>).ok();
            }
            "keybindings" => {
                app.emit("showKeybindingsDialog", None::<String>).unwrap();
            }
            "contribute" => {
                app.opener()
                    .open_url(
                        "https://github.com/deltachat/deltachat-desktop",
                        None::<String>,
                    )
                    .unwrap();
            }
            "report" => {
                app.opener()
                    .open_url(
                        "https://github.com/deltachat/deltachat-desktop/issues",
                        None::<String>,
                    )
                    .unwrap();
            }
            "learn" => {
                app.opener()
                    .open_url("https://delta.chat/de/", None::<String>)
                    .unwrap();
            }
            "about" => {
                app.emit("showAboutDialog", None::<String>).unwrap();
            }
            _ => {
                info!("menu event not handled: {:?}", event.id());
            }
        }
    })
}

fn set_zoom<A: Runtime>(app: &AppHandle<A>, zoom: f64) {
    let webview = app.get_webview_window("main").unwrap();
    webview.set_zoom(zoom).unwrap();
}
