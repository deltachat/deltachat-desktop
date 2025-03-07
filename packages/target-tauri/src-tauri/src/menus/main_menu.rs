use super::MainMenuAction;
use crate::settings::ZOOM_FACTOR_KEY;
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Runtime,
};
use tauri_plugin_store::StoreExt;

pub(crate) fn create_main_menu<A: Runtime>(handle: &AppHandle<A>) -> anyhow::Result<Menu<A>> {
    let zoom_factor = handle
        .get_store("config.json")
        .and_then(|store| store.get(ZOOM_FACTOR_KEY))
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);

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
                        MainMenuAction::Quit,
                        MainMenuAction::Quit,
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Settings,
                        MainMenuAction::Settings,
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
                    &PredefinedMenuItem::select_all(handle, Some("Select All"))?,
                ],
            )?,
            &Submenu::with_items(
                handle,
                "View",
                true,
                &[
                    &CheckMenuItem::with_id(
                        handle,
                        MainMenuAction::FloatOnTop,
                        "Float on Top",
                        true,
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
                                MainMenuAction::Zoom06,
                                "0.6x Extra Small",
                                true,
                                zoom_factor == 0.6,
                                None::<&str>,
                            )?,
                            &CheckMenuItem::with_id(
                                handle,
                                MainMenuAction::Zoom08,
                                "0.8x Small",
                                true,
                                zoom_factor == 0.8,
                                None::<&str>,
                            )?,
                            &CheckMenuItem::with_id(
                                handle,
                                MainMenuAction::Zoom10,
                                "1.0x Normal",
                                true,
                                zoom_factor == 1.0,
                                None::<&str>,
                            )?,
                            &CheckMenuItem::with_id(
                                handle,
                                MainMenuAction::Zoom12,
                                "1.2x Large",
                                true,
                                zoom_factor == 1.2,
                                None::<&str>,
                            )?,
                            &CheckMenuItem::with_id(
                                handle,
                                MainMenuAction::Zoom14,
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
                            #[cfg(feature = "crabnebula_extras")]
                            &MenuItem::with_id(
                                handle,
                                MainMenuAction::DevTools,
                                "Open Developer Tools",
                                true,
                                None::<&str>,
                            )?,
                            &MenuItem::with_id(
                                handle,
                                MainMenuAction::LogFolder,
                                "Open the Log Folder",
                                true,
                                None::<&str>,
                            )?,
                            &MenuItem::with_id(
                                handle,
                                MainMenuAction::CurrentLogFile,
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
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Help,
                        MainMenuAction::Help,
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Keybindings,
                        "Keybindings",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Learn,
                        "Learn more about Delta Chat",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Contribute,
                        "Contribute on Github",
                        true,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::separator(handle)?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::Report,
                        "Report an Issue",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        MainMenuAction::About,
                        "About Delta Chat",
                        true,
                        None::<&str>,
                    )?,
                ],
            )?,
        ],
    )
    .map_err(anyhow::Error::from)
}
