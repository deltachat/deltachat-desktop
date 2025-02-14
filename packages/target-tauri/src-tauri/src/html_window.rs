use std::{str::FromStr, sync::Arc};

use log::warn;
use tauri::{
    webview::WebviewBuilder, LogicalPosition, LogicalSize, Manager, PhysicalSize, Url, Webview,
    WebviewUrl, WebviewWindow, WebviewWindowBuilder, Window, WindowBuilder, WindowEvent,
    WindowSizeConstraints,
};

use crate::settings::get_content_protection;

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

const HEADER_HEIGHT: f64 = 100.;

#[tauri::command]
pub(crate) fn open_html_window(
    app: tauri::AppHandle,
    window_id: &str,
    account_id: u32,
    is_contact_request: bool,
    subject: &str,
    sender: &str, // this is called "from" in electron edition
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

    let window = WindowBuilder::new(&app, &window_id)
        .inner_size(width, height)
        .build()?;

    let header_view = window.add_child(
        WebviewBuilder::new(
            &format!("{window_id}-1"),
            WebviewUrl::External("https://github.com/tauri-apps/tauri".parse().unwrap()),
        ),
        LogicalPosition::new(0., 0.),
        LogicalSize::new(width, HEADER_HEIGHT),
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
        LogicalPosition::new(0., HEADER_HEIGHT),
        LogicalSize::new(width, height - HEADER_HEIGHT),
    )?;

    // disable javascript & load from string on macOS
    // TODO/IDEA: try to upstream into wry
    // TODO: get rid of the unwrap/expect here
    {
        #[cfg(any(target_os = "macos", target_os = "ios"))]
        {
            // TODO test
            use objc2::rc::Retained;
            use objc2_foundation;
            let content = objc2_foundation::NSString::from_str(content);
            unsafe {
                mail_view.with_webview(move |w| {
                    // meeeds to be done inside of the webview builder inside of tauri:
                    // https://stackoverflow.com/questions/34404481/swift-wkwebview-disable-javascript
                    // or nowerdays in the navigation delegate

                    let view: &objc2_web_kit::WKWebView = &*w.inner().cast();
                    let controller: &objc2_web_kit::WKUserContentController =
                        &*w.controller().cast();

                    //WKWebpagePreferences
                    //  WKWebpagePreferences.allowsContentJavaScript

                    view.loadHTMLString_baseURL(&content, None);

                    controller.removeAllUserScripts();
                })?;
            }
        }
        #[cfg(windows)]
        {
            mail_view.with_webview(|w| {
                // TODO test
                w.controller()
                    .CoreWebView2()
                    .expect("get CoreWebView2")
                    .Settings()
                    .expect("get Settings")
                    .SetIsScriptEnabled(false)
                    .expect("SetIsScriptEnabled failed");
            })?;
        }
        #[cfg(any(
            target_os = "linux",
            target_os = "dragonfly",
            target_os = "freebsd",
            target_os = "netbsd",
            target_os = "openbsd"
        ))]
        {
            mail_view.with_webview(|w| {
                // TODO test
                use webkit2gtk::{SettingsExt, WebViewExt};
                let settings = WebViewExt::settings(&w.inner()).unwrap();
                settings.set_enable_javascript(false);
            })?;
        }
    }

    let header_view_arc = Arc::new(header_view);
    let mail_view_arc = Arc::new(mail_view);
    let window_arc = Arc::new(window);
    let window = window_arc.clone();

    // resize
    window.on_window_event(move |event| {
        if let WindowEvent::Resized(_) | WindowEvent::ScaleFactorChanged { .. } = event {
            update_webview_bounds(&window_arc, &header_view_arc, &mail_view_arc);
        }
    });

    // content protection
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if get_content_protection(&app) {
            window.set_content_protected(true)?;
        }
    }

    //    TODO: read preference about loading remote content

    // TODO: serve html content

    // TODO: implement header view

    // TODO: prevent access to web (toggle-able)

    // TODO: disable JS in mailview

    // TODO: disable navigation - open in system browser instead

    window.set_title(&format!(
        "{} - {}",
        truncate_text(subject, 42),
        truncate_text(sender, 40)
    ))?;

    Ok(())
}

fn update_webview_bounds(
    window: &Arc<Window>,
    header_view: &Arc<Webview>,
    mail_view: &Arc<Webview>,
) {
    let LogicalSize { width, height } = window
        .inner_size()
        .expect("window size accessible")
        .to_logical(window.scale_factor().unwrap_or(1.));
    header_view
        .set_bounds(tauri::Rect {
            position: LogicalPosition::new(0., 0.).into(),
            size: LogicalSize::new(width, HEADER_HEIGHT).into(),
        })
        .unwrap();
    mail_view
        .set_bounds(tauri::Rect {
            position: LogicalPosition::new(0., HEADER_HEIGHT).into(),
            size: LogicalSize::new(width, height - HEADER_HEIGHT).into(),
        })
        .unwrap();
}

fn truncate_text(text: &str, max_len: usize) -> String {
    let truncated: String = text.chars().take(max_len).collect();
    if truncated.len() < text.len() {
        format!("{}…", truncated)
    } else {
        truncated
    }
}
