/*!
These commands are supposed to be used only by the `main` window,
and _not_ the webxdc apps themselves.
*/

use std::{str::FromStr, sync::Arc};

use anyhow::Context;
use deltachat::{
    chat::Chat,
    message::{Message, MsgId},
    peer_channels::leave_webxdc_realtime,
    webxdc::WebxdcInfo,
};
use log::{error, trace, warn};

use rand::distr::SampleString;
use sha2::Digest;
use tauri::{
    async_runtime::block_on, image::Image, AppHandle, Manager, State, Url, WebviewUrl,
    WebviewWindowBuilder, WindowEvent,
};
use tauri_plugin_store::StoreExt;

#[cfg(desktop)]
use crate::{menus::webxdc_menu::create_webxdc_window_menu, settings::get_content_protection};

use crate::{
    network_isolation_dummy_proxy,
    settings::{
        StoreExtBoolExt, ENABLE_WEBXDC_DEV_TOOLS_DEFAULT, ENABLE_WEBXDC_DEV_TOOLS_KEY,
        WEBXDC_ZOOM_FACTOR_KEY,
    },
    state::{
        menu_manager::MenuManager,
        webxdc_instances::{WebxdcInstance, WebxdcInstancesState},
    },
    util::{truncate_text, url_origin::UrlOriginExtension},
    webxdc::data_storage::{
        delete_webxdc_data_for_account, delete_webxdc_data_for_instance, set_data_store,
    },
    DeltaChatAppState, CONFIG_FILE,
};

use super::{commands::WebxdcUpdate, error::Error};

const INIT_SCRIPT: &str = r#"
// keep this log line as long as we are testing
// to easily see that it is called from every frame
console.log("hello from INIT_SCRIPT")

// remove peer connection by overwriting api
try {
    window.RTCPeerConnection = () => {};
    RTCPeerConnection = () => {};
} catch (e) {
    console.error("failed to overwrite RTCPeerConnection apis",e)
}
try {
    window.webkitRTCPeerConnection = () => {};
    webkitRTCPeerConnection = () => {};
} catch (e) {}
"#;

#[cfg(desktop)]
#[tauri::command]
pub(crate) async fn on_webxdc_message_changed<'a>(
    app: AppHandle,
    deltachat_state: State<'a, DeltaChatAppState>,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    let Some((window_label, instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    else {
        return Ok(());
    };
    let Some(window) = app.get_window(&window_label) else {
        return Ok(());
    };

    let dc_accounts = deltachat_state.deltachat.read().await;
    let account = dc_accounts
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;
    // we need to load a new snapshot as the document title is part of the message snapshot
    let webxdc_info = Message::load_from_db(&account, instance.message.get_id())
        .await
        .map_err(|err| {
            error!("on_webxdc_message_changed: Message::load_from_db {err:?}");
            Error::WebxdcInstanceNotFound(account_id, instance.message.get_id().to_u32())
        })?
        .get_webxdc_info(&account)
        .await
        .map_err(Error::DeltaChat)?;
    let chat_name = Chat::load_from_db(&account, instance.message.get_chat_id())
        .await
        .map_err(Error::DeltaChat)?
        .name;
    window.set_title(&make_title(&webxdc_info, &chat_name))?;

    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
pub(crate) async fn on_webxdc_message_deleted(
    app: AppHandle,
    webxdc_instances: State<'_, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((window_label, _)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            window.destroy()?;
        }
    }

    delete_webxdc_data_for_instance(&app, account_id, instance_id).await
}

#[tauri::command]
pub(crate) async fn delete_webxdc_account_data(
    app: AppHandle,
    webxdc_instances: State<'_, WebxdcInstancesState>,
    account_id: u32,
) -> Result<(), Error> {
    for window_label in webxdc_instances
        .get_all_webxdc_windows_for_account_id(account_id)
        .await
    {
        #[cfg(desktop)]
        {
            if let Some(window) = app.get_window(&window_label) {
                window.destroy()?;
            }
        }
    }
    delete_webxdc_data_for_account(&app, account_id).await
}

