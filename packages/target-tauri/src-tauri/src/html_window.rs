use std::str::FromStr;

use log::warn;
use tauri::{
    webview::WebviewBuilder, LogicalPosition, LogicalSize, Manager, Url, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowBuilder, WindowSizeConstraints,
};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    // #[error(transparent)]
    // Wry(#[from] wry::Error),
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
pub(crate) fn open_html_window(
    app: tauri::AppHandle,
    window_id: &str,
    account_id: u32,
    is_contact_request: bool,
    subject: &str,
    sender: &str,
    receive_time: &str,
    content: &str,
) -> Result<(), Error> {
    let window_id = format!("html-window:{window_id}").replace(".", "-");
    warn!("{window_id}");

    // let mut window: WebviewWindow = if let Some(window) = app.get_webview_window(&window_id) {
    //     window
    // } else {
    //     WebviewWindowBuilder::new(
    //         &app,
    //         &window_id,
    //         WebviewUrl::External(Url::from_str("https://delta.chat").unwrap()),
    //     )
    //     .build()?
    // };

    // #[cfg(not(any(target_os = "ios", target_os = "android")))]
    // {
    //     // on android and iOS this does not exist, there the window is opened automatically
    //     window.show()?;
    // }

    let width = 800.;
    let height = 600.;
    let header_height = 42.;

    let window = WindowBuilder::new(&app, &window_id)
        .inner_size(width, height)
        .build()?;

    let _webview1 = window.add_child(
        WebviewBuilder::new(
            &format!("{window_id}-1"),
            WebviewUrl::External("https://github.com/tauri-apps/tauri".parse().unwrap()),
        ),
        LogicalPosition::new(0., 0.),
        LogicalSize::new(width, header_height),
    )?;

    let mut mail_view_builder = tauri::webview::WebviewBuilder::new(
        "main3",
        WebviewUrl::External("https://tauri.app".parse().unwrap()),
    );

    // mail_view_builder.data_directory(data_directory) -> makes sense to point to tmp dir
    // mail_view_builder.data_store_identifier(data_store_identifier)

    #[cfg(not(target_os = "android"))]
    {
        mail_view_builder = mail_view_builder.incognito(true);
    }

    let mail_view = window.add_child(
        mail_view_builder,
        LogicalPosition::new(0., header_height),
        LogicalSize::new(width, height - header_height),
    )?;

    // disable javascript
    // TODO/IDEA: try to upstream into wry
    // TODO: get rid of the unwrap/expect here
    mail_view.with_webview(|w| {
        #[cfg(any(target_os = "macos", target_os = "ios"))]
        {
            // TODO test
            w.inner();
            //TODO
        }
        #[cfg(windows)]
        {
            // TODO test
            w.controller()
                .CoreWebView2()
                .expect("get CoreWebView2")
                .Settings()
                .expect("get Settings")
                .SetIsScriptEnabled(false)
                .expect("SetIsScriptEnabled failed");
        }
        #[cfg(any(
            target_os = "linux",
            target_os = "dragonfly",
            target_os = "freebsd",
            target_os = "netbsd",
            target_os = "openbsd"
        ))]
        {
            // TODO test
            use webkit2gtk::{SettingsExt, WebViewExt};
            let settings = WebViewExt::settings(&w.inner()).unwrap();
            settings.set_enable_javascript(false);
        }
    })?;

    // TODO: resize

    // TODO: content protection

    // TODO: serve html content

    // TODO: implement header

    // TODO: prevent access to web (toggle-able)

    // TODO: read preference from user

    // TODO: disable JS in mailview

    // webview.set_visible(true)?;

    window.set_title("Delta Chat Tauri - Help")?; // TODO:

    Ok(())
}
