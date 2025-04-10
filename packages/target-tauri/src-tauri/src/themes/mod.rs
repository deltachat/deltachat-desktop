use std::path::PathBuf;

use error::Error;
use tauri::{AppHandle, Manager};

pub mod cli;
pub mod commands;
mod error;
mod themes;

pub(crate) fn custom_theme_dir(app: &AppHandle) -> Result<PathBuf, Error> {
    Ok(app.path().app_data_dir()?.join("custom-themes"))
}

/// Triggers a (re)load of the current theme in all the other windows that support theming
pub(crate) fn update_theme_in_other_windows(app: &AppHandle) -> Result<(), Error> {
    // HTML windows
    for (_label, html_email_header_view) in app
        .webviews()
        .iter()
        .filter(|(label, _webview)| label.starts_with("html-window:") && label.ends_with("-header"))
    {
        html_email_header_view.eval("window.updateTheme()")?;
    }

    Ok(())
}
