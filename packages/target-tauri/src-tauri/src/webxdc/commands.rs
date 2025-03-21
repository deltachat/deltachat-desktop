use std::{str::FromStr, sync::Arc};

use anyhow::{anyhow, Context};
use deltachat::{
    chat::Chat,
    message::{Message, MsgId},
    peer_channels::{leave_webxdc_realtime, send_webxdc_realtime_advertisement},
    webxdc::{StatusUpdateItem, StatusUpdateSerial, WebxdcInfo},
};
use log::{error, info, trace, warn};

use serde::{Deserialize, Serialize};
use tauri::{
    async_runtime::block_on, image::Image, ipc::Channel, path::SafePathBuf, AppHandle, Emitter,
    EventTarget, Manager, State, Url, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent,
};

use crate::{
    menus::webxdc_menu::create_webxdc_window_menu,
    send_to_chat::{send_to_chat, SendToChatOptions},
    settings::get_content_protection,
    state::{
        menu_manager::MenuManager,
        webxdc_instances::{WebxdcInstance, WebxdcInstancesState},
    },
    util::truncate_text,
    webxdc::data_storage::{
        delete_webxdc_data_for_account, delete_webxdc_data_for_instance, set_data_store,
    },
    DeltaChatAppState,
};

use super::error::Error;

const INIT_SCRIPT: &str = r#"
console.log("hello from INIT_SCRIPT")
// this is only run once, not in every iframe, we need an api that is run in every iframe
// so documentation for this is wrong
// atleast on macOS

// attempt to remove peer connection on macOS
try {
window.RTCPeerConnection = ()=>{};
RTCPeerConnection = ()=>{};
} catch (e){console.error("failed to overwrite RTCPeerConnection apis",e)}
try {
    window.webkitRTCPeerConnection = ()=>{};
    webkitRTCPeerConnection = ()=>{};
} catch (e){}
"#;

#[tauri::command]
pub(crate) async fn on_webxdc_message_changed<'a>(
    app: AppHandle,
    deltachat_state: State<'a, DeltaChatAppState>,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((window_label, instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
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
        }
    }

    Ok(())
}

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
        if let Some(window) = app.get_window(&window_label) {
            window.destroy()?;
        }
    }
    delete_webxdc_data_for_account(&app, account_id).await
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum WebxdcUpdate {
    Status,
    RealtimePacket(Vec<u8>),
}

#[tauri::command]
pub(crate) async fn register_webxdc_channel(
    window: WebviewWindow,
    webxdc_instances: State<'_, WebxdcInstancesState>,
    channel: Channel<WebxdcUpdate>,
) -> Result<(), Error> {
    // set it
    webxdc_instances
        .set_channel(window.label(), channel)
        .await
        .map_err(|_| Error::WebxdcInstanceNotFoundByLabel(window.label().to_owned()))?;
    Ok(())
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
    url.set_query(url_with_href.fragment());
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
    let window_id = format!("webxdc:{account_id}:{message_id}");
    trace!("open webxdc '{window_id}': href: {href}");

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if let Some(window) = app.get_window(&window_id) {
            // window already exists focus it - android and iOS don't have have the function
            // and those platforms also don't have multiple windows
            window.show()?;

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
        .add(
            &window_id,
            WebxdcInstance {
                account_id,
                message: webxdc_message.clone(),
                channel: None,
            },
        )
        .await;

    // Contruct window
    let url = if href.is_empty() {
        webxdc_base_url()?
    } else {
        href_to_webxdc_url(href)?
    };

    let mut window_builder = WebviewWindowBuilder::new(&app, &window_id, WebviewUrl::External(url))
        .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
        .initialization_script(INIT_SCRIPT)
        .on_navigation(move |url| url.scheme() == "webxdc");

    window_builder = set_data_store(&app, window_builder, account_id, message_id).await?;

    let window = window_builder.build()?;

    let window_arc = Arc::new(window.clone());

    let messge_id_to_leave = webxdc_message.get_id();
    window.on_window_event(move |event| {
        if let WindowEvent::Destroyed = event {
            //TODO test if this fires when account is deleted
            warn!("webxdc window destroyed {account_id} {message_id}");

            // remove from "running instances"-state
            let webxdc_instances = window_arc.state::<WebxdcInstancesState>();
            block_on(webxdc_instances.remove(&window_id));

            // leave realtime channel
            // IDEA: track in WebxdcInstancesState whether webxdc joined and only call this method if it did
            let dc = window_arc.state::<DeltaChatAppState>();
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
    });

    // window.set_icon(icon) - IDEA

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

    let window_clone = window.clone();
    menu_manager
        .register_window(
            &app,
            &window,
            Box::new(move |app| create_webxdc_window_menu(app, &window_clone, icon.clone())),
        )
        .await
        .map_err(|err| Error::MenuCreation(err.to_string()))?;

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

#[tauri::command]
pub(crate) async fn send_webxdc_update<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    dc: State<'a, DeltaChatAppState>,
    status_update: StatusUpdateItem,
) -> Result<(), Error> {
    let WebxdcInstance {
        account_id,
        message,
        ..
    } = webxdc_instances
        .get(window.label())
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))?;
    let dc = dc.deltachat.read().await;
    let account = dc
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;

    account
        .send_webxdc_status_update_struct(message.get_id(), status_update)
        .await
        .map_err(Error::DeltaChat)?;

    Ok(())
}

