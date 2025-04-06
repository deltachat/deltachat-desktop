use std::time::Duration;

use tauri::{AppHandle, Manager};

use crate::{
    run_config::RunConfig, state::main_window_channels::MainWindowEvents,
    util::fs_watcher::async_watch_debounced, MainWindowChannels,
};

use super::{custom_theme_dir, error::Error};

pub fn run_cli(app: &AppHandle, run_config: &RunConfig) -> Result<(), Error> {
    if let Some(theme) = &run_config.theme {};

    if run_config.theme_watch {
        let app_clone = app.clone();
        let callback = Box::new(move || {
            let app_clone = app_clone.clone();
            async move {
                if let Err(err) = app_clone
                    .state::<MainWindowChannels>()
                    .emit_event(MainWindowEvents::OnThemeUpdate)
                    .await
                {
                    log::error!("watch_themes: failed notify frontend: {err}:?");
                }
                if let Err(err) = super::update_theme_in_other_windows(&app_clone) {
                    log::error!("watch_themes: failed to update theme in other windows: {err}:?");
                }
            }
        });

        if app.asset_resolver().iter().count() == 0 {
            // search in folder
            let resource_dir = &app.path().resource_dir()?;
            let themes_dir = resource_dir
                .join("../../packages/target-tauri/html-dist/themes")
                .to_owned();
            let callback_clone = callback.clone();
            tauri::async_runtime::spawn(async move {
                log::info!("watch_themes: watching for changes in {themes_dir:?}");
                if let Err(err) =
                    async_watch_debounced(themes_dir, callback_clone, Duration::from_millis(400))
                        .await
                {
                    log::error!("watch_themes: failed to watch themes dir: {err:?}");
                }
            });
        } else {
            log::info!("Only watches custom themes, to watch built-in themes you need to be in an development environment.");
        }

        let custom_themes_dir = custom_theme_dir(app)?;
        tauri::async_runtime::spawn(async move {
            log::info!("watch_themes: watching for changes in custom dir: {custom_themes_dir:?}");
            if let Err(err) =
                async_watch_debounced(custom_themes_dir, callback, Duration::from_millis(400)).await
            {
                log::error!("watch_themes: failed to watch custom themes dir: {err:?}");
            }
        });
    }

    Ok(())
}
