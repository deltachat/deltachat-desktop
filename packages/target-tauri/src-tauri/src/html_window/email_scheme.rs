use anyhow::anyhow;
use log::error;
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};

use crate::HtmlEmailInstancesState;

const CSP_DENY: &str = "default-src 'none';
font-src 'self' data:;
frame-src 'none';
img-src 'self' data:;
media-src 'self' data:;
style-src 'self' data: 'unsafe-inline';
form-action 'none';
script-src 'none';";

const CSP_ALLOW: &str = "
default-src 'none';
font-src 'self' data: http: https:;
frame-src 'none';
img-src 'self' blob: data: https: http:;
media-src 'self' data: http: https:;
style-src 'self' 'unsafe-inline';
form-action 'none';
script-src 'none';
";

pub(crate) fn email_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    _request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("email {}", _request.uri());

    // URI format is email://<anything>
    // (file path doesn't matter, because the html content is always returned)

    let webview_label = ctx.webview_label();
    if !webview_label.starts_with("html-window:") || !webview_label.ends_with("-mail") {
        error!(
            "prevented other window from accessing email:// scheme (webview label: {webview_label})"
        );
        return;
    }

    let webview_label = ctx.webview_label().to_owned().replace("-mail", "");
    let app_handle = ctx.app_handle().clone();

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let response_result: anyhow::Result<_> = async {
            let html_email_instances = app_handle.state::<HtmlEmailInstancesState>();
            // get html email instance
            let instance = html_email_instances
                .get(&webview_label)
                .await
                .ok_or(anyhow!("html instance not found"))?;

            let response = http::Response::builder()
                .status(http::StatusCode::OK)
                .header(
                    http::header::CONTENT_TYPE,
                    mime::TEXT_HTML_UTF_8.essence_str(),
                )
                .header(
                    http::header::CONTENT_SECURITY_POLICY,
                    {
                        if instance.network_allow_state {
                            CSP_ALLOW
                        } else {
                            CSP_DENY
                        }
                    }
                    .replace("\n", " "),
                )
                .body(instance.html_content.as_bytes().to_owned())?;

            Ok(response)
        }
        .await;
        match response_result {
            Err(err) => {
                error!("Failed to build reply for email protocol: {err:#}");
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
