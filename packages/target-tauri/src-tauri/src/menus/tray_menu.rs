use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{Menu, MenuItem},
    AppHandle, Manager, Wry,
};

use crate::TranslationState;

use super::menu_action::{impl_menu_conversion, MenuAction};

#[derive(Debug, AsRefStr, EnumString)]
pub(crate) enum TrayMenuAction {
    Quit,
    Show,
}
impl_menu_conversion!(TrayMenuAction);

impl MenuAction<'static> for TrayMenuAction {
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let main_window = app.get_window("main").context("main window not found")?;

        match self {
            TrayMenuAction::Quit => {
                app.exit(0);
            }
            TrayMenuAction::Show => main_window.show()?,
        }
        Ok(())
    }
}

pub(crate) fn create_tray_menu(app: &AppHandle) -> anyhow::Result<Menu<Wry>> {
    let tx = app.state::<TranslationState>();
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
    Ok(Menu::with_items(app, &[&show, &quit])?)
}
