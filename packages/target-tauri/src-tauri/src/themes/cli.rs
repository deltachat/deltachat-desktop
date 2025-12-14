use std::{process::exit, time::Duration};

use serde_json::Value;
use tauri::{async_runtime::block_on, AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use tokio::time::sleep;

use crate::{
    run_config::RunConfig, settings::THEME, state::main_window_channels::MainWindowEvents,
    util::fs_watcher::async_watch_debounced, MainWindowChannels, CONFIG_FILE,
};

use super::{commands::get_theme, custom_theme_dir, error::Error};

/// If [`RunConfig::theme`] is `Some`, checks that the theme exists
/// and saves its address to settings.
///
/// If [`RunConfig::theme_watch`] is `true`, watches the theme directories
/// and emits [`MainWindowEvents::OnThemeUpdate`] on changes.
pub fn run_cli(app: &AppHandle, run_config: &RunConfig) -> Result<(), Error> {
    if let Some(theme) = &run_config.theme {
        log::info!(
            "Hint: Your custom themes directory is: {}",
            custom_theme_dir(app)?.to_string_lossy()
        );

        // try to load theme
        if let Err(err) = block_on(get_theme(app.clone(), theme.to_owned())) {
            eprintln!("theme with address {theme} was not found or failed to load: {err}");
            exit(2)
        }

        app.store(CONFIG_FILE)?
            .set(THEME, Value::String(theme.to_owned()));
    };

    if run_config.theme_watch {
        let app_clone = app.clone();
        let callback = Box::new(move || {
            let app_clone = app_clone.clone();
            async move {
                // wait until it is really saved
                sleep(Duration::from_millis(160)).await;
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
