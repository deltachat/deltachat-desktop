use log::{error, warn};
use tauri::Manager;

use crate::{
    menus::{
        float_on_top::{set_float_on_top_based_on_main_window, HELP_FLOATING},
        help_menu::create_help_menu,
    },
    settings::{apply_content_protection, apply_zoom_factor_help_window},
};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[cfg(not(target_os = "macos"))]
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
pub(crate) fn open_help_window(
    app: tauri::AppHandle,
    locale: &str,
    anchor: Option<&str>,
) -> Result<(), Error> {
    let mut url: String = format!("help/{locale}/help.html");
    if app.asset_resolver().get(url.clone()).is_none() {
        url = "help/en/help.html".to_owned();
        warn!("Did not find help file for language {locale}, falling back to english");
    }

    let app_url = tauri::WebviewUrl::App(url.into());

    let help_window = if let Some(help_window) = app.get_webview_window("help") {
        help_window
    } else {
        tauri::WebviewWindowBuilder::new(&app, "help", app_url.clone()).build()?
    };
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        // on android and iOS this does not exist, there the window is opened automatically
        help_window.show()?;
    }

    let mut url = help_window.url()?;
    url.set_fragment(anchor);
    help_window.navigate(url)?;

    help_window.set_title("Delta Chat Tauri - Help")?; // TODO: translate help in the title.

    let _ = apply_content_protection(&app);
    let _ = apply_zoom_factor_help_window(&app);

    set_float_on_top_based_on_main_window(&help_window, &HELP_FLOATING);

    #[cfg(not(target_os = "macos"))]
    help_window
        .set_menu(create_help_menu(&app).map_err(|err| Error::MenuCreation(err.to_string()))?)?;

    #[cfg(target_os = "macos")]
    {
        let app_clone = app.clone();
        help_window.on_window_event(move |e| {
            if let tauri::WindowEvent::Focused(_) = e {
                let help_menu = match create_help_menu(&app_clone) {
                    Ok(menu) => menu,
                    Err(err) => {
                        error!("creating menu failed {err}");
                        return;
                    }
                };
                if let Err(err) = app_clone.set_menu(help_menu) {
                    error!("setting menu failed {err}")
                }
            }
        });
    }

    Ok(())
}
