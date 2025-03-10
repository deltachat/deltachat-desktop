use std::{str::FromStr, sync::atomic::Ordering};

use crate::{
    help_window::open_help_window,
    settings::{apply_zoom_factor, CONFIG_FILE, LOCALE_KEY, ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManger,
    AppState,
};
use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, IsMenuItem, Menu, MenuId, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Emitter, Manager, Wry,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use super::{
    float_on_top::MAIN_FLOATING,
    menu_action::{impl_menu_conversion, MenuAction},
};

pub(crate) const SET_LOCALE_MENU_ID_PREFIX: &str = "set_language";

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum MainMenuAction {
    Settings,
    Help,
    Quit,
    FloatOnTop,
    Zoom06,
    Zoom08,
    Zoom10,
    Zoom12,
    Zoom14,
    DevTools,
    LogFolder,
    CurrentLogFile,
    Keybindings,
    Contribute,
    Report,
    Learn,
    About,
}

impl_menu_conversion!(MainMenuAction);

impl MenuAction<'static> for MainMenuAction {
    fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let main_window = app
            .get_webview_window("main")
            .context("main window not found")?;
        let menu_manager = app.state::<MenuManger>();

        match self {
            MainMenuAction::Settings => {
                app.emit("showSettingsDialog", None::<String>)?;
            }
            MainMenuAction::Help => {
                open_help_window(app.clone(), menu_manager, "", None)?;
            }
            MainMenuAction::Quit => {
                app.exit(0);
            }
            MainMenuAction::FloatOnTop => {
                let previous = MAIN_FLOATING.fetch_xor(true, std::sync::atomic::Ordering::SeqCst);
                main_window.set_always_on_top(previous)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
            MainMenuAction::Zoom06
            | MainMenuAction::Zoom08
            | MainMenuAction::Zoom10
            | MainMenuAction::Zoom12
            | MainMenuAction::Zoom14 => {
                let zoom_factor = match self {
                    MainMenuAction::Zoom06 => 0.6,
                    MainMenuAction::Zoom08 => 0.8,
                    MainMenuAction::Zoom10 => 1.0,
                    MainMenuAction::Zoom12 => 1.2,
                    MainMenuAction::Zoom14 => 1.4,
                    _ => unreachable!(),
                };
                let store = app.store(CONFIG_FILE)?;
                store.set(ZOOM_FACTOR_KEY, zoom_factor);
                apply_zoom_factor(app)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }

            MainMenuAction::DevTools => {
                if cfg!(feature = "inspector_in_production") {
                    main_window.open_devtools();
                }
            }
            MainMenuAction::LogFolder => {
                if let Ok(path) = &app.path().app_log_dir() {
                    if let Some(path) = path.to_str() {
                        app.opener().open_path(path, None::<String>)?;
                    }
                }
            }
            MainMenuAction::CurrentLogFile => {
                let path = app.state::<AppState>().current_log_file_path.clone();
                app.opener().open_path(path, None::<String>)?;
            }
            MainMenuAction::Keybindings => {
                app.emit("showKeybindingsDialog", None::<String>)?;
            }
            MainMenuAction::Contribute => {
                app.opener().open_url(
                    "https://github.com/deltachat/deltachat-desktop",
                    None::<String>,
                )?;
            }
            MainMenuAction::Report => {
                app.opener().open_url(
                    "https://github.com/deltachat/deltachat-desktop/issues",
                    None::<String>,
                )?;
            }
            MainMenuAction::Learn => {
                app.opener()
                    .open_url("https://delta.chat/de/", None::<String>)?;
            }
            MainMenuAction::About => {
                app.emit("showAboutDialog", None::<String>)?;
            }
        }
        Ok(())
    }
}

pub(crate) fn create_main_menu(handle: &AppHandle) -> anyhow::Result<Menu<Wry>> {
    let store = handle
        .get_store(CONFIG_FILE)
        .context("could not load store")?;
    let zoom_factor = store
        .get(ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);
    let current_language_key = store
        .get(LOCALE_KEY)
        .and_then(|s| s.as_str().map(|s| s.to_owned()))
        .unwrap_or("load_failed".to_owned());

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
                        MAIN_FLOATING.load(Ordering::Relaxed),
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
                    &get_locales_menu(&handle, &current_language_key)?,
                    &PredefinedMenuItem::separator(handle)?,
                    &Submenu::with_items(
                        handle,
                        "Developer",
                        true,
                        &[
                            #[cfg(feature = "inspector_in_production")]
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
    .map_err(|err| err.into())
}

fn get_locales_menu(
    handle: &AppHandle,
    current_language_key: &str,
) -> anyhow::Result<Submenu<tauri::Wry>> {
    let languages = handle.state::<AppState>().all_languages_for_menu.clone();

    let languages_items: Vec<Box<dyn IsMenuItem<tauri::Wry>>> = languages
        .iter()
        .map(|(id, name)| {
            Ok::<Box<dyn IsMenuItem<tauri::Wry>>, anyhow::Error>(Box::new(CheckMenuItem::with_id(
                handle,
                MenuId::from_str(&format!("{SET_LOCALE_MENU_ID_PREFIX}:{id}"))?,
                name,
                true,
                id == current_language_key,
                None::<&str>,
            )?))
        })
        .collect::<Result<Vec<Box<dyn IsMenuItem<tauri::Wry>>>, anyhow::Error>>()?;

    let languages_items: Vec<&dyn IsMenuItem<tauri::Wry>> =
        languages_items.iter().map(|m| m.as_ref()).collect();

    // TODO find way to transfer the locale name over menu action
    // -> special id for locales?
    //  (TODO find out whats possible)

    Submenu::with_items(handle, "Language", true, &languages_items).map_err(|err| err.into())
}
