use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Builder, Runtime,
};

pub(crate) fn create_main_menu<A: Runtime>(builder: Builder<A>) -> Builder<A> {
    let builder = builder.menu(|handle| {
        Menu::with_items(
            handle,
            &[
                &Submenu::with_items(
                    handle,
                    "File",
                    true,
                    &[
                        &PredefinedMenuItem::quit(handle, Some("Quit"))?,
                        #[cfg(target_os = "macos")]
                        &MenuItem::new(handle, "Hello", true, None::<&str>)?,
                        &MenuItem::new(handle, "Settings", true, None::<&str>)?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "Edit",
                    true,
                    &[
                        &PredefinedMenuItem::undo(handle, Some("Undo"))?,
                        &PredefinedMenuItem::redo(handle, Some("Redo"))?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::cut(handle, Some("Cut"))?,
                        &PredefinedMenuItem::copy(handle, Some("Copy"))?,
                        &PredefinedMenuItem::paste(handle, Some("Paste"))?,
                        // &PredefinedMenuItem::delete(handle, Some("Select All"))?,
                        &PredefinedMenuItem::select_all(handle, Some("Select All"))?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "View",
                    true,
                    &[
                        &MenuItem::new(handle, "Float on Top", true, None::<&str>)?,
                        &Submenu::with_items(
                            handle,
                            "Zoom",
                            true,
                            &[
                                &MenuItem::new(handle, "0.6x Extra Small", true, None::<&str>)?,
                                &MenuItem::new(handle, "0.8x Small", true, None::<&str>)?,
                                &MenuItem::new(handle, "1.0x Normal", true, None::<&str>)?,
                                &MenuItem::new(handle, "1.2x Large", true, None::<&str>)?,
                                &MenuItem::new(handle, "1.4x Extra Large", true, None::<&str>)?,
                            ],
                        )?,
                        &Submenu::with_items(
                            handle,
                            "Developer",
                            true,
                            &[
                                &MenuItem::new(handle, "Open Developer Tools", true, None::<&str>)?,
                                &MenuItem::new(handle, "Open the Log Folder", true, None::<&str>)?,
                                &MenuItem::new(
                                    handle,
                                    "Open Current Log File",
                                    true,
                                    None::<&str>,
                                )?,
                            ],
                        )?,
                    ],
                )?,
                &Submenu::with_items(
                    handle,
                    "Help",
                    true,
                    &[
                        &MenuItem::new(handle, "Help", true, None::<&str>)?,
                        &MenuItem::new(handle, "Keybindings", true, None::<&str>)?,
                        &MenuItem::new(handle, "Learn More About Deltachat", true, None::<&str>)?,
                        &MenuItem::new(handle, "Contribute on Github", true, None::<&str>)?,
                        &MenuItem::new(handle, "Report an Issue", true, None::<&str>)?,
                        &MenuItem::new(handle, "About Delta Chat", true, None::<&str>)?,
                    ],
                )?,
            ],
        )
    });
    builder.on_menu_event(|_app, event| {
        println!("menu event: {:?}", event);
    })
}
