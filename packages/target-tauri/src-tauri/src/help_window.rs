use std::sync::Arc;

use anyhow::Context;
use log::{error, warn};
use tauri::{Manager, State, WebviewWindow};
use tauri_plugin_store::StoreExt;

use crate::{
    settings::{apply_content_protection, apply_zoom_factor_help_window, LOCALE_KEY},
    state::menu_manager::MenuManager,
    util::sanitization::StrExt,
    TranslationState, CONFIG_FILE,
};

#[cfg(desktop)]
use crate::menus::{
    float_on_top::set_float_on_top_based_on_main_window, help_menu::create_help_menu,
};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("MenuCreation {0}")]
    MenuCreation(String),
    #[error("Sanitization {0}")]
    Sanitization(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

/// If `locale` is `None`, the current locale set in settings will be used.
#[tauri::command]
pub(crate) async fn open_help_window(
    app: tauri::AppHandle,
    menu_manager: State<'_, MenuManager>,
    locale: Option<&str>,
    anchor: Option<&str>,
) -> Result<(), Error> {
    let locale = (locale.map(|s| s.to_owned())).unwrap_or_else(|| {
        log::info!("locale is not provided explicitly, will use the current locale");
        app.store(CONFIG_FILE)
            .context("failed to failed to load config.json to read the current locale")
            .inspect_err(|err| log::error!("{err}"))
            .ok()
            .and_then(|store| store.get(LOCALE_KEY))
            .and_then(|s| s.as_str().map(|s| s.to_owned()))
            .unwrap_or("en".to_owned())
    });

    // Tauri itself should guard against path traversal and stuff,
    // but let's also do it ourselves for good measure.
    if !locale.is_ascii_alphanumeric_with_dashes_and_underscores() {
        return Err(Error::Sanitization("locale uses unsafe characters".into()));
    }
    if let Some(anchor) = anchor {
        if !anchor.is_ascii_alphanumeric_with_dashes_and_underscores() {
            return Err(Error::Sanitization("anchor uses unsafe characters".into()));
        }
    }

    let mut url: String = format!("help/{locale}/help.html");
    if app.asset_resolver().get(url.clone()).is_none() {
        url = "help/en/help.html".to_owned();
        warn!("Did not find help file for language {locale}, falling back to english");
    }
    if let Some(anchor) = anchor {
        url.push('#');
        url.push_str(anchor);
    }
    let app_url = tauri::WebviewUrl::App(url.into());

    let tx = app.state::<TranslationState>();

    let help_window: WebviewWindow = if let Some(help_window) = app.get_webview_window("help") {
        // TODO theoretically the URL here could still be
        // about:blank if it has not loaded yet.
        let mut url = help_window.url()?;
        url.set_fragment(anchor);
        help_window.navigate(url)?;
        help_window
    } else {
        #[allow(unused_mut)]
        let mut window_builder = tauri::WebviewWindowBuilder::new(&app, "help", app_url.clone());
        #[cfg(target_os = "macos")]
        {
            window_builder = window_builder.allow_link_preview(false);
        }
        window_builder.build()?
    };
    let help_window = Arc::new(help_window);
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        // on android and iOS this does not exist, there the window is opened automatically
        help_window.show()?;
    }

    #[cfg(desktop)]
    help_window.set_title(&format!(
        "{} - {}",
        tx.sync_translate("app_name"),
        tx.sync_translate("menu_help"),
    ))?;

    let _ = apply_content_protection(&app);
    let _ = apply_zoom_factor_help_window(&app);

    #[cfg(desktop)]
    {
        let _ = set_float_on_top_based_on_main_window(&help_window);

        let help_window_clone = Arc::clone(&help_window);
        menu_manager
            .register_window(
                &app,
                &*help_window,
                Box::new(move |app| create_help_menu(app, &help_window_clone)),
            )
            .await
            .map_err(|err| Error::MenuCreation(err.to_string()))?;
    }

    Ok(())
}
