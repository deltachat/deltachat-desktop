use anyhow::Context;
use deltachat::accounts::Accounts;
use log::error;
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};

use crate::state::deltachat::DeltaChatAppState;

pub(crate) fn webxdc_icon_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("webxdc-icon {}", request.uri());

    if ctx.webview_label() != "main" {
        error!(
            "prevented other window from accessing webxdc-icon:// scheme (webview label: {})",
            ctx.webview_label()
        );
        return;
    }

    let app_state_deltachat = {
        ctx.app_handle()
            .state::<DeltaChatAppState>()
            .deltachat
            .clone()
    };

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let result: anyhow::Result<()> = async {
            let parsed = {
                #[cfg(not(any(target_os = "windows", target_os = "android")))]
                {
                    (request.uri().host(), request.uri().path().split('/').nth(1))
                }
                #[cfg(any(target_os = "windows", target_os = "android"))]
                {
                    let mut splited = request.uri().path().split('/');
                    (splited.nth(1), splited.next())
                }
            };
            // parse url (account & instance id)
            let (Some(account_id), Some(instance_id)) = parsed else {
                responder.respond(
                    http::Response::builder()
                        .status(http::StatusCode::BAD_REQUEST)
                        .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                        .body("failed to parse requested url".as_bytes().to_vec())?,
                );
                return Ok(());
            };

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
            Ok(())
        }
        .await;
        if let Err(err) = result {
            error!("Failed to build reply for webxdc-icon protocol: {err:#}")
        }
    });
}

async fn get_webxdc_icon(
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
