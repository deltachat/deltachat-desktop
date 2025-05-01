use crate::{
    settings::{apply_zoom_factor_html_window, CONFIG_FILE, HTML_EMAIL_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManager,
    TranslationState,
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
        let Some(stringify!(HtmlWindowMenuAction)) = item_name.nth(0) else {
            return Err(anyhow::anyhow!("not the right enum name"));
        };

        let mut id_and_variant = item_name
            .last()
            .context("could not split menu item name")?
            .split('|');
        let (Some(id), Some(variant)) = (id_and_variant.nth(0), id_and_variant.next_back()) else {
            return Err(anyhow::anyhow!("not the right format: {:?}", item.as_ref()));
        };

        Ok(HtmlWindowMenuAction {
            window_id: id.to_owned(),
            action: HtmlWindowMenuActionVariant::from_str(variant)?,
        })
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
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let win = app
            .get_window(&self.window_id)
            .context("window not found")?;
        let menu_manager = app.state::<MenuManager>();
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
    let tx = app.state::<TranslationState>();

    let window_id = html_email_window.label().to_owned();
    let action = |action: HtmlWindowMenuActionVariant| HtmlWindowMenuAction {
        window_id: window_id.clone(),
        action,
    };

    let quit = MenuItem::with_id(
        app,
        action(HtmlWindowMenuActionVariant::QuitApp),
        // Same as in help_menu.
        // TODO for some languages this is not quite correct.
        format!(
            "{} {}",
            tx.sync_translate("global_menu_file_quit_desktop"),
            tx.sync_translate("app_name")
        ),
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
                tx.sync_translate("file"),
                true,
                &[
                    &MenuItem::with_id(
                        app,
                        action(HtmlWindowMenuActionVariant::CloseHtmlWindow),
                        tx.sync_translate("close_window"),
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
                        action(HtmlWindowMenuActionVariant::ResetZoom),
                        tx.sync_translate("actual_size"),
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        app,
                        action(HtmlWindowMenuActionVariant::ZoomIn),
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
                        action(HtmlWindowMenuActionVariant::ZoomOut),
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
                        action(HtmlWindowMenuActionVariant::FloatOnTop),
                        tx.sync_translate("global_menu_view_floatontop_desktop"),
                        true,
                        html_email_window.is_always_on_top()?,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(
                        app,
                        Some(&tx.sync_translate("toggle_fullscreen")),
                    )?,
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
