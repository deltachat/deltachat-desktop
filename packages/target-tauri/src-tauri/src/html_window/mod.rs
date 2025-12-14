use std::{path::PathBuf, str::FromStr, sync::Arc};

use anyhow::anyhow;
use log::{error, info, trace, warn};

use tauri::{
    async_runtime::block_on, webview::WebviewBuilder, LogicalPosition, LogicalSize, Manager, State,
    Url, Webview, WebviewUrl, Window, WindowBuilder, WindowEvent,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

use crate::{
    html_window::{
        error::Error,
        punycode::{puny_code_decode_host, puny_code_encode_host},
    },
    settings::{
        apply_zoom_factor_html_window, get_content_protection, CONFIG_FILE,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT, HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY,
    },
    state::html_email_instances::InnerHtmlEmailInstanceData,
    temp_file::get_temp_folder_path,
    util::truncate_text,
    DeltaChatAppState, HtmlEmailInstancesState, MenuManager, TranslationState,
};

#[cfg(desktop)]
use crate::menus::{
    float_on_top::set_window_float_on_top_based_on_main_window,
    html_window_menu::create_html_window_menu,
};

const HEADER_HEIGHT: f64 = 100.;
const DEFAULT_WINDOW_WIDTH: f64 = 800.;
const DEFAULT_WINDOW_HEIGHT: f64 = 600.;

#[cfg(desktop)]
pub(crate) mod commands;
pub(crate) mod email_scheme;
mod error;
mod punycode;

#[cfg(desktop)]
#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub(crate) async fn open_html_window(
    app: tauri::AppHandle,
    html_instances_state: State<'_, HtmlEmailInstancesState>,
    dc: State<'_, DeltaChatAppState>,
    menu_manager: State<'_, MenuManager>,
    account_id: u32, // TODO needs to be used later for fetching webrequests over dc core
    message_id: u32,
    is_contact_request: bool,
    subject: &str,
    sender: &str, // this is called "from" in electron edition
    receive_time: &str,
    content: &str,
) -> Result<(), Error> {
    use crate::settings::StoreExtBoolExt;
    use crate::util::url_origin::UrlOriginExtension;

    let window_id = format!("html-window:{account_id}-{message_id}");
    trace!("open_html_window: {window_id}");

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if let Some(window) = app.get_window(&window_id) {
            // window already exists focus it - android and iOS don't have have the function
            // and those platforms also don't have multiple windows
            window.show()?;
            window.set_focus()?;
            return Ok(());
        }
    }

    let blocked_by_proxy = {
        let dc = dc.deltachat.read().await;
        let account: deltachat::context::Context = dc
            .get_account(account_id)
            .ok_or(Error::DeltaChat(anyhow!("account not found")))?;
        account
            .get_config_bool(deltachat::config::Config::ProxyEnabled)
            .await
    }
    .map_err(Error::DeltaChat)?;

    let always_load_remote_content = app.store(CONFIG_FILE)?.get_bool_or(
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT,
    );
    let toggle_network_initial_state =
        !blocked_by_proxy && always_load_remote_content && !is_contact_request;

    html_instances_state
        .add(
            &window_id,
            InnerHtmlEmailInstanceData {
                // account_id,
                is_contact_request,
                subject: subject.to_owned(),
                sender: sender.to_owned(),
                receive_time: receive_time.to_owned(),
                html_content: content.to_owned(),
                network_allow_state: toggle_network_initial_state,
                blocked_by_proxy,
            },
        )
        .await;

    let window = Arc::new(
        WindowBuilder::new(&app, &window_id)
            .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
            .build()?,
    );

    #[allow(unused_mut)]
    let mut header_webview_builder = WebviewBuilder::new(
        format!("{window_id}-header"),
        WebviewUrl::App(
            PathBuf::from_str("tauri_html_email_view/html_email_view.html")
                .expect("path conversion failed"),
        ),
    );
    #[cfg(target_os = "macos")]
    {
        header_webview_builder = header_webview_builder.allow_link_preview(false);
    }

    let header_view = window.add_child(
        header_webview_builder,
        LogicalPosition::new(0., 0.),
        LogicalSize::new(DEFAULT_WINDOW_WIDTH, HEADER_HEIGHT),
    )?;

    let app_arc = Arc::new(app);
    let app = app_arc.clone();
    let app_for_nav = app_arc.clone();

    let initial_url = {
        #[cfg(not(any(target_os = "windows", target_os = "android")))]
        {
            Url::from_str("email://dummy.host/index.html").unwrap()
        }
        #[cfg(any(target_os = "windows", target_os = "android"))]
        {
            Url::from_str("http://email.localhost/index.html").unwrap()
        }
    };

    let mut mail_view_builder = tauri::webview::WebviewBuilder::new(
        format!("{window_id}-mail"),
        WebviewUrl::CustomProtocol(initial_url.clone()),
    )
    .disable_javascript()
    .on_navigation(move |url| {
        let tx: tauri::State<'_, TranslationState> = app_for_nav.state::<TranslationState>();
        if url.to_string() == "about:blank" {
            return true;
        }
        // When this is `true`, the request is guaranteed
        // to be intercepted by Tauri
        // (see `register_asynchronous_uri_scheme_protocol("email"`).
        // When `false`, it still _might_ get intercepted,
        // but only if the message contains some weird links like
        // `email://other.host/`.
        // We only really care about  navigating to `initial_url`:
        // the HTML message viewer is not supposed to be multipage,
        // so it's OK to handle such weird links as external, below.
        //
        // `initial_url.origin()` won't work, because it returns
        // an opaque origin for `webxdc:` protocol,
        // and no two opaque origins are equal.
        let will_be_intercepted = url.origin_no_opaque() == initial_url.origin_no_opaque();
        if will_be_intercepted {
            return true;
        }

        let orginal_host_name = match url.host_str() {
            None => {
                warn!("link url has no host");
                return false;
            }
            Some(h) => h,
        };

        info!("{orginal_host_name}");
        if puny_code_encode_host(orginal_host_name) != puny_code_decode_host(orginal_host_name) {
            info!(
                "{orginal_host_name} -- {}:{}",
                puny_code_encode_host(orginal_host_name),
                puny_code_decode_host(orginal_host_name)
            );
            let app_arc2 = app_arc.clone();
            let url2 = url.clone();
            app_arc
                .dialog()
                .message(format!(
                    "{}\n\n{}",
                    tx.sync_translate(
                        "puny_code_warning_question", /*"puny_code_decode_host(orginal_host_name)"*/
                    ),
                    // TODO substitution
                    tx.sync_translate("puny_code_warning_description"),
                ))
                .title(tx.sync_translate("puny_code_warning_header"))
                .kind(tauri_plugin_dialog::MessageDialogKind::Warning)
                .buttons(tauri_plugin_dialog::MessageDialogButtons::OkCancelCustom(
                    tx.sync_translate("open"),
                    tx.sync_translate("cancel"),
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
    });

    // enable incognito mode, so html email gets different browsing context.
    #[allow(unused_variables)]
    let tmp_data_dir = get_temp_folder_path(&app)?.join(uuid::Uuid::new_v4().to_string());
    #[cfg(not(target_vendor = "apple"))]
    {
        mail_view_builder = mail_view_builder.data_directory(tmp_data_dir.clone());
    }
    #[cfg(not(target_os = "android"))]
    {
        mail_view_builder = mail_view_builder.incognito(true);
        // on apple this uses nonPersistent WKWebsiteDataStore
    }
    #[cfg(target_os = "macos")]
    {
        mail_view_builder = mail_view_builder.allow_link_preview(false);
    }
    let mail_view = window.add_child(
        mail_view_builder,
        LogicalPosition::new(0., HEADER_HEIGHT),
        LogicalSize::new(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT - HEADER_HEIGHT),
    )?;

    let header_view_arc = Arc::new(header_view);
    let mail_view_arc = Arc::new(mail_view);

    let window_clone = Arc::clone(&window);
    // resize
    window.on_window_event(move |event| {
        if let WindowEvent::Resized(_) | WindowEvent::ScaleFactorChanged { .. } = event {
            update_webview_bounds(&window_clone, &header_view_arc, &mail_view_arc);
        }
        if let WindowEvent::Destroyed = event {
            if let Err(err) = mail_view_arc.clear_all_browsing_data() {
                error!("failed to clear browsing data after html email window closed: {err:?}");
            }
            #[cfg(not(target_vendor = "apple"))]
            {
                use tauri::async_runtime::spawn;
                use tokio::fs::remove_dir;

                let tmp_data_dir = tmp_data_dir.clone();
                spawn(async {
                    if let Err(err) = remove_dir(tmp_data_dir).await {
                        error!(
                            "failed to remove tmp_data_dir after html email window closed: {err:?}"
                        )
                    }
                });
            }
            let html_instances_state = window_clone.app_handle().state::<HtmlEmailInstancesState>();
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

    // IDEA: load remote content in mailview over dc core http api to respect users proxy settings
    // For now we choose to disable the feature when user set a proxy,
    // because there is currently no easy way to acomplish this.

    window.set_title(&format!(
        "{} - {}",
        truncate_text(subject, 42),
        truncate_text(sender, 40)
    ))?;

    if let Err(err) = apply_zoom_factor_html_window(&app) {
        error!("failed to apply zoom factor: {err}")
    }
    if let Err(err) = set_window_float_on_top_based_on_main_window(&window) {
        error!("failed to apply float on top: {err}")
    }

    let window_clone = Arc::clone(&window);
    menu_manager
        .register_window(
            &app,
            &*window,
            Box::new(move |app| create_html_window_menu(app, &window_clone)),
        )
        .await
        .map_err(|err| Error::MenuCreation(err.to_string()))?;

    Ok(())
}

#[cfg(desktop)]
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
