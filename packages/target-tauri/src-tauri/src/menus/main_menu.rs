use log::info;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Builder, Emitter, Manager, Runtime,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use crate::help_window::open_help_window;

pub(crate) fn create_main_menu<A: Runtime>(builder: Builder<A>) -> Builder<A> {
    let builder = builder.menu(|handle| {
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
                            true,
                            None::<&str>,
                        )?,
                        &Submenu::with_items(
                            handle,
                            "Zoom",
                            true,
                            &[
                                &MenuItem::with_id(
                                    handle,
                                    "zoom_06",
                                    "0.6x Extra Small",
                                    true,
                                    None::<&str>,
                                )?,
                                // Also use with_id here:
                                &MenuItem::with_id(
                                    handle,
                                    "zoom_08",
                                    "0.8x Small",
                                    true,
                                    None::<&str>,
                                )?,
                                &MenuItem::with_id(
                                    handle,
                                    "zoom_10",
                                    "1.0x Normal",
                                    true,
                                    None::<&str>,
                                )?,
                                &MenuItem::with_id(
                                    handle,
                                    "zoom_12",
                                    "1.2x Large",
                                    true,
                                    None::<&str>,
                                )?,
                                &MenuItem::with_id(
                                    handle,
                                    "zoom_14",
                                    "1.4x Extra Large",
                                    true,
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
                        &MenuItem::new(handle, "keybindings", true, None::<&str>)?,
                        &MenuItem::new(handle, "learn", true, None::<&str>)?,
                        &MenuItem::new(handle, "contribute", true, None::<&str>)?,
                        &MenuItem::new(handle, "report", true, None::<&str>)?,
                        &MenuItem::new(handle, "about", true, None::<&str>)?,
                    ],
                )?,
            ],
        )
    });
    builder.on_menu_event(|app, event| {
        println!("menu event: {:?}", event);

        match event.id().as_ref() {
            "settings" => {
                app.emit("open:settings", None::<String>);
            }
            "help" => {
                open_help_window(app.clone(), "", None);
            }
            "quit" => {
                app.exit(0);
            }
            "delete" => {
                app.emit("delete", None::<()>);
            }
            "float_on_top" => {}
            "zoom_06" => {
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
                // app.get_store()
            }
            "current_log_file" => {}
            "keybindings" => {
                app.emit("open:keybindings", None::<String>).unwrap();
            }
            "learn" => {
                app.opener();
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
            "about" => {
                app.opener()
                    .open_url("https://delta.chat/de/", None::<String>)
                    .unwrap();
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
