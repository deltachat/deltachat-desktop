use crate::{
    settings::{apply_zoom_factor_webxdc, CONFIG_FILE, WEBXDC_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManager,
    DeltaChatAppState, WebxdcInstancesState,
};

use super::menu_action::MenuAction;
use anyhow::Context;
use log::error;
use strum::{AsRefStr, EnumString};
use tauri::{
    async_runtime::spawn,
    image::Image,
    menu::{CheckMenuItem, IconMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Manager, WebviewWindow, Wry,
};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

#[derive(Debug, PartialEq, Eq)]
pub(crate) struct WebxdcMenuAction {
    window_id: String,
    action: WebxdcMenuActionVariant,
}

#[derive(Debug, AsRefStr, EnumString, PartialEq, Eq)]
enum WebxdcMenuActionVariant {
    QuitApp,
    CloseWindow,
    ZoomIn,
    ZoomOut,
    ResetZoom,
    FloatOnTop,
    WebxdcSourceCode,
    WhatIsWebxdc,
}

// serialisation of event is:
// `WebxdcMenuAction||<window_id>|<action variant>`

impl TryFrom<&tauri::menu::MenuId> for WebxdcMenuAction {
    type Error = anyhow::Error;

    fn try_from(item: &tauri::menu::MenuId) -> Result<Self, Self::Error> {
        use std::str::FromStr;
        let mut item_name = item.as_ref().split("||");
        if let Some(stringify!(WebxdcMenuAction)) = item_name.nth(0) {
            let mut id_and_variant = item_name
                .last()
                .context("could not split menu item name")?
                .split('|');
            if let (Some(id), Some(variant)) = (id_and_variant.nth(0), id_and_variant.last()) {
                Ok(WebxdcMenuAction {
                    window_id: id.to_owned(),
                    action: WebxdcMenuActionVariant::from_str(variant)?,
                })
            } else {
                Err(anyhow::anyhow!("not the right format: {:?}", item.as_ref()))
            }
        } else {
            Err(anyhow::anyhow!("not the right enum name"))
        }
    }
}

impl From<WebxdcMenuAction> for tauri::menu::MenuId {
    fn from(action: WebxdcMenuAction) -> Self {
        tauri::menu::MenuId::new(format!(
            "{}||{}|{}",
            stringify!(WebxdcMenuAction),
            action.window_id,
            action.action.as_ref()
        ))
    }
}

impl MenuAction<'static> for WebxdcMenuAction {
    fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let win = app
            .get_window(&self.window_id)
            .context("window not found")?;
        let menu_manager = app.state::<MenuManager>();
        match self.action {
            WebxdcMenuActionVariant::QuitApp => {
                app.exit(0);
            }
            WebxdcMenuActionVariant::CloseWindow => {
                win.close()?;
            }
            WebxdcMenuActionVariant::ZoomIn
            | WebxdcMenuActionVariant::ZoomOut
            | WebxdcMenuActionVariant::ResetZoom => {
                let store = app
                    .get_store(CONFIG_FILE)
                    .context("config store not found")?;
                let curr_zoom: f64 = store
                    .get(WEBXDC_ZOOM_FACTOR_KEY)
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);

                let new_zoom = match self.action {
                    WebxdcMenuActionVariant::ZoomIn => curr_zoom * 1.2,
                    WebxdcMenuActionVariant::ResetZoom => 1.,
                    WebxdcMenuActionVariant::ZoomOut => curr_zoom * 0.8,
                    _ => unreachable!(),
                };

                store.set(WEBXDC_ZOOM_FACTOR_KEY, new_zoom);
                apply_zoom_factor_webxdc(app)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
            WebxdcMenuActionVariant::FloatOnTop => {
                win.set_always_on_top(!win.is_always_on_top()?)?;
                // this is fast/effient enough, even though it updates all window
                // if you want to implement sth else you need to take macOS behaviour into account
                menu_manager.update_all(app);
            }
            WebxdcMenuActionVariant::WebxdcSourceCode => {
                let app = app.clone();
                spawn(async move {
                    // IDEA: move this to extra function with only one error log at the calling site,
                    // in the function use the try operator this would make it easier to read
                    let instances = app.state::<WebxdcInstancesState>();
                    let dc = app.state::<DeltaChatAppState>();
                    if let Some(instance) = instances.get(win.label()).await {
                        let dc = dc.deltachat.read().await;
                        if let Some(account) = dc.get_account(instance.account_id) {
                            if let Ok(info) = instance.message.get_webxdc_info(&account).await {
                                let source_code_url = info.source_code_url;

                                if source_code_url.starts_with("https://")
                                    || source_code_url.starts_with("http://")
                                {
                                    if let Err(err) =
                                        app.opener().open_url(source_code_url, None::<String>)
                                    {
                                        error!("failed to open source_code_url {err}");
                                    }
                                } else {
                                    let cloned_app = app.clone();
                                    app.dialog()
                                        .message("tx(ask_copy_unopenable_link_to_clipboard)")
                                        .buttons(MessageDialogButtons::OkCancelCustom(
                                            "tx('menu_copy_link_to_clipboard')".to_owned(),
                                            "tx('no')".to_owned(),
                                        ))
                                        .parent(&win)
                                        .show(move |answer| {
                                            if answer {
                                                if let Err(err) = cloned_app
                                                    .clipboard()
                                                    .write_text(source_code_url)
                                                {
                                                    error!("failed to copy source_code_url {err}");
                                                }
                                            }
                                        });
                                }
                            }
                        } else {
                            error!("account not found")
                        }
                    } else {
                        error!("instance not found")
                    }
                });
            }
            WebxdcMenuActionVariant::WhatIsWebxdc => {
                app.opener()
                    .open_url("https://webxdc.org", None::<String>)?;
            }
        }

        Ok(())
    }
}

