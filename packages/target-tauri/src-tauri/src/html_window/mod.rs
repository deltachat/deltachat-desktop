use std::{path::PathBuf, str::FromStr, sync::Arc};

use log::{error, info, warn};

use tauri::{
    async_runtime::block_on, webview::WebviewBuilder, LogicalPosition, LogicalSize, Manager, Url,
    Webview, WebviewUrl, Window, WindowBuilder, WindowEvent,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use crate::{
    html_window::error::Error,
    html_window::punycode::{puny_code_decode_host, puny_code_encode_host},
    settings::{
        get_content_protection, get_setting_bool_or, CONFIG_FILE,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT, HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY,
    },
    state::html_email_instances::InnerHtmlEmailInstanceData,
    temp_file::get_temp_folder_path,
    HtmlEmailInstancesState,
};

const HEADER_HEIGHT: f64 = 100.;
const DEFAULT_WINDOW_WIDTH: f64 = 800.;
const DEFAULT_WINDOW_HEIGHT: f64 = 600.;

pub(crate) mod commands;
pub(crate) mod email_scheme;
mod error;
mod punycode;

#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub(crate) fn open_html_window(
    app: tauri::AppHandle,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
    window_id: &str,
    account_id: u32, // TODO needs to be used later for fetching webrequests over dc core
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
            // account_id,
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
            format!("{window_id}-header"),
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
        format!("{window_id}-mail"),
        WebviewUrl::CustomProtocol(Url::from_str("email://dummy.host/index.html").unwrap()),
    )
    .on_navigation(move |url| {
        if url.to_string() == "about:blank" || url.scheme() == "email" {
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

    // TODO: disable JS in mailview

    // TODO: load remote content in mailview over dc core http api to respect users proxy settings

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
