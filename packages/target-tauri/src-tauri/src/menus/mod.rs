use anyhow::Context;
use help_menu::HelpMenuAction;
use html_window_menu::HtmlWindowMenuAction;
use main_menu::{MainMenuAction, SET_LOCALE_MENU_ID_PREFIX};
use menu_action::MenuAction;
use tauri::{async_runtime::spawn, menu::MenuEvent, AppHandle, Manager};
use tray_menu::TrayMenuAction;
use webxdc_menu::WebxdcMenuAction;

use crate::MainWindowChannels;

pub(crate) mod float_on_top;
pub(crate) mod help_menu;
pub(crate) mod html_window_menu;
pub(crate) mod main_menu;
mod menu_action;
pub(crate) mod tray_menu;
pub(crate) mod webxdc_menu;

pub async fn handle_event(app: &AppHandle, event: MenuEvent) -> anyhow::Result<()> {
    if let Ok(action) = MainMenuAction::try_from(event.id()) {
        action.execute(app).await?;
    } else if let Ok(action) = HelpMenuAction::try_from(event.id()) {
        action.execute(app).await?;
    } else if event.id().0.starts_with(SET_LOCALE_MENU_ID_PREFIX) {
        let mwc = app.state::<MainWindowChannels>();

        let id = event
            .id()
            .0
            .split(':')
            .next_back()
            .context("no language found in id")?;

        mwc.emit_event(
            crate::state::main_window_channels::MainWindowEvents::LocaleReloaded(Some(
                id.to_owned(),
            )),
        )
        .await?;
    } else if let Ok(action) = HtmlWindowMenuAction::try_from(event.id()) {
        action.execute(app).await?;
    } else if let Ok(action) = WebxdcMenuAction::try_from(event.id()) {
        action.execute(app).await?;
    } else if let Ok(action) = TrayMenuAction::try_from(event.id()) {
        action.execute(app).await?;
    }

    Ok(())
}

pub(crate) fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    let app = app.clone();
    let future = spawn(async move {
        if let Err(e) = handle_event(&app, event).await {
            log::error!("{e:?}");
        }
    });
    drop(future);
}
