use std::{path::PathBuf, str::FromStr, sync::Arc};

use log::{debug, error, info, warn};
use serde::Serialize;
use tauri::{
    async_runtime::block_on,
    menu::{CheckMenuItem, Menu, MenuItem},
    webview::WebviewBuilder,
    LogicalPosition, LogicalSize, Manager, PhysicalPosition, Url, Webview, WebviewUrl, Window,
    WindowBuilder, WindowEvent,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use crate::{
    settings::{
        get_content_protection, get_setting_bool_or, CONFIG_FILE,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT, HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY,
        HTML_EMAIL_WARNING_DEFAULT, HTML_EMAIL_WARNING_KEY,
    },
    state::html_email_instances::InnerHtmlEmailInstanceData,
    temp_file::get_temp_folder_path,
    HtmlEmailInstancesState,
};

const HEADER_HEIGHT: f64 = 100.;
const DEFAULT_WINDOW_WIDTH: f64 = 800.;
const DEFAULT_WINDOW_HEIGHT: f64 = 600.;

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    // #[error(transparent)]
    // Wry(#[from] wry::Error),
    #[error("window label not found in HtmlEmailInstancesState")]
    WindowNotFoundInState,
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error("user canceled")]
    UserCanceled,
    #[error(transparent)]
    TokioOneshotRecv(#[from] tokio::sync::oneshot::error::RecvError),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

async fn set_load_remote_content(webview: &tauri::Webview, new_state: bool) -> Result<(), Error> {
    let instance_state = webview.state::<HtmlEmailInstancesState>();
    instance_state
        .set_network_allow_state(webview.window().label(), new_state)
        .await;

    // reload header & html email webviews to apply changes
    for mut webview in webview.window().webviews() {
        if webview.label().ends_with("-mail") {
            // TODO: wry webview.reload is missing
            // this is a hack to emulate reload
            // IDEA: better error handling
            let url = webview.url().unwrap();
            webview
                .navigate(Url::from_str("about:blank").unwrap())
                .unwrap();
            webview.navigate(url).unwrap();
        }
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn html_email_set_load_remote_content(
    app: tauri::AppHandle,
    webview: tauri::Webview,
    load_remote_content: bool,
) -> Result<(), Error> {
    let desktop_settings = app.store(CONFIG_FILE)?;
    let warning = get_setting_bool_or(
        desktop_settings.get(HTML_EMAIL_WARNING_KEY),
        HTML_EMAIL_WARNING_DEFAULT,
    );

    if warning && load_remote_content {
        let (tx, rx) = tokio::sync::oneshot::channel::<bool>();

        app.dialog()
            .message("tx('load_remote_content_ask')")
            .parent(&webview.window())
            .buttons(tauri_plugin_dialog::MessageDialogButtons::OkCancelCustom(
                // TODO use translation strings, as soon as translations are avaialble in rust backend
                "Yes".to_owned(),
                "No".to_owned(),
            ))
            .show(|answer| tx.send(answer).unwrap());
        if !rx.await? {
            return Err(Error::UserCanceled);
        }
    }

    set_load_remote_content(&webview, load_remote_content).await
}

#[tauri::command]
pub(crate) fn html_email_open_menu(
    app: tauri::AppHandle,
    webview: tauri::Webview,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
) -> Result<(), Error> {
    let desktop_settings = app.store(CONFIG_FILE)?;
    let always_load = get_setting_bool_or(
        desktop_settings.get(HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY),
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT,
    );
    let warning = get_setting_bool_or(
        desktop_settings.get(HTML_EMAIL_WARNING_KEY),
        HTML_EMAIL_WARNING_DEFAULT,
    );

    let instance_state = block_on(html_instances_state.get(webview.window().label()))
        .ok_or(Error::WindowNotFoundInState)?;

    let always_load_remote_images = CheckMenuItem::new(
        &app,
        "tx('always_load_remote_images')",
        true,
        always_load,
        None::<&str>,
    )?;
    let show_warning = CheckMenuItem::new(&app, "tx('show_warning')", true, warning, None::<&str>)?;

    let menu = if instance_state.is_contact_request {
        Menu::with_items(&app, &[&show_warning])
    } else {
        Menu::with_items(&app, &[&always_load_remote_images, &show_warning])
    }?;

    // treefit: I haven't found an easy way to get the title bar offset,
    // so now we just spawn it at mouse position
    webview.window().popup_menu(&menu)?;
    webview.window().on_menu_event(move |window, event| {
        // IDEA: better error handling
        let desktop_settings = window.store(CONFIG_FILE).expect("config file not found");
        if event.id() == always_load_remote_images.id() {
            let new_always_load = !always_load;
            desktop_settings.set(HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY, new_always_load);
            block_on(set_load_remote_content(&webview, new_always_load)).unwrap();

            // TODO: implement reload in tauri
            webview.eval("location.reload()").unwrap();
        }
        if event.id() == show_warning.id() {
            desktop_settings.set(HTML_EMAIL_WARNING_KEY, !warning);
        }
    });
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct HtmlEmailInfo {
    subject: String,
    sender: String, // this is called "from" in electron edition
    receive_time: String,
    toggle_network: bool,
    network_button_label_text: String,
}

#[tauri::command]
pub(crate) fn get_html_window_info(
    webview: tauri::Webview,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
) -> Result<HtmlEmailInfo, Error> {
    let label = webview.window().label().to_owned();
    // IDEA: can we make this function async without getting an error on html_instances_state
    let instance =
        block_on(html_instances_state.get(&label)).ok_or(Error::WindowNotFoundInState)?;

    Ok(HtmlEmailInfo {
        subject: instance.subject,
        sender: instance.sender,
        receive_time: instance.receive_time,
        toggle_network: instance.network_allow_state,
        network_button_label_text: format!("tx(\"load_remote_content\")"),
    })
}

#[tauri::command]
pub(crate) fn open_html_window(
    app: tauri::AppHandle,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
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

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if let Some(window) = app.get_window(&window_id) {
            // window already exists focus it - android and iOS don't have have the function
            // and those platforms also don't have multiple windows
            window.show()?;
            return Ok(());
        }
    }

    let store = app.store(CONFIG_FILE)?;
    let always_load_remote_content = get_setting_bool_or(
        store.get(HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY),
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT,
    );
    let toggle_network_initial_state = always_load_remote_content && !is_contact_request;

    block_on(html_instances_state.add(
        &window_id,
        InnerHtmlEmailInstanceData {
            account_id,
            is_contact_request,
            subject: subject.to_owned(),
            sender: sender.to_owned(),
            receive_time: receive_time.to_owned(),
            html_content: Arc::new(content.to_owned()),
            network_allow_state: toggle_network_initial_state,
        },
    ));

    let window = WindowBuilder::new(&app, &window_id)
        .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
        .build()?;

    let header_view = window.add_child(
        WebviewBuilder::new(
            &format!("{window_id}-header"),
            WebviewUrl::App(
                PathBuf::from_str("tauri_html_email_view/html_email_view.html")
                    .expect("path conversion failed"),
            ),
        ),
        LogicalPosition::new(0., 0.),
        LogicalSize::new(DEFAULT_WINDOW_WIDTH, HEADER_HEIGHT),
    )?;

    let app_arc = Arc::new(app);
    let app = app_arc.clone();

    let mut mail_view_builder = tauri::webview::WebviewBuilder::new(
        &format!("{window_id}-mail"),
        WebviewUrl::CustomProtocol(Url::from_str("about:blank").unwrap()),
    )
    .on_navigation(move |url| {
        if url.to_string() == "about:blank" {
            // allow navigating to the email
            return true;
        }

        if let Some(orginal_host_name) = url.host_str() {
            info!("{orginal_host_name}");
            if puny_code_encode_host(orginal_host_name) != puny_code_decode_host(orginal_host_name)
            {
                info!(
                    "{orginal_host_name} -- {}:{}",
                    puny_code_encode_host(orginal_host_name),
                    puny_code_decode_host(orginal_host_name)
                );
                let app_arc2 = app_arc.clone();
                let url2 = url.clone();
                app_arc
                    .dialog()
                    .message(
                        "Punycode detected: tx('puny_code_warning_question', '$$asciiHostname$$')",
                    )
                    .title("tx('puny_code_warning_header')")
                    .kind(tauri_plugin_dialog::MessageDialogKind::Warning)
                    .buttons(tauri_plugin_dialog::MessageDialogButtons::OkCancelCustom(
                        // TODO use translation strings, as soon as translations are avaialble in rust backend
                        "Continue".to_owned(),
                        "cancel".to_owned(),
                    ))
                    .show(move |ok| {
                        if ok {
                            if let Err(error) =
                                app_arc2.opener().open_url(url2.to_string(), None::<&str>)
                            {
                                error!("Failed to open Link: {error:?}");
                                app_arc2
                                    .dialog()
                                    .message("Failed to open Link: {url2}\n{error:?}")
                                    .show(|_| {});
                            }
                        }
                    });
                return false;
            }

            // prevent navigation - open in system browser instead
            if let Err(error) = app_arc.opener().open_url(url.to_string(), None::<&str>) {
                error!("Failed to open Link: {error:?}");
                app_arc
                    .dialog()
                    .message("Failed to open Link: {url}\n{error:?}")
                    .show(|_| {});
            }
            false
        } else {
            warn!("link url has no host");
            false
        }
    });

    // change data directory and enable incognito mode, so html email gets different browsing context.
    #[cfg(target_vendor = "apple")]
    {
        // for now using this well known id, but later we should really change it to use `nonPersistent` data store
        mail_view_builder = mail_view_builder
            .data_store_identifier([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
        // IDEA: add `WKWebsiteDataStore.nonPersistent()` to tauri & wry
        // https://developer.apple.com/documentation/webkit/wkwebsitedatastore
    }
    #[allow(unused_variables)]
    let tmp_data_dir = get_temp_folder_path(&app)?.join(uuid::Uuid::new_v4().to_string());
    #[cfg(not(target_vendor = "apple"))]
    {
        let data_dir = mail_view_builder.data_directory(&tmp_data_dir);
    }
    #[cfg(not(target_os = "android"))]
    {
        mail_view_builder = mail_view_builder.incognito(true);
    }
    let mail_view = window.add_child(
        mail_view_builder,
        LogicalPosition::new(0., HEADER_HEIGHT),
        LogicalSize::new(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT - HEADER_HEIGHT),
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
        if let WindowEvent::Destroyed = event {
            if let Err(err) = mail_view_arc.clear_all_browsing_data() {
                error!("failed to clear browsing data after html email window closed: {err:?}");
            }
            #[cfg(not(target_vendor = "apple"))]
            {
                let tmp_data_dir = tmp_data_dir.clone();
                let _ = spawn(async {
                    if let Err(err) = remove_dir(tmp_data_dir).await {
                        error!(
                            "failed to remove tmp_data_dir after html email window closed: {err:?}"
                        )
                    }
                });
            }
            let html_instances_state = window_arc.app_handle().state::<HtmlEmailInstancesState>();
            block_on(html_instances_state.remove(&window_id));
        }
    });

    // content protection
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if get_content_protection(&app) {
            window.set_content_protected(true)?;
        }
    }

    // TODO: serve html content

    // TODO: implement header view

    // TODO: prevent access to web (toggle-able)

    // TODO: disable JS in mailview

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

/// Returns true if host string contains non ASCII characters
fn is_puny(host: &str) -> bool {
    for ch in host.chars() {
        if !(ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-')) {
            return true;
        }
    }
    false
}

/// Returns host as punycode encoded string
fn puny_code_encode_host(host: &str) -> String {
    host.to_owned()
        .split('.')
        .map(|sub| {
            if is_puny(sub) {
                format!(
                    "xn--{}",
                    unic_idna_punycode::encode_str(sub)
                        .unwrap_or_else(|| "[punycode encode failed]".to_owned())
                )
            } else {
                sub.to_owned()
            }
        })
        .collect::<Vec<String>>()
        .join(".")
}

/// Returns host as decoded string
fn puny_code_decode_host(host: &str) -> String {
    host.to_owned()
        .split('.')
        .map(|sub| {
            if let Some(sub) = sub.strip_prefix("xn--") {
                unic_idna_punycode::decode_to_string(sub)
                    .unwrap_or_else(|| "[punycode decode failed]".to_owned())
            } else {
                sub.to_owned()
            }
        })
        .collect::<Vec<String>>()
        .join(".")
}
