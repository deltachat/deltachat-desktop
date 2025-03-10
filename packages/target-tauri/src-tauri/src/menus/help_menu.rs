use crate::{
    settings::{apply_zoom_factor_help_window, CONFIG_FILE, HELP_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManger,
};

use super::{float_on_top::HELP_FLOATING, menu_action::MenuAction};
use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager, Wry,
};
use tauri_plugin_store::StoreExt;

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum HelpMenuAction {
    HelpQuit,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    HelpFloatOnTop,
}

super::menu_action::impl_menu_conversion!(HelpMenuAction);

impl MenuAction<'static> for HelpMenuAction {
    fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let help_window = app
            .get_webview_window("help")
            .context("help window not found")?;
        let menu_manager = app.state::<MenuManger>();
        match self {
            HelpMenuAction::HelpQuit => {
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
            HelpMenuAction::HelpFloatOnTop => {
                let previous = HELP_FLOATING.fetch_xor(true, std::sync::atomic::Ordering::SeqCst);
                help_window.set_always_on_top(previous)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
        }
        Ok(())
    }
}

pub(crate) fn create_help_menu(app: &AppHandle) -> anyhow::Result<Menu<Wry>> {
    let menu = Menu::with_items(
        app,
        &[
            &Submenu::with_items(
                app,
                "File",
                true,
                &[&MenuItem::with_id(
                    app,
                    HelpMenuAction::HelpQuit,
                    "Quit",
                    true,
                    None::<&str>,
                )?],
            )?,
            &Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::copy(app, Some("Copy"))?,
                    &PredefinedMenuItem::select_all(app, Some("Select All"))?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "View",
                true,
                &[
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::ResetZoom,
                        "Actual Size",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(app, HelpMenuAction::ZoomIn, "Zoom In", true, None::<&str>)?,
                    &MenuItem::with_id(
                        app,
                        HelpMenuAction::ZoomOut,
                        "Zoom Out",
                        true,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::separator(app)?,
                    &CheckMenuItem::with_id(
                        app,
                        HelpMenuAction::HelpFloatOnTop,
                        "Float on Top",
                        true,
                        HELP_FLOATING.load(std::sync::atomic::Ordering::Relaxed),
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(app, Some("Toggle Full Screen"))?,
                ],
            )?,
        ],
    )?;

    Ok(menu)
}
