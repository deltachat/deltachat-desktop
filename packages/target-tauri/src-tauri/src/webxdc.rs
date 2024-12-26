use anyhow::Context;
use deltachat::accounts::Accounts;
use log::{error, info, trace};
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};

use crate::AppState;

#[tauri::command]
pub(crate) fn on_webxdc_message_changed(account_id: u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_message_changed handler {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_message_deleted(account_id: u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_message_deleted event handler: {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_status_update(account_id: u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_status_update handler {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_realtime_data(account_id: u32, instance_id: u32, payload: Vec<u8>) {
    info!("TODO: handle on_webxdc_status_update handler {account_id} {instance_id} {payload:?}")
}

#[tauri::command]
pub(crate) fn delete_webxdc_account_data(account_id: u32) {
    info!("TODO: handle delete_webxdc_account_data handler {account_id}")
}

#[tauri::command]
pub(crate) fn close_all_webxdc_instances() {
    info!("TODO: handle close_all_webxdc_instances handler")
}

pub(crate) fn webxdc_icon_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("webxdc-icon {}", request.uri());

    let app_state_deltachat = { ctx.app_handle().state::<AppState>().deltachat.clone() };

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let result: anyhow::Result<()> = async {
            // parse url (account & instance id)
            if let (Some(account_id), Some(instance_id)) =
                (request.uri().host(), request.uri().path().split('/').nth(1))
            {
                // trace!("webxdc-icon {account_id} {instance_id}");
                // get delta chat
                let dc = app_state_deltachat.read().await;

                match get_webxdc_icon(&dc, account_id, instance_id).await {
                    Ok(blob) => {
                        responder.respond(
                            http::Response::builder()
                                .status(http::StatusCode::OK)
                                .body(blob)?,
                        );
                    }
                    Err(err) => {
                        error!("webxdc-icon loading error: {err:#}");
                        responder.respond(
                            http::Response::builder()
                                .status(http::StatusCode::INTERNAL_SERVER_ERROR)
                                .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                                .body(
                                    "failed to load, look inside logfile for more info"
                                        .as_bytes()
                                        .to_vec(),
                                )?,
                        );
                    }
                }
            } else {
                responder.respond(
                    http::Response::builder()
                        .status(http::StatusCode::BAD_REQUEST)
                        .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                        .body("failed to parse requested url".as_bytes().to_vec())?,
                );
            }
            Ok(())
        }
        .await;
        if let Err(err) = result {
            error!("Failed to build reply for webxdc-icon protocol: {err:#}")
        }
    });
}

pub(crate) async fn get_webxdc_icon(
    dc: &Accounts,
    account_id: &str,
    instance_id: &str,
) -> anyhow::Result<Vec<u8>> {
    let account = dc
        .get_account(account_id.parse::<u32>()?)
        .context("account not found")?;
    let message = deltachat::message::Message::load_from_db(
        &account,
        deltachat::message::MsgId::new(instance_id.parse::<u32>()?),
    )
    .await?;
    let webxdc_info = message.get_webxdc_info(&account).await?;
    let icon_blob = message.get_webxdc_blob(&account, &webxdc_info.icon).await?;
    Ok(icon_blob)
}
