use std::path::PathBuf;

use error::Error;
use tauri::{AppHandle, Manager};

pub mod commands;
mod error;
mod themes;

pub(crate) fn custom_theme_dir(app: &AppHandle) -> Result<PathBuf, Error> {
    Ok(app.path().app_data_dir()?.join("custom-themes"))
}
