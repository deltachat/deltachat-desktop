use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem},
    AppHandle, Manager, Wry,
};
use tauri_plugin_store::StoreExt;

use crate::{
    settings::{StoreExtBoolExt, NOTIFICATIONS, NOTIFICATIONS_DEFAULT},
    state::main_window_channels::MainWindowEvents,
    MainWindowChannels, TranslationState, TrayManager, CONFIG_FILE,
};

use super::menu_action::{impl_menu_conversion, MenuAction};

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum TrayMenuAction {
    Quit,
    Show,
    MuteNotifications,
}
impl_menu_conversion!(TrayMenuAction);

impl MenuAction<'static> for TrayMenuAction {
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let main_window = app.get_window("main").context("main window not found")?;

        match self {
            TrayMenuAction::Quit => {
                app.exit(0);
            }
            TrayMenuAction::Show => {
                main_window.show()?;
                main_window.set_focus()?;
            }
            TrayMenuAction::MuteNotifications => {
                // set checkmark to real state in case it didn't change
                app.state::<TrayManager>().update_menu(app).await?;
                // tell frontend to change it
                app.state::<MainWindowChannels>()
                    .emit_event(MainWindowEvents::ToggleNotifications)
                    .await?
            }
        }
        Ok(())
    }
}

pub(crate) fn create_tray_menu(app: &AppHandle) -> anyhow::Result<Menu<Wry>> {
    let tx = app.state::<TranslationState>();
    let notifications_enabled = app
        .store(CONFIG_FILE)?
        .get_bool_or(NOTIFICATIONS, NOTIFICATIONS_DEFAULT);

    let quit = MenuItem::with_id(
        app,
        TrayMenuAction::Quit,
        tx.sync_translate("global_menu_file_quit_desktop"),
        true,
        None::<&str>,
    )?;
    let show = MenuItem::with_id(
        app,
        TrayMenuAction::Show,
        tx.sync_translate("show_window"),
        true,
        None::<&str>,
    )?;

    let mute_notifications = CheckMenuItem::with_id(
        app,
        TrayMenuAction::MuteNotifications,
        tx.sync_translate("menu_mute"),
        true,
        !notifications_enabled,
        None::<&str>,
    )?;
    Ok(Menu::with_items(app, &[&show, &mute_notifications, &quit])?)
}
