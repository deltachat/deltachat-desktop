use std::str;

use anyhow::{anyhow, Context};
use log::{error, trace};
use serde_json::Value;
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};

use crate::{state::webxdc_instances::WebxdcInstance, DeltaChatAppState, WebxdcInstancesState};

pub(crate) fn webxdc_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    trace!(
        "webxdc_protocol: {} {}",
        request.uri(),
        request.uri().path()
    );

    // URI format is
    // mac/linux:         webxdc://dummy.host/<path>
    // windows/android:   webxdc://webxdc.localhost/<path>

    let webview_label = ctx.webview_label().to_owned();
    let app_handle = ctx.app_handle().clone();

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let response_result: anyhow::Result<_> = async {
            // TODO: get open webxdc window handle and message
            let instances = app_handle.state::<WebxdcInstancesState>();
            let WebxdcInstance {
                account_id,
                message,
            } = instances
                .get(&webview_label)
                .await
                .ok_or(anyhow!("webxdc instance not found in open instances"))?;

            let deltachat_state = app_handle.state::<DeltaChatAppState>();
            let deltachat = deltachat_state.deltachat.read().await;
            let account = deltachat
                .get_account(account_id)
                .ok_or(anyhow!("account not found"))?;

            let path = request.uri().path();

            if path == "/webxdc.js" {
                let webxdc_info =  message.get_webxdc_info(&account).await?;
                let bytes =app_handle
                    .asset_resolver()
                    .get("webxdc/webxdc.js".to_owned())
                    .context("webxdc.js not found in assets, this should not happen, please contact developers")?
                    .bytes;
                let webxdc_js = str::from_utf8(&bytes)?;

                let display_name = account
                    .get_config(deltachat::config::Config::Displayname).await?
                    .unwrap_or(webxdc_info.self_addr.clone());
                let webxdc_js = webxdc_js
                    .replace("[SELFADDR]", &serde_json::to_string(
                        &Value::try_from(webxdc_info.self_addr.as_bytes().to_vec())?
                    )?)
                    .replace(
                        "[SELFNAME]",
                        &serde_json::to_string(
                            &Value::try_from(display_name.as_bytes().to_vec())?
                        )?
                    );

                Ok(http::Response::builder()
                    .status(http::StatusCode::OK)
                    .body(webxdc_js.into_bytes())?)
            } else {
                Ok(match message.get_webxdc_blob(&account, path).await {
                    Ok(blob) => http::Response::builder()
                        .status(http::StatusCode::OK)
                        .header(
                            http::header::CONTENT_TYPE,
                            mime_guess::from_path(path)
                                .first()
                                .unwrap_or(mime::APPLICATION_OCTET_STREAM).essence_str()
                        )
                        .body(blob)?,
                    Err(err) => {
                        error!("get_webxdc_blob: {err:#}");
                        http::Response::builder()
                            .status(http::StatusCode::NOT_FOUND)
                            .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                            .body("404 not found".as_bytes().to_vec())?
                    }
                })
            }
        }
        .await;
        match response_result {
            Err(err) => {
                error!("Failed to build reply for webxdc protocol: {err:#}");
                responder.respond(
                    http::Response::builder()
                        .status(http::StatusCode::INTERNAL_SERVER_ERROR)
                        .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                        .body("Error".as_bytes().to_owned())
                        .unwrap(),
                );
            }
            Ok(response) => responder.respond(response),
        }
    });
}
