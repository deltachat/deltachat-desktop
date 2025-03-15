use crate::{
    settings::{apply_zoom_factor_html_window, CONFIG_FILE, HTML_EMAIL_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManger,
};

use super::menu_action::MenuAction;
use anyhow::Context;
use strum::{AsRefStr, EnumString};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager, Window, Wry,
};
use tauri_plugin_store::StoreExt;

#[derive(Debug, PartialEq, Eq)]
pub(crate) struct HtmlWindowMenuAction {
    window_id: String,
    action: HtmlWindowMenuActionVariant,
}

#[derive(Debug, AsRefStr, EnumString, PartialEq, Eq)]
enum HtmlWindowMenuActionVariant {
    QuitApp,
    CloseHtmlWindow,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    FloatOnTop,
}

// serialisation of event is:
// `HtmlWindowMenuAction||<window_id>|<action variant>`

impl TryFrom<&tauri::menu::MenuId> for HtmlWindowMenuAction {
    type Error = anyhow::Error;

    fn try_from(item: &tauri::menu::MenuId) -> Result<Self, Self::Error> {
        use std::str::FromStr;
        let mut item_name = item.as_ref().split("||");
        if let Some(stringify!(HtmlWindowMenuAction)) = item_name.nth(0) {
            let mut id_and_variant = item_name
                .last()
                .context("could not split menu item name")?
                .split('|');
            if let (Some(id), Some(variant)) = (id_and_variant.nth(0), id_and_variant.last()) {
                Ok(HtmlWindowMenuAction {
                    window_id: id.to_owned(),
                    action: HtmlWindowMenuActionVariant::from_str(variant)?,
                })
            } else {
                Err(anyhow::anyhow!("not the right format: {:?}", item.as_ref()))
            }
        } else {
            Err(anyhow::anyhow!("not the right enum name"))
        }
    }
}

impl From<HtmlWindowMenuAction> for tauri::menu::MenuId {
    fn from(action: HtmlWindowMenuAction) -> Self {
        tauri::menu::MenuId::new(format!(
            "{}||{}|{}",
            stringify!(HtmlWindowMenuAction),
            action.window_id,
            action.action.as_ref()
        ))
    }
}

impl MenuAction<'static> for HtmlWindowMenuAction {
    fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let win = app
            .get_window(&self.window_id)
            .context("window not found")?;
        let menu_manager = app.state::<MenuManger>();
        match self.action {
            HtmlWindowMenuActionVariant::QuitApp => {
                app.exit(0);
            }
            HtmlWindowMenuActionVariant::CloseHtmlWindow => {
                win.close()?;
            }
            HtmlWindowMenuActionVariant::ZoomIn
            | HtmlWindowMenuActionVariant::ZoomOut
            | HtmlWindowMenuActionVariant::ResetZoom => {
                let store = app
                    .get_store(CONFIG_FILE)
                    .context("config store not found")?;
                let curr_zoom: f64 = store
                    .get(HTML_EMAIL_ZOOM_FACTOR_KEY)
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);

                let new_zoom = match self.action {
                    HtmlWindowMenuActionVariant::ZoomIn => curr_zoom * 1.2,
                    HtmlWindowMenuActionVariant::ResetZoom => 1.,
                    HtmlWindowMenuActionVariant::ZoomOut => curr_zoom * 0.8,
                    _ => unreachable!(),
                };

                store.set(HTML_EMAIL_ZOOM_FACTOR_KEY, new_zoom);
                apply_zoom_factor_html_window(app)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
            HtmlWindowMenuActionVariant::FloatOnTop => {
                win.set_always_on_top(!win.is_always_on_top()?)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
        }

        Ok(())
    }
}

pub(crate) fn create_html_window_menu(
    app: &AppHandle,
    html_email_window: &Window,
) -> anyhow::Result<Menu<Wry>> {
    let window_id = html_email_window.label().to_owned();
    let action = |action: HtmlWindowMenuActionVariant| HtmlWindowMenuAction {
        window_id: window_id.clone(),
        action,
    };

    let quit = MenuItem::with_id(
        app,
        action(HtmlWindowMenuActionVariant::QuitApp),
        "Quit Delta Chat", // TODO translate
        true,
        Some("CmdOrCtrl+Q"),
    )?;
    let menu = Menu::with_items(
        app,
        &[
            // MacOS has an app menu
            #[cfg(target_os = "macos")]
            &Submenu::with_items(app, "App", true, &[&quit])?,
            &Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &MenuItem::with_id(
                        app,
                        action(HtmlWindowMenuActionVariant::CloseHtmlWindow),
                        "Close HTML Email",
                        true,
                        Some("CmdOrCtrl+W"),
                    )?,
                    // macOS has this in the app menu already
                    #[cfg(not(target_os = "macos"))]
                    &quit,
                ],
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
                        action(HtmlWindowMenuActionVariant::ResetZoom),
                        "Actual Size",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        app,
                        action(HtmlWindowMenuActionVariant::ZoomIn),
                        "Zoom In",
                        true,
                        if cfg!(target_os = "macos") {
                            Some("Command++")
                        } else {
                            Some("Ctrl++")
                        },
                    )?,
                    &MenuItem::with_id(
                        app,
                        action(HtmlWindowMenuActionVariant::ZoomOut),
                        "Zoom Out",
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
                        action(HtmlWindowMenuActionVariant::FloatOnTop),
                        "Float on Top",
                        true,
                        html_email_window.is_always_on_top()?,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(app, Some("Toggle Full Screen"))?,
                ],
            )?,
        ],
    )?;

    Ok(menu)
}

#[cfg(test)]
mod tests {
    use tauri::menu::MenuId;

    use super::*;

    #[test]
    fn test_decoding_id() -> anyhow::Result<()> {
        let r = HtmlWindowMenuAction::try_from(&MenuId::new(
            "HtmlWindowMenuAction||html-window:1-13027|CloseHtmlWindow",
        ))?;

        assert_eq!(
            r,
            HtmlWindowMenuAction {
                window_id: "html-window:1-13027".to_owned(),
                action: HtmlWindowMenuActionVariant::CloseHtmlWindow
            }
        );
        Ok(())
    }
}
