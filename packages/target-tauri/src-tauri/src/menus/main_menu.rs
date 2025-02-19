use std::str::FromStr;

use log::info;
use strum_macros::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuId, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Builder, Emitter, Manager, Runtime,
};
use tauri_plugin_opener::OpenerExt;

use crate::{help_window::open_help_window, AppState};

#[derive(Debug, AsRefStr, EnumString)]
enum MenuAction {
    Settings,
    Help,
    Quit,
    Delete,
    FloatOnTop,
    Zoom(f64),
    DevTools,
    LogFolder,
    CurrentLogFile,
    Keybindings,
    Contribute,
    Report,
    Learn,
    About,
}

impl From<MenuAction> for MenuId {
    fn from(action: MenuAction) -> Self {
        MenuId::new(action.as_ref())
    }
}

impl From<&MenuId> for MenuAction {
    fn from(item: &MenuId) -> Self {
        MenuAction::from_str(item.as_ref()).expect("conversion error")
    }
}

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
                        &MenuItem::with_id(
                            handle,
                            MenuAction::Quit,
                            MenuAction::Quit.as_ref(),
                            true,
                            None::<&str>,
                        )?,
                        &MenuItem::with_id(
                            handle,
                            MenuAction::Settings,
                            MenuAction::Settings.as_ref(),
                            true,
                            None::<&str>,
                        )?,
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
                        &MenuItem::with_id(
                            handle,
                            MenuAction::Delete.as_ref(),
                            "Delete",
                            true,
                            None::<&str>,
                        )?,
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
                                #[cfg(feature = "crabnebula_extras")]
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
        match MenuAction::from(event.id()) {
            MenuAction::Settings => {
                app.emit("showSettingsDialog", None::<String>).ok();
            }
            MenuAction::Help => {
                open_help_window(app.clone(), "", None).ok();
            }
            MenuAction::Quit => {
                app.exit(0);
            }
            MenuAction::Delete => { /* Not supported by Tauri */ }
            MenuAction::FloatOnTop => {
                app.get_webview_window("main")
                    .unwrap()
                    .set_always_on_top(true)
                    .ok();
            }
            MenuAction::Zoom(0.6) => {
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
            MenuAction::Zoom(0.8) => {
                set_zoom(app, 0.8);
            }
            MenuAction::Zoom(1.0) => {
                set_zoom(app, 1.0);
            }
            MenuAction::Zoom(1.2) => {
                set_zoom(app, 1.2);
            }
            MenuAction::Zoom(1.4) => {
                set_zoom(app, 1.4);
            }
            MenuAction::DevTools => {
                app.get_webview_window("main").unwrap().open_devtools();
            }
            MenuAction::LogFolder => {
                if let Ok(path) = &app.path().app_log_dir() {
                    if let Some(path) = path.to_str() {
                        app.opener().open_path(path, None::<String>).ok();
                    }
                }
            }
            MenuAction::CurrentLogFile => {
                let path = || app.state::<AppState>().current_log_file_path.clone();
                app.opener().open_path(path(), None::<String>).ok();
            }
            MenuAction::Keybindings => {
                app.emit("showKeybindingsDialog", None::<String>).unwrap();
            }
            MenuAction::Contribute => {
                app.opener()
                    .open_url(
                        "https://github.com/deltachat/deltachat-desktop",
                        None::<String>,
                    )
                    .unwrap();
            }
            MenuAction::Report => {
                app.opener()
                    .open_url(
                        "https://github.com/deltachat/deltachat-desktop/issues",
                        None::<String>,
                    )
                    .unwrap();
            }
            MenuAction::Learn => {
                app.opener()
                    .open_url("https://delta.chat/de/", None::<String>)
                    .unwrap();
            }
            MenuAction::About => {
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
