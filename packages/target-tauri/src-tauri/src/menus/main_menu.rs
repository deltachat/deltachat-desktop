use std::str::FromStr;

use crate::{
    help_window::open_help_window,
    settings::{apply_zoom_factor, CONFIG_FILE, LOCALE_KEY, ZOOM_FACTOR_KEY},
    state::{main_window_channels::MainWindowEvents, menu_manager::MenuManager},
    AppState, MainWindowChannels, TranslationState,
};
use anyhow::Context;
use log::error;
use strum::{AsRefStr, EnumString};
use tauri::{
    async_runtime::spawn,
    menu::{CheckMenuItem, IsMenuItem, Menu, MenuId, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager, WebviewWindow, Wry,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use super::menu_action::{impl_menu_conversion, MenuAction};

pub(crate) const SET_LOCALE_MENU_ID_PREFIX: &str = "set_language";

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum MainMenuAction {
    Settings,
    Help,
    Quit,
    CloseWindow,
    FloatOnTop,
    Zoom06,
    Zoom08,
    Zoom10,
    Zoom12,
    Zoom14,
    #[cfg(any(feature = "inspector_in_production", dev))]
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
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let main_window = app
            .get_webview_window("main")
            .context("main window not found")?;
        let menu_manager = app.state::<MenuManager>();
        let channels = app.state::<MainWindowChannels>();

        match self {
            MainMenuAction::Settings => {
                channels
                    .emit_event(MainWindowEvents::ShowSettingsDialog)
                    .await?;
            }
            MainMenuAction::Help => {
                let app_clone = app.clone();
                spawn(async move {
                    let menu_manager = app_clone.state::<MenuManager>();
                    if let Err(err) =
                        open_help_window(app_clone.clone(), menu_manager, None, None).await
                    {
                        error!("failed to open help window: {err}");
                    }
                });
            }
            MainMenuAction::Quit => {
                app.exit(0);
            }
            MainMenuAction::CloseWindow => {
                main_window.close()?;
            }
            MainMenuAction::FloatOnTop => {
                main_window.set_always_on_top(!main_window.is_always_on_top()?)?;
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

            #[cfg(any(feature = "inspector_in_production", dev))]
            MainMenuAction::DevTools => {
                if main_window.is_devtools_open() {
                    main_window.close_devtools();
                } else {
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
                channels
                    .emit_event(MainWindowEvents::ShowKeybindingsDialog)
                    .await?;
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
                    .open_url("https://delta.chat", None::<String>)?;
            }
            MainMenuAction::About => {
                channels
                    .emit_event(MainWindowEvents::ShowAboutDialog)
                    .await?;
            }
        }
        Ok(())
    }
}

pub(crate) fn create_main_menu(
    app: &AppHandle,
    main_window: &WebviewWindow,
) -> anyhow::Result<Menu<Wry>> {
    let store = app.get_store(CONFIG_FILE).context("could not load store")?;
    let tx = app.state::<TranslationState>();
    let zoom_factor = store
        .get(ZOOM_FACTOR_KEY)
        .and_then(|f| f.as_f64())
        .unwrap_or(1.0);
    let current_language_key = store
        .get(LOCALE_KEY)
        .and_then(|s| s.as_str().map(|s| s.to_owned()))
        .unwrap_or("load_failed".to_owned());

    let quit = MenuItem::with_id(
        app,
        MainMenuAction::Quit,
        tx.sync_translate("global_menu_file_quit_desktop"),
        true,
        Some("CmdOrCtrl+Q"),
    )?;
    let close_window = MenuItem::with_id(
        app,
        MainMenuAction::CloseWindow,
        tx.sync_translate("close_window"),
        true,
        Some("CmdOrCtrl+W"),
    )?;
    let settings = MenuItem::with_id(
        app,
        MainMenuAction::Settings,
        tx.sync_translate("menu_settings"),
        true,
        Some("CmdOrCtrl+,"),
    )?;
    let float_on_top = CheckMenuItem::with_id(
        app,
        MainMenuAction::FloatOnTop,
        tx.sync_translate("global_menu_view_floatontop_desktop"),
        true,
        main_window.is_always_on_top()?,
        None::<&str>,
    )?;
    let zoom_menu = Submenu::with_items(
        app,
        tx.sync_translate("zoom"),
        true,
        &[
            &CheckMenuItem::with_id(
                app,
                MainMenuAction::Zoom06,
                format!("0.6x {}", tx.sync_translate("extra_small")),
                true,
                zoom_factor == 0.6,
                None::<&str>,
            )?,
            &CheckMenuItem::with_id(
                app,
                MainMenuAction::Zoom08,
                format!("0.8x {}", tx.sync_translate("small")),
                true,
                zoom_factor == 0.8,
                None::<&str>,
            )?,
            &CheckMenuItem::with_id(
                app,
                MainMenuAction::Zoom10,
                format!("1.0x {}", tx.sync_translate("normal")),
                true,
                zoom_factor == 1.0,
                None::<&str>,
            )?,
            &CheckMenuItem::with_id(
                app,
                MainMenuAction::Zoom12,
                format!("1.2x {}", tx.sync_translate("large")),
                true,
                zoom_factor == 1.2,
                None::<&str>,
            )?,
            &CheckMenuItem::with_id(
                app,
                MainMenuAction::Zoom14,
                format!("1.4x {}", tx.sync_translate("extra_large")),
                true,
                zoom_factor == 1.4,
                None::<&str>,
            )?,
        ],
    )?;
    let developer_menu = Submenu::with_items(
        app,
        tx.sync_translate("global_menu_view_developer_desktop"),
        true,
        &[
            #[cfg(any(feature = "inspector_in_production", dev))]
            &MenuItem::with_id(
                app,
                MainMenuAction::DevTools,
                tx.sync_translate("global_menu_view_developer_tools_desktop"),
                true,
                if cfg!(target_os = "macos") {
                    Some("Alt+Command+I")
                } else {
                    Some("Ctrl+Shift+I")
                },
            )?,
            &MenuItem::with_id(
                app,
                MainMenuAction::LogFolder,
                tx.sync_translate("menu.view.developer.open.log.folder"),
                true,
                None::<&str>,
            )?,
            &MenuItem::with_id(
                app,
                MainMenuAction::CurrentLogFile,
                tx.sync_translate("menu.view.developer.open.current.log.file"),
                true,
                None::<&str>,
            )?,
        ],
    )?;

    Menu::with_items(
        app,
        &[
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_file_desktop"),
                true,
                &[&settings, &quit],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_file_desktop"),
                true,
                &[
                    // macOS has this in the app menu already
                    #[cfg(not(target_os = "macos"))]
                    &settings,
                    &close_window,
                    // macOS has this in the app menu already
                    #[cfg(not(target_os = "macos"))]
                    &quit,
                ],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_edit_desktop"),
                true,
                &[
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::undo(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_undo_desktop")),
                    )?,
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::redo(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_redo_desktop")),
                    )?,
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_cut_desktop")),
                    )?,
                    &PredefinedMenuItem::copy(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_copy_desktop")),
                    )?,
                    &PredefinedMenuItem::paste(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_paste_desktop")),
                    )?,
                    &PredefinedMenuItem::select_all(
                        app,
                        Some(&tx.sync_translate("menu_select_all")),
                    )?,
                ],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_view_desktop"),
                true,
                &[
                    &float_on_top,
                    &zoom_menu,
                    &get_locales_menu(app, &current_language_key)?,
                    &PredefinedMenuItem::separator(app)?,
                    &developer_menu,
                ],
            )?,
            &get_help_menu(app)?,
        ],
    )
    .map_err(|err| err.into())
}

fn get_locales_menu(
    app: &AppHandle,
    current_language_key: &str,
) -> anyhow::Result<Submenu<tauri::Wry>> {
    let tx = app.state::<TranslationState>();
    let languages = app.state::<AppState>().all_languages_for_menu.clone();

    let languages_items: Vec<Box<dyn IsMenuItem<tauri::Wry>>> = languages
        .iter()
        .map(|(id, name)| {
            Ok::<Box<dyn IsMenuItem<tauri::Wry>>, anyhow::Error>(Box::new(CheckMenuItem::with_id(
                app,
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

    Submenu::with_items(
        app,
        tx.sync_translate("pref_language"),
        true,
        &languages_items,
    )
    .map_err(|err| err.into())
}

pub(crate) fn get_help_menu(app: &AppHandle) -> anyhow::Result<Submenu<Wry>> {
    let tx = app.state::<TranslationState>();

    let help = MenuItem::with_id(
        app,
        MainMenuAction::Help,
        tx.sync_translate("global_menu_help_desktop"),
        true,
        Some("F1"),
    )?;
    let keybindings = MenuItem::with_id(
        app,
        MainMenuAction::Keybindings,
        tx.sync_translate("keybindings"),
        true,
        Some("CmdOrCtrl+/"),
    )?;
    let learn_more = MenuItem::with_id(
        app,
        MainMenuAction::Learn,
        tx.sync_translate("learn_more"),
        true,
        None::<&str>,
    )?;
    let contribute = MenuItem::with_id(
        app,
        MainMenuAction::Contribute,
        tx.sync_translate("contribute"),
        true,
        None::<&str>,
    )?;
    let report_issue = MenuItem::with_id(
        app,
        MainMenuAction::Report,
        tx.sync_translate("global_menu_help_report_desktop"),
        true,
        None::<&str>,
    )?;
    let about = MenuItem::with_id(
        app,
        MainMenuAction::About,
        tx.sync_translate("global_menu_help_about_desktop"),
        true,
        None::<&str>,
    )?;

    Ok(Submenu::with_items(
        app,
        tx.sync_translate("global_menu_help_desktop"),
        true,
        &[
            &help,
            &keybindings,
            &PredefinedMenuItem::separator(app)?,
            &learn_more,
            &contribute,
            &report_issue,
            &PredefinedMenuItem::separator(app)?,
            &about,
        ],
    )?)
}
