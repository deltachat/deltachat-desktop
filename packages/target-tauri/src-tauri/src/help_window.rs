use log::{error, warn};
use tauri::{Manager, State, WebviewWindow};

use crate::{
    menus::{float_on_top::set_float_on_top_based_on_main_window, help_menu::create_help_menu},
    settings::{apply_content_protection, apply_zoom_factor_help_window},
    state::menu_manager::MenuManger,
};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("MenuCreation {0}")]
    MenuCreation(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
pub(crate) async fn open_help_window(
    app: tauri::AppHandle,
    menu_manager: State<'_, MenuManger>,
    locale: &str,
    anchor: Option<&str>,
) -> Result<(), Error> {
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

    let help_window: WebviewWindow = if let Some(help_window) = app.get_webview_window("help") {
        // TODO theoretically the URL here could still be
        // about:blank if it has not loaded yet.
        let mut url = help_window.url()?;
        url.set_fragment(anchor);
        help_window.navigate(url)?;
        help_window
    } else {
        tauri::WebviewWindowBuilder::new(&app, "help", app_url.clone()).build()?
    };
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        // on android and iOS this does not exist, there the window is opened automatically
        help_window.show()?;
    }

    help_window.set_title("Delta Chat Tauri - Help")?; // TODO: translate help in the title.

    let _ = apply_content_protection(&app);
    let _ = apply_zoom_factor_help_window(&app);

    let _ = set_float_on_top_based_on_main_window(&help_window);

    let help_window_clone = help_window.clone();
    menu_manager
        .register_window(
            &app,
            &help_window,
            Box::new(move |app| create_help_menu(app, &help_window_clone)),
        )
        .await
        .map_err(|err| Error::MenuCreation(err.to_string()))?;

    Ok(())
}