pub(crate) fn create_webxdc_window_menu(
    app: &AppHandle,
    html_email_window: &WebviewWindow,
    icon: Option<Image>,
) -> anyhow::Result<Menu<Wry>> {
    let window_id = html_email_window.label().to_owned();
    let action = |action: WebxdcMenuActionVariant| WebxdcMenuAction {
        window_id: window_id.clone(),
        action,
    };

    let quit = MenuItem::with_id(
        app,
        action(WebxdcMenuActionVariant::QuitApp),
        "Quit Delta Chat", // TODO translate
        true,
        Some("CmdOrCtrl+Q"),
    )?;

    let source_code = IconMenuItem::with_id(
        app,
        action(WebxdcMenuActionVariant::WebxdcSourceCode),
        "tx('source_code')",
        true,
        icon,
        None::<&str>,
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
                        action(WebxdcMenuActionVariant::CloseWindow),
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
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::undo(app, Some("Undo"))?,
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::redo(app, Some("Redo"))?,
                    #[cfg(target_os = "macos")]
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, Some("Cut"))?,
                    &PredefinedMenuItem::copy(app, Some("Copy"))?,
                    &PredefinedMenuItem::paste(app, Some("Paste"))?,
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
                        action(WebxdcMenuActionVariant::ResetZoom),
                        "Actual Size",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::ZoomIn),
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
                        action(WebxdcMenuActionVariant::ZoomOut),
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
                        action(WebxdcMenuActionVariant::FloatOnTop),
                        "Float on Top",
                        true,
                        html_email_window.is_always_on_top()?,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(app, Some("Toggle Full Screen"))?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "Help",
                true,
                &[
                    &source_code,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::WhatIsWebxdc),
                        "tx('what_is_webxdc')",
                        true,
                        None::<&str>,
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
        let r = WebxdcMenuAction::try_from(&MenuId::new(
            "HtmlWindowMenuAction||html-window:1-13027|CloseWindow",
        ))?;

        assert_eq!(
            r,
            WebxdcMenuAction {
                window_id: "html-window:1-13027".to_owned(),
                action: WebxdcMenuActionVariant::CloseWindow
            }
        );
        Ok(())
    }
}
