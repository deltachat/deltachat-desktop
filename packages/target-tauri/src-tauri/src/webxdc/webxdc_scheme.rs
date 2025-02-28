use anyhow::anyhow;
use log::{debug, error, trace};
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
                // TODO: match against webxdc.js to inject it
            }

            Ok(match message.get_webxdc_blob(&account, path).await {
                Ok(blob) => http::Response::builder()
                    .status(http::StatusCode::OK)
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
