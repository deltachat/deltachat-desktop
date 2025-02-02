use super::HelpMenuAction;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Runtime,
};

pub(crate) fn create_help_menu<A: Runtime>(handle: &AppHandle<A>) -> anyhow::Result<Menu<A>> {
    let menu = Menu::with_items(
        handle,
        &[
            &Submenu::with_items(
                handle,
                "File",
                true,
                &[&MenuItem::with_id(
                    handle,
                    HelpMenuAction::HelpQuit,
                    "Quit",
                    true,
                    None::<&str>,
                )?],
            )?,
            &Submenu::with_items(
                handle,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::copy(handle, Some("Copy"))?,
                    &PredefinedMenuItem::select_all(handle, Some("Select All"))?,
                ],
            )?,
            &Submenu::with_items(
                handle,
                "View",
                true,
                &[
                    &MenuItem::with_id(
                        handle,
                        HelpMenuAction::ResetZoom,
                        "Actual Size",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        HelpMenuAction::ZoomIn,
                        "Zoom In",
                        true,
                        None::<&str>,
                    )?,
                    &MenuItem::with_id(
                        handle,
                        HelpMenuAction::ZoomOut,
                        "Zoom Out",
                        true,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::separator(handle)?,
                    &MenuItem::with_id(
                        handle,
                        HelpMenuAction::HelpFloatOnTop,
                        "Float on Top",
                        true,
                        None::<&str>,
                    )?,
                    &PredefinedMenuItem::fullscreen(handle, Some("Toggle Full Screen"))?,
                ],
            )?,
        ],
    )?;

    Ok(menu)
}
