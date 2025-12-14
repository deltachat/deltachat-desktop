use crate::{
    settings::{apply_zoom_factor_webxdc, CONFIG_FILE, WEBXDC_ZOOM_FACTOR_KEY},
    state::menu_manager::MenuManager,
    DeltaChatAppState, TranslationState, WebxdcInstancesState,
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
        let Some(stringify!(WebxdcMenuAction)) = item_name.nth(0) else {
            return Err(anyhow::anyhow!("not the right enum name"));
        };

        let mut id_and_variant = item_name
            .last()
            .context("could not split menu item name")?
            .split('|');
        let (Some(id), Some(variant)) = (id_and_variant.nth(0), id_and_variant.next_back()) else {
            return Err(anyhow::anyhow!("not the right format: {:?}", item.as_ref()));
        };

        Ok(WebxdcMenuAction {
            window_id: id.to_owned(),
            action: WebxdcMenuActionVariant::from_str(variant)?,
        })
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
    async fn execute(self, app: &AppHandle) -> anyhow::Result<()> {
        let win = app
            .get_webview_window(&self.window_id)
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
                    let tx = app.state::<TranslationState>();
                    let Some(instance) = instances.get(&win).await else {
                        error!("instance not found");
                        return;
                    };
                    let dc = dc.deltachat.read().await;
                    let Some(account) = dc.get_account(instance.account_id) else {
                        error!("account not found");
                        return;
                    };
                    let Ok(info) = instance.message.get_webxdc_info(&account).await else {
                        return;
                    };
                    let source_code_url = info.source_code_url;

                    if source_code_url.starts_with("https://")
                        || source_code_url.starts_with("http://")
                    {
                        if let Err(err) = app.opener().open_url(source_code_url, None::<String>) {
                            error!("failed to open source_code_url {err}");
                        }
                    } else {
                        let cloned_app = app.clone();
                        let mut dialog_builder = app
                            .dialog()
                            .message(
                                tx.translate("ask_copy_unopenable_link_to_clipboard")
                                    .await
                                    .replace("%1$d", &source_code_url),
                            )
                            .buttons(MessageDialogButtons::OkCancelCustom(
                                tx.translate("menu_copy_link_to_clipboard").await,
                                tx.translate("no").await,
                            ));
                        #[cfg(desktop)]
                        {
                            dialog_builder = dialog_builder.parent(&win);
                        }
                        dialog_builder.show(move |answer| {
                            if answer {
                                if let Err(err) = cloned_app.clipboard().write_text(source_code_url)
                                {
                                    error!("failed to copy source_code_url {err}");
                                }
                            }
                        });
                    }
                });
            }
            WebxdcMenuActionVariant::WhatIsWebxdc => {
                crate::help_window::open_help_window(
                    app.clone(),
                    menu_manager.clone(),
                    None,
                    Some("webxdc"),
                )
                .await?;
            }
        }

        Ok(())
    }
}

pub(crate) fn create_webxdc_window_menu(
    app: &AppHandle,
    webxdc_window: &WebviewWindow,
    icon: Option<Image>,
) -> anyhow::Result<Menu<Wry>> {
    let window_id = webxdc_window.label().to_owned();
    let action = |action: WebxdcMenuActionVariant| WebxdcMenuAction {
        window_id: window_id.clone(),
        action,
    };
    let tx = app.state::<TranslationState>();

    let quit = MenuItem::with_id(
        app,
        action(WebxdcMenuActionVariant::QuitApp),
        tx.sync_translate("global_menu_file_quit_desktop"),
        true,
        Some("CmdOrCtrl+Q"),
    )?;

    let source_code = IconMenuItem::with_id(
        app,
        action(WebxdcMenuActionVariant::WebxdcSourceCode),
        tx.sync_translate("source_code"),
        true,
        icon,
        None::<&str>,
    )?;

    let menu = Menu::with_items(
        app,
        &[
            // MacOS has an app menu
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                app,
                "App", /*this text will be relaced by macos anyway */
                true,
                &[&quit],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("global_menu_file_desktop"),
                true,
                &[
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::CloseWindow),
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
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::ResetZoom),
                        tx.sync_translate("actual_size"),
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::ZoomIn),
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
                        action(WebxdcMenuActionVariant::ZoomOut),
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
                        action(WebxdcMenuActionVariant::FloatOnTop),
                        tx.sync_translate("global_menu_view_floatontop_desktop"),
                        true,
                        webxdc_window.is_always_on_top()?,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(
                        app,
                        Some(&tx.sync_translate("toggle_fullscreen")),
                    )?,
                ],
            )?,
            &Submenu::with_items(
                app,
                tx.sync_translate("menu_help"),
                true,
                &[
                    &source_code,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(
                        app,
                        action(WebxdcMenuActionVariant::WhatIsWebxdc),
                        tx.sync_translate("what_is_webxdc"),
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
            "WebxdcMenuAction||webxdc:1:13027|CloseWindow",
        ))?;

        assert_eq!(
            r,
            WebxdcMenuAction {
                window_id: "webxdc:1:13027".to_owned(),
                action: WebxdcMenuActionVariant::CloseWindow
            }
        );
        Ok(())
    }
}