#[tauri::command]
pub(crate) async fn get_webxdc_updates<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    dc: State<'a, DeltaChatAppState>,
    last_known_serial: u32,
) -> Result<String, Error> {
    let WebxdcInstance {
        account_id,
        message,
        ..
    } = webxdc_instances
        .get(window.label())
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))?;
    let dc = dc.deltachat.read().await;
    let account = dc
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;

    account
        .get_webxdc_status_updates(message.get_id(), StatusUpdateSerial::new(last_known_serial))
        .await
        .map_err(Error::DeltaChat)
}

#[tauri::command]
pub(crate) async fn join_webxdc_realtime_channel<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    dc: State<'a, DeltaChatAppState>,
) -> Result<(), Error> {
    let WebxdcInstance {
        account_id,
        message,
        ..
    } = webxdc_instances
        .get(window.label())
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))?;
    let dc = dc.deltachat.read().await;
    let account = dc
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;

    let fut = send_webxdc_realtime_advertisement(&account, message.get_id())
        .await
        .map_err(Error::DeltaChat)?;
    if let Some(fut) = fut {
        tokio::spawn(async move {
            fut.await.ok();
            info!("send_webxdc_realtime_advertisement done")
        });
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn leave_webxdc_realtime_channel<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    dc: State<'a, DeltaChatAppState>,
) -> Result<(), Error> {
    let WebxdcInstance {
        account_id,
        message,
        ..
    } = webxdc_instances
        .get(window.label())
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))?;
    let dc = dc.deltachat.read().await;
    let account = dc
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;

    leave_webxdc_realtime(&account, message.get_id())
        .await
        .map_err(Error::DeltaChat)?;
    Ok(())
}

#[tauri::command]
pub(crate) async fn send_webxdc_realtime_data<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    dc: State<'a, DeltaChatAppState>,
    data: Vec<u8>,
) -> Result<(), Error> {
    let WebxdcInstance {
        account_id,
        message,
        ..
    } = webxdc_instances
        .get(window.label())
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))?;
    let dc = dc.deltachat.read().await;
    let account = dc
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;

    deltachat::peer_channels::send_webxdc_realtime_data(&account, message.get_id(), data)
        .await
        .map_err(Error::DeltaChat)?;

    Ok(())
}

#[tauri::command]
pub(crate) async fn webxdc_send_to_chat<'a>(
    window: WebviewWindow,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    options: SendToChatOptions,
) -> Result<(), Error> {
    let WebxdcInstance { account_id, .. } =
        webxdc_instances
            .get(window.label())
            .await
            .ok_or(Error::WebxdcInstanceNotFoundByLabel(
                window.label().to_owned(),
            ))?;

    send_to_chat(window.app_handle(), options, Some(account_id))
        .await
        .map_err(Error::Anyhow)?;
    Ok(())
}
