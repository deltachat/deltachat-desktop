use std::{collections::HashMap, str};

use anyhow::{anyhow, Context};
use log::{error, trace};
use serde_json::Value;
use tauri::{
    utils::config::{Csp, CspDirectiveSources},
    Manager, UriSchemeContext, UriSchemeResponder,
};

use crate::{
    state::webxdc_instances::WebxdcInstance,
    util::csp::add_custom_schemes_to_csp_for_window_and_android, DeltaChatAppState,
    WebxdcInstancesState,
};

use once_cell::sync::Lazy;

static CSP: Lazy<String> = Lazy::new(|| {
    let mut m: HashMap<String, _> = HashMap::new();
    m.insert(
        "default-src".to_owned(),
        CspDirectiveSources::List(vec!["'self'".to_owned(), "webxdc:".to_owned()]),
    );
    m.insert(
        "style-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "'unsafe-inline'".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    m.insert(
        "font-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "data:".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    m.insert(
        "script-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "'unsafe-inline'".to_owned(),
            "'unsafe-eval'".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    m.insert(
        "connect-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "ipc:".to_owned(),
            "data:".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    m.insert(
        "img-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "data:".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    m.insert(
        "media-src".to_string(),
        CspDirectiveSources::List(vec![
            "'self'".to_owned(),
            "data:".to_owned(),
            "blob:".to_owned(),
        ]),
    );
    // CSP “WEBRTC: block” directive is specified, but not yet implemented by browsers
    // - see https://delta.chat/en/2023-05-22-webxdc-security#browsers-please-implement-the-w3c-webrtc-block-directive
    m.insert(
        "webrtc".to_string(),
        CspDirectiveSources::List(vec!["'block'".to_owned()]),
    );

    let csp = Csp::DirectiveMap(m);
    add_custom_schemes_to_csp_for_window_and_android(csp, false).to_string()
});

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
        // Make sure to set the headers on _all_ responses, because
        // they are important for security, namely `Content-Security-Policy`.
        // Failing to set CSP might result in the app being able to create
        // an <iframe> with no CSP, e.g. `<iframe src="/no_such_file.lol">`
        // within which they can then do whatever
        // through the parent frame, see
        // "XDC-01-002 WP1: Full CSP bypass via desktop app webxdc.js"
        // https://public.opentech.fund/documents/XDC-01-report_2_1.pdf
        let make_response_builder = || {
            http::Response::builder()
                .header(http::header::CONTENT_SECURITY_POLICY, CSP.as_str())
                // Ensure that the browser doesn't try to interpret the file
                // as a PDF file. See below about PDF, `CONTENT_TYPE`.
                .header(http::header::X_CONTENT_TYPE_OPTIONS, "nosniff")
        };

        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let response_result: anyhow::Result<_> = async {
            let response_builder = make_response_builder();

            // TODO: get open webxdc window handle and message
            let instances = app_handle.state::<WebxdcInstancesState>();
            let WebxdcInstance {
                account_id,
                message,
                ..
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
                        &Value::from(webxdc_info.self_addr.as_bytes().to_vec())
                    )?)
                    .replace(
                        "[SELFNAME]",
                        &serde_json::to_string(
                            &Value::from(display_name.as_bytes().to_vec())
                        )?
                    )
                    .replace(
                        "SEND_UPDATE_INTERVAL",
                        &webxdc_info.send_update_interval.to_string()
                    )
                    .replace(
                        "SEND_UPDATE_MAX_SIZE",
                        &webxdc_info.send_update_max_size.to_string()
                    );

                Ok(response_builder
                    .status(http::StatusCode::OK)
                    .header(http::header::CONTENT_TYPE, mime::TEXT_JAVASCRIPT.essence_str())
                    .body(webxdc_js.into_bytes())?)
            } else {
                Ok(match message.get_webxdc_blob(&account, path).await {
                    Ok(blob) => response_builder
                        .status(http::StatusCode::OK)
                        .header(
                            http::header::CONTENT_TYPE,
                            mime_guess::from_path(path)
                                .first()
                                // Make sure that the browser doesn't open files in the PDF viewer.
                                // The PDF viewer allows the app to bypass CSP,
                                // at least on Chromium.
                                // See https://delta.chat/en/2023-05-22-webxdc-security,
                                // "XDC-01-005 WP1: Full CSP bypass via desktop app PDF embed".
                                //
                                // This way if a PDF file gets opened in an iframe,
                                // it will go to "Downloads" instead.
                                .map(|original| if original == mime::APPLICATION_PDF {
                                    mime::APPLICATION_OCTET_STREAM
                                } else {
                                    original
                                })
                                .unwrap_or(mime::APPLICATION_OCTET_STREAM).essence_str()
                        )
                        .body(blob)?,
                    Err(err) => {
                        error!("get_webxdc_blob: {err:#}");
                        response_builder
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
                    make_response_builder()
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
