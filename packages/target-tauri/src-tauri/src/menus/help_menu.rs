use crate::{
    settings::{apply_zoom_factor_help_window, CONFIG_FILE, HELP_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManager,
    TranslationState,
};

use super::menu_action::MenuAction;
use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager, WebviewWindow, Wry,
};
use tauri_plugin_store::StoreExt;

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum HelpMenuAction {
    QuitApp,
    CloseHelp,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    FloatOnTop,
}

super::menu_action::impl_menu_conversion!(HelpMenuAction);

impl MenuAction<'static> for HelpMenuAction {
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let help_window = app
            .get_webview_window("help")
            .context("help window not found")?;
        let menu_manager = app.state::<MenuManager>();
        match self {
            HelpMenuAction::QuitApp => {
                app.exit(0);
            }
            HelpMenuAction::CloseHelp => {
                help_window.close()?;
            }
            HelpMenuAction::ZoomIn | HelpMenuAction::ZoomOut | HelpMenuAction::ResetZoom => {
                let store = app
                    .get_store(CONFIG_FILE)
                    .context("config store not found")?;
                let curr_zoom: f64 = store
                    .get(HELP_ZOOM_FACTOR_KEY)
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);

                let new_zoom = match self {
                    HelpMenuAction::ZoomIn => curr_zoom * 1.2,
                    HelpMenuAction::ResetZoom => 1.,
                    HelpMenuAction::ZoomOut => curr_zoom * 0.8,
                    _ => unreachable!(),
                };

                store.set(HELP_ZOOM_FACTOR_KEY, new_zoom);
                apply_zoom_factor_help_window(app)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
            HelpMenuAction::FloatOnTop => {
                help_window.set_always_on_top(!help_window.is_always_on_top()?)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
        }
        Ok(())
    }
}

pub(crate) fn create_help_menu(
    app: &AppHandle,
    help_window: &WebviewWindow,
) -> anyhow::Result<Menu<Wry>> {
    let tx: tauri::State<'_, TranslationState> = app.state::<TranslationState>();
    let quit = MenuItem::with_id(
        app,
        HelpMenuAction::QuitApp,
        // Same as in html_window_menu.
        // TODO for some languages this is not quite correct.
        format!(
            "{} {}",
            tx.sync_translate("global_menu_file_quit_desktop"),
            tx.sync_translate("app_name")
        ),
        true,
        Some("CmdOrCtrl+Q"),
    )?;
    Menu::with_items(
        app,
        &[
            &Submenu::with_items(
                app,
                tx.sync_translate("file"),
                true,
                &[
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::CloseHelp,
                        format!(
                            "{} {}",
                            tx.sync_translate("close"),
                            tx.sync_translate("menu_help")
                        ),
                        true,
                        Some("CmdOrCtrl+W"),
                    )?,
                    &quit,
                ],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_edit_desktop"),
                true,
                &[
                    &PredefinedMenuItem::copy(
                        app,
                        Some(&tx.sync_translate("global_menu_edit_copy_desktop")),
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
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::ResetZoom,
                        tx.sync_translate("actual_size"),
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::ZoomIn,
                        tx.sync_translate("menu_zoom_in"),
                        true,
                        if cfg!(target_os = "macos") {
                            Some("Command++")
                        } else {
                            Some("Ctrl++")
                        },
                    )?,
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::ZoomOut,
                        tx.sync_translate("menu_zoom_out"),
                        true,
                        if cfg!(target_os = "macos") {
                            Some("Command+-")
                        } else {
                            Some("Ctrl+-")
                        },
                    )?,
                    &PredefinedMenuItem::separator(app)?,
                    &CheckMenuItem::with_id(
                        app,
                        HelpMenuAction::FloatOnTop,
                        tx.sync_translate("global_menu_view_floatontop_desktop"),
                        true,
                        help_window.is_always_on_top()?,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(
                        app,
                        Some(&tx.sync_translate("toggle_fullscreen")),
                    )?,
                ],
            )?,
        ],
    )
    .map_err(|err| err.into())
}