#[tauri::command]
pub(crate) async fn on_webxdc_status_update(
    webxdc_instances: State<'_, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((_window_label, instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        let channel = instance.channel.ok_or(Error::ChannelNotInitializedYet)?;
        channel.send(WebxdcUpdate::Status)?;
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn on_webxdc_realtime_data(
    webxdc_instances: State<'_, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
    payload: Vec<u8>,
) -> Result<(), Error> {
    if let Some((_window_label, instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        let channel = instance.channel.ok_or(Error::ChannelNotInitializedYet)?;
        channel.send(WebxdcUpdate::RealtimePacket(payload))?;
    }
    Ok(())
}

#[cfg(desktop)]
#[tauri::command]
pub(crate) async fn close_all_webxdc_instances(
    app: AppHandle,
    webxdc_instances: State<'_, WebxdcInstancesState>,
) -> Result<(), Error> {
    let results = webxdc_instances
        .get_all_webxdc_window_labels()
        .await
        .into_iter()
        .map(|window_label| app.get_window(&window_label).map(|window| window.destroy()));

    let mut last_error_result = Ok(());
    for result in results.flatten() {
        if let Err(err) = result {
            error!("wee {err:?}");
            last_error_result = Err(err);
        }
    }
    last_error_result?;
    Ok(())
}

const DEFAULT_WINDOW_WIDTH: f64 = 375.;
const DEFAULT_WINDOW_HEIGHT: f64 = 667.;

fn webxdc_base_url() -> Result<Url, Error> {
    #[cfg(not(any(target_os = "windows", target_os = "android")))]
    {
        Ok(Url::from_str("webxdc://dummy.host/index.html")?)
    }
    #[cfg(any(target_os = "windows", target_os = "android"))]
    {
        Ok(Url::from_str("http://webxdc.localhost/index.html")?)
    }
}

fn href_to_webxdc_url(href: String) -> Result<Url, Error> {
    let mut url = webxdc_base_url()?;
    let url_with_href = Url::from_str(&format!("http://webxdc.localhost/{href}"))?;
    if !url_with_href.path().is_empty() {
        url.set_path(url_with_href.path());
    }
    url.set_fragment(url_with_href.fragment());
    url.set_query(url_with_href.query());
    Ok(url)
}

#[tauri::command]
pub(crate) async fn open_webxdc<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    deltachat_state: State<'a, DeltaChatAppState>,
    menu_manager: State<'_, MenuManager>,
    account_id: u32,
    message_id: u32,
    href: String,
) -> Result<(), Error> {
    let window_id: String = {
        let get_random_chars = || rand::distr::Alphanumeric.sample_string(&mut rand::rng(), 64);
        let webxdc_window_state_store_name = ".webxdc-window-state-secret.json";
        // Why do we need to store a secret just for making a window label?
        // Because we want to keep the window label fixed
        // per webxdc app message,
        // so that the window state (position, size) is stored
        // using `tauri_plugin_window_state`,
        // but at the same time we don't want to expose
        // the account_id and message_id to the webxdc app
        // (through `globalThis.__TAURI_INTERNALS__.metadata.currentWindow.label`)
        // because account_id and message_id can give away how many accounts
        // and messages the user has.
        // So the app could
        //
        // TODO we probably need to consider a more secure way
        // to store this secret. But it's not a super important one.
        let secret = app
            .store(webxdc_window_state_store_name)
            .map(|store| {
                let store_key = "webxdc-window-state-secret";
                store
                    .get(store_key)
                    .and_then(|val| val.as_str().map(|s| s.to_string()))
                    .unwrap_or_else(|| {
                        let random_chars = get_random_chars();
                        log::info!("{store_key} not found, creating a storing a new one");
                        store.set(store_key, random_chars.clone());
                        random_chars
                    })
            })
            .unwrap_or_else(|err| {
                log::error!(
                    "failed to read {webxdc_window_state_store_name} store, webxdc window bounds will not be restored: {err}",
                );
                get_random_chars()
            });

        let hash = sha2::Sha256::digest(format!("{secret}-{account_id}-{message_id}"));
        format!("webxdc:{hash:X}")
    };
    trace!("open webxdc '{window_id}', ({account_id}, {message_id}): href: {href}");

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if let Some((window_label, _instance)) = webxdc_instances
            .get_webxdc_for_instance(account_id, message_id)
            .await
        {
            let Some(window) = app.get_window(&window_label) else {
                // this case should never happen, this is an attempt to autorecover in production
                warn!("instance exists, but window missing, we now remove the instance as workaround so the next open will work again");
                webxdc_instances.remove_by_window_label(&window_label).await;
                return Err(Error::InstanceExistsButWindowMissing);
            };

            // window already exists focus it - android and iOS don't have have the function
            // and those platforms also don't have multiple windows
            window.show()?;
            window.set_focus()?;

            if !href.is_empty() {
                window
                    .webviews()
                    .first()
                    .context("did not find webview, this should not happen, contact devs")
                    .map_err(Error::Anyhow)?
                    .navigate(href_to_webxdc_url(href)?)?;
            }

            return Ok(());
        }
    }

    let dc_accounts = deltachat_state.deltachat.read().await;
    let account = dc_accounts
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;
    let webxdc_message = Message::load_from_db(&account, MsgId::new(message_id))
        .await
        .map_err(|err| {
            error!("failed to load webxdc message: {err:?}");
            Error::WebxdcInstanceNotFound(account_id, message_id)
        })?;
    let webxdc_info = webxdc_message
        .get_webxdc_info(&account)
        .await
        .map_err(Error::DeltaChat)?;
    let chat_name = Chat::load_from_db(&account, webxdc_message.get_chat_id())
        .await
        .map_err(Error::DeltaChat)?
        .name;

    // add to a state so we can access account id and msg faster without parsing window id
    webxdc_instances
        .add_by_window_label(
            &window_id,
            WebxdcInstance {
                account_id,
                message: webxdc_message.clone(),
                channel: None,
            },
        )
        .await;

    // Contruct window
    let initial_url = if href.is_empty() {
        webxdc_base_url()?
    } else {
        href_to_webxdc_url(href)?
    };
    let initial_url_clone = initial_url.clone();

    let dummy_localhost_proxy_url = network_isolation_dummy_proxy::DUMMY_LOCALHOST_PROXY_URL
        .as_ref()
        .map_err(|_err| Error::BlackholeProxyUnavailable)?;

    #[cfg(not(any(target_os = "windows", target_os = "android")))]
    assert_eq!(
        initial_url.origin_no_opaque(),
        ("webxdc", Some(url::Host::Domain("dummy.host")), None)
    );
    #[cfg(any(target_os = "windows", target_os = "android"))]
    assert_eq!(
        initial_url.origin_no_opaque(),
        ("http", Some(url::Host::Domain("webxdc.localhost")), None)
    );

    let mut window_builder = WebviewWindowBuilder::new(
        &app,
        &window_id,
        WebviewUrl::CustomProtocol(initial_url.clone()),
    )
    .initialization_script_for_all_frames(INIT_SCRIPT)
    .devtools({
        // Dev tools might not work on macOS in production,
        // see comments around `enableWebxdcDevTools`.
        //
        // TODO check whether opening dev tools is an exfiltration risk
        // on WebKit (see comments about `enableWebxdcDevTools`),
        // otherwise we need no special treatment
        // for webxdc windows' dev tools and just use
        // the same behavior as we use for the main window.
        app.store(CONFIG_FILE)
            .context(format!(
                "failed to load config.json to read the value of {ENABLE_WEBXDC_DEV_TOOLS_KEY}"
            ))
            .inspect_err(|err| log::error!("{err}"))
            .map(|store| {
                store.get_bool_or(ENABLE_WEBXDC_DEV_TOOLS_KEY, ENABLE_WEBXDC_DEV_TOOLS_DEFAULT)
            })
            .unwrap_or(false)
    })
    .on_navigation(move |url| url.origin_no_opaque() == initial_url_clone.origin_no_opaque());

    // This is only for non-macOS platforms.
    // Use a non-working proxy to almost(!) isolate the app
    // from the internet.
    // "Almost" because there are still cases where the webview
    // will bypass the proxy, such as with WebRTC.
    // To disable WebRTC, we take separate measures.
    //
    // Note that `additional_browser_args` might make `proxy_url`
    // have no effect (see below).
    //
    // IDEA: we disabled it on macOS, because it increased the minimum version to 14.
    // But there may be a possibility to enable it conditionally when the api is available, see
    // https://github.com/deltachat/deltachat-desktop/issues/5201
    #[cfg(not(target_os = "macos"))]
    {
        window_builder = window_builder.proxy_url(dummy_localhost_proxy_url.clone());
    }

    // This is only for Chromium (i.e. Windows).
    // Note that this will make `WebviewWindowBuilder::proxy_url`,
    // and potentially some other, future options, have no effect:
    // we will have to manually specify `dummy_proxy_url` in args.
    #[cfg(target_os = "windows")]
    {
        window_builder = window_builder.additional_browser_args(
            &get_chromium_hardening_browser_args(dummy_localhost_proxy_url),
        );
    }
    #[cfg(desktop)]
    {
        window_builder = window_builder.inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
    }

    #[cfg(target_os = "macos")]
    {
        window_builder = window_builder.allow_link_preview(false);
    }

    window_builder = set_data_store(&app, window_builder, account_id, message_id).await?;

    let window = Arc::new(window_builder.build()?);

    // FYI there is also `window_builder.zoom_hotkeys_enabled(true)`.
    // But the zoom level unfortunately does not appear to persist
    // between app launches, at least on Windows.
    window
        .set_zoom(
            app.store(CONFIG_FILE)
                .context(format!(
                    "failed to load config.json to read the value of {WEBXDC_ZOOM_FACTOR_KEY}"
                ))
                .inspect_err(|err| log::error!("{err}"))
                .ok()
                .and_then(|store| store.get(WEBXDC_ZOOM_FACTOR_KEY))
                .and_then(|f| f.as_f64())
                .unwrap_or(1.0),
        )
        .context("failed to set zoom on new webxdc window")
        .inspect_err(|err| log::error!("{err}"))
        .ok();

    let window_clone = Arc::clone(&window);
    let webxdc_js_url = {
        let mut url = initial_url.clone();
        url.set_path("/webxdc.js");
        url
    };
    // Whether we're about to close the window.
    // (there is probably a way to use a non-atomic bool).
    let is_closing = std::sync::atomic::AtomicBool::new(false);
    let messge_id_to_leave = webxdc_message.get_id();
    window.on_window_event(move |event| {
        if let WindowEvent::Destroyed = event {
            //TODO test if this fires when account is deleted
            warn!("webxdc window destroyed {account_id} {message_id}");

            // remove from "running instances"-state
            let webxdc_instances = window_clone.state::<WebxdcInstancesState>();
            block_on(webxdc_instances.remove_by_window_label(&window_id));

            // leave realtime channel
            // IDEA: track in WebxdcInstancesState whether webxdc joined and only call this method if it did
            let dc = window_clone.state::<DeltaChatAppState>();
            if let Err(err) = block_on(async move {
                // workaround for not yet available try_blocks feature
                // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
                let response_result: anyhow::Result<_> = async {
                    let dc = dc.deltachat.read().await;
                    let account = dc.get_account(account_id).context("account not found")?;
                    leave_webxdc_realtime(&account, messge_id_to_leave).await?;
                    Ok(())
                }
                .await;
                response_result
            }) {
                warn!("failed to leave realtime channel, this is normal if the webxdc app did not open a realtime channel: {err}")
            }
        }
        if let WindowEvent::CloseRequested { api, .. } = event {
            // Close the window, but manually unload the page, and wait a bit,
            // so that `sendUpdate()`s executed inside of `visibilitychange`
            // or `unload` event listeners have time to reach the backend
            // and don't get lost.
            // This is a workaround for
            // https://github.com/deltachat/deltachat-desktop/issues/3321.
            //
            // TODO fix: this doesn't work when you quit
            // the Delta Chat app itself (as opposed to only closing
            // the webxdc app window).
            //
            // TODO fix: for some reason the "Text Webxdc" app
            // (https://webxdc.org/apps/#webxdc-test)
            // reports that there are 2 `webxdc.sendUpdate()`s per each
            // `beforeunload`, `visibilitychange` and `pagehide` event,
            // at least on Windows.

            // I don't know much about ordering,
            // but non-relaxed ordering doesn't seem to be needed here.
            let is_closing_already = is_closing.swap(true, std::sync::atomic::Ordering::Relaxed);
            if is_closing_already {
                log::debug!("A second CloseRequested event fired on webxdc window, closing now");
                return;
            }
            let new_url = webxdc_js_url.clone();
            log::debug!(
                "CloseRequested on webxdc window. Will `prevent_close()` and navigate to {new_url}"
            );

            // `CloseRequested` itself does not seem to trigger any of the
            // web page lifecycle events (`beforeunload`, `visibilitychange`),
            // (probably because it can be cancelled).
            // So let's ensure to manually unload the app's document,
            // by simply navigating.
            //
            // Navigating to any page should work, but let's pick a page
            // navigating to which will have no side effects on the app state,
            // i.e. the page where we won't execute any JavaScript.
            // This is not for security, but to ensure
            // normal functioning of the app.
            // That is, we could just `window.reload()`,
            // but then the app could execute some JS and, let's say,
            // update the "times you opened this app" counter.
            //
            // We could have also picked a random path
            // that we'd expect to be 404, but `/webxdc.js` is just consistent.
            if let Err(err) = window_clone.navigate(new_url.clone()) {
                log::error!(
                    "failed to navigate webxdc window to {new_url} prior to close. Closing will not be delayed. The app may not be able to save state with `webxdc.sendUpdate()`: {err}"
                );
                // Let's just return and not proceed with `api.prevent_close()`.
                return;
            };

            // Hide the window right away so as to not annoy the user
            // with the perceived slowness.
            window_clone
                .hide()
                .context("failed to hide webxdc window prior to delayed close")
                .inspect_err(|err| log::warn!("{err}"))
                .ok();

            api.prevent_close();

            let window_clone = Arc::clone(&window_clone);
            tauri::async_runtime::spawn(async move {
                // TODO is just waiting 300ms always enough though?
                // What if the `sendUpdate()` payload is reeeally heavy?
                // Would it still have time to get delivered to the backend?
                tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
                log::debug!("closing webxdc window: delay elapsed, will close for real now");
                window_clone
                    .close()
                    .context("failed to close webxdc window after delay")
                    .inspect_err(|err| log::error!("{err}"))
                    .ok();
                // FYI there is also `window.destroy()`.
            });
        }
    });

    // window.set_icon(icon) - IDEA
    #[cfg(desktop)]
    window.set_title(&make_title(&webxdc_info, &chat_name))?;

    // content protection
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if get_content_protection(&app) {
            window.set_content_protected(true)?;
        }
    }

    let icon = {
        let webxdc_info = webxdc_message
            .get_webxdc_info(&account)
            .await
            .map_err(Error::DeltaChat)?;
        let blob: Vec<u8> = webxdc_message
            .get_webxdc_blob(&account, &webxdc_info.icon)
            .await
            .map_err(Error::DeltaChat)?;

        // IDEA also support jpg, at the moment only png is supported
        let image = Image::from_bytes(&blob);
        if let Err(err) = &image {
            error!("failed to read webxdc icon as png image: {err}")
        }
        image.ok()
    };

    #[cfg(desktop)]
    {
        let window_clone = Arc::clone(&window);
        menu_manager
            .register_window(
                &app,
                &*window,
                Box::new(move |app| create_webxdc_window_menu(app, &window_clone, icon.clone())),
            )
            .await
            .map_err(|err| Error::MenuCreation(err.to_string()))?;
    }

    Ok(())
}

