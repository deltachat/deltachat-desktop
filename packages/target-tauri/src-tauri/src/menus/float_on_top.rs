use anyhow::Context;
use tauri::{Manager, WebviewWindow, Window};

#[cfg(desktop)]
pub fn set_float_on_top_based_on_main_window(window: &WebviewWindow) -> anyhow::Result<()> {
    if window
        .get_window("main")
        .context("main window not found")?
        .is_always_on_top()?
    {
        window.set_always_on_top(true)?;
    }
    Ok(())
}

#[cfg(desktop)]
pub fn set_window_float_on_top_based_on_main_window(window: &Window) -> anyhow::Result<()> {
    if window
        .get_window("main")
        .context("main window not found")?
        .is_always_on_top()?
    {
        window.set_always_on_top(true)?;
    }
    Ok(())
}
