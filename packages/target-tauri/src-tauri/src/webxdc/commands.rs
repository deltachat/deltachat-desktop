/*!
Commands that webxdc apps can use.
*/

use deltachat::{
    peer_channels::{leave_webxdc_realtime, send_webxdc_realtime_advertisement},
    webxdc::{StatusUpdateItem, StatusUpdateSerial},
};
use log::info;

use serde::Serialize;
use tauri::{ipc::Channel, Manager, State, WebviewWindow};

use crate::{
    state::{
        main_window_channels::SendToChatOptions,
        webxdc_instances::{WebxdcInstance, WebxdcInstancesState},
    },
    DeltaChatAppState, MainWindowChannels,
};

use super::error::Error;

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
        .set_channel(&window, channel)
        .await
        .map_err(|_| Error::WebxdcInstanceNotFoundByLabel(window.label().to_owned()))?;
    Ok(())
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
    } = get_this_webxdc_instance(&webxdc_instances, &window).await?;
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
    } = get_this_webxdc_instance(&webxdc_instances, &window).await?;
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
    } = get_this_webxdc_instance(&webxdc_instances, &window).await?;
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
    } = get_this_webxdc_instance(&webxdc_instances, &window).await?;
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
    } = get_this_webxdc_instance(&webxdc_instances, &window).await?;
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
pub(crate) async fn webxdc_send_to_chat(
    window: WebviewWindow,
    webxdc_instances: State<'_, WebxdcInstancesState>,
    main_window_channels: State<'_, MainWindowChannels>,
    options: SendToChatOptions,
) -> Result<(), Error> {
    let WebxdcInstance { account_id, .. } =
        get_this_webxdc_instance(&webxdc_instances, &window).await?;

    main_window_channels
        .send_to_chat(window.app_handle(), options, Some(account_id))
        .await
        .map_err(Error::Anyhow)?;
    Ok(())
}

/// Returns the [`WebxdcInstance`] that corresponds to the window.
async fn get_this_webxdc_instance(
    webxdc_instances: &State<'_, WebxdcInstancesState>,
    window: &WebviewWindow,
) -> Result<WebxdcInstance, Error> {
    webxdc_instances
        .get(window)
        .await
        .ok_or(Error::WebxdcInstanceNotFoundByLabel(
            window.label().to_owned(),
        ))
}