fn make_title(webxdc_info: &WebxdcInfo, chat_name: &str) -> String {
    let document = if !webxdc_info.document.is_empty() {
        format!("{} - ", truncate_text(&webxdc_info.document, 32))
    } else {
        "".to_string()
    };
    let webxdc_name = truncate_text(&webxdc_info.name, 42);
    format!("{document}{webxdc_name} – {chat_name}")
}

#[cfg(target_os = "windows")]
fn get_chromium_hardening_browser_args(dummy_proxy_url: &Url) -> String {
    // Hardening: (partially?) disable WebRTC, prohibit all DNS queries,
    // and practically almost (or completely?) disable internet access.
    // See https://delta.chat/en/2023-05-22-webxdc-security.
    //
    // We also have something like this in the Electron version, see
    // https://github.com/deltachat/deltachat-desktop/pull/3179

    // These are default parameters from
    // https://github.com/tauri-apps/wry/blob/dev/src/webview2/mod.rs#L284-L287
    // TODO refactior: probably need to DRY this, make a Tauri MR.
    let default_tauri_browser_args = "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --enable-features=RemoveRedirectionBitmap";

    // The `~NOTFOUND` string is here:
    // https://chromium.googlesource.com/chromium/src/+/6459548ee396bbe1104978b01e19fcb1bb68d0e5/net/dns/mapped_host_resolver.cc#46
    let host_rules = "MAP * ~NOTFOUND";

    // `host-resolver-rules` and `host-rules` primarily block
    // DNS prefetching. But they also block `fetch()` requests.
    //
    // Chromium docs that touch on `--host-resolver-rules` and DNS:
    // https://www.chromium.org/developers/design-documents/network-stack/socks-proxy/
    // https://www.chromium.org/developers/design-documents/dns-prefetching/
    //
    // Specifying `--proxy-url` should make WebRTC try to use this proxy,
    // since IP handling policy is `disable_non_proxied_udp`.
    // However, since the proxy won't work, this should, in theory,
    // effectively disable WebRTC.
    //
    // Thanks to the fact that we specify `host-rules`,
    // no connection attempt to the proxy should occur at all,
    // at least as of now.
    // See https://www.chromium.org/developers/design-documents/network-stack/socks-proxy/ :
    // > The "EXCLUDE" clause make an exception for "myproxy",
    // > because otherwise Chrome would be unable to resolve
    // > the address of the SOCKS proxy server itself,
    // > and all requests would necessarily fail
    // > with PROXY_CONNECTION_FAILED.
    //
    // However, let's still use our dummy TCP listener
    // (`dummy_proxy_url`), just in case.
    //
    // Docs on command line args:
    // - https://peter.sh/experiments/chromium-command-line-switches/
    // - https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/webview-features-flags#available-webview2-browser-flags
    [
        default_tauri_browser_args,
        &format!("--host-resolver-rules=\"{host_rules}\""),
        &format!("--host-rules=\"{host_rules}\""),
        "--webrtc-ip-handling-policy=disable_non_proxied_udp",
        "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
        &format!("--proxy-server=\"{dummy_proxy_url}\""),
    ]
    .join(" ")
}
