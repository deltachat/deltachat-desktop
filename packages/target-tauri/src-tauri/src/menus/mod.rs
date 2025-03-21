use anyhow::Context;
use help_menu::HelpMenuAction;
use html_window_menu::HtmlWindowMenuAction;
use main_menu::{MainMenuAction, SET_LOCALE_MENU_ID_PREFIX};
use menu_action::MenuAction;
use tauri::{menu::MenuEvent, AppHandle, Emitter};
use webxdc_menu::WebxdcMenuAction;

pub(crate) mod float_on_top;
pub(crate) mod help_menu;
pub(crate) mod html_window_menu;
pub(crate) mod main_menu;
mod menu_action;
pub(crate) mod webxdc_menu;

pub fn handle_event(app: &AppHandle, event: MenuEvent) -> anyhow::Result<()> {
    if let Ok(action) = MainMenuAction::try_from(event.id()) {
        action.execute(app)?;
    } else if let Ok(action) = HelpMenuAction::try_from(event.id()) {
        action.execute(app)?;
    } else if event.id().0.starts_with(SET_LOCALE_MENU_ID_PREFIX) {
        app.emit(
            "locale_reloaded",
            event
                .id()
                .0
                .split(':')
                .last()
                .context("no language found in id")?,
        )?;
    } else if let Ok(action) = HtmlWindowMenuAction::try_from(event.id()) {
        action.execute(app)?;
    } else if let Ok(action) = WebxdcMenuAction::try_from(event.id()) {
        action.execute(app)?;
    }

    Ok(())
}

pub(crate) fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    if let Err(e) = handle_event(app, event) {
        log::error!("{:?}", e);
    }
}
