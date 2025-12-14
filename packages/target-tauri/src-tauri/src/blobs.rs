use std::path::Path;

use anyhow::Context;
use log::error;
use percent_encoding::percent_decode_str;
use tauri::{utils::mime_type::MimeType, Manager, UriSchemeContext, UriSchemeResponder};
use tokio::fs;

use crate::state::deltachat::DeltaChatAppState;

pub(crate) fn delta_blobs_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("dcblob {}", request.uri());

    // URI format is
    //
    // on MacOS, iOS and Linux:
    // dcblob://<account folder name>/<blob filename>
    //
    // on Windows and Android:
    // http://dcblob.localhost/<account folder name>/<blob filename>

    let app_state_deltachat = {
        ctx.app_handle()
            .state::<DeltaChatAppState>()
            .deltachat
            .clone()
    };

    if ctx.webview_label() != "main" {
        error!(
            "prevented other window from accessing dcblob:// scheme (webview label: {})",
            ctx.webview_label()
        );
        return;
    }

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let result: anyhow::Result<()> = async {
            // parse url (account folder name & blob filename)

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

            let (Some(account_folder), Some(file_name)) = parsed else {
                responder.respond(
                    http::Response::builder()
                        .status(http::StatusCode::BAD_REQUEST)
                        .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                        .body("failed to parse requested url".as_bytes().to_vec())?,
                );
                return Ok(());
            };

            // trace!("dcblob {account_folder} {file_name}");

            let file_name = percent_decode_str(file_name).decode_utf8()?;
            // Sanitize file name: prevent path traversal and absolute paths.
            let file_name = Path::new(file_name.as_ref())
                .file_name()
                .context(format!("invalid file name {file_name}"))?;

            // get delta chat
            let dc = app_state_deltachat.read().await;

            let account = dc
                .get_all()
                .into_iter()
                .find_map(|id| {
                    dc.get_account(id).filter(|account| {
                        account
                            .get_blobdir()
                            .parent()
                            .map(|p| p.ends_with(account_folder))
                            .unwrap_or(false)
                    })
                })
                .context("account not found")?;

            let file_path = account.get_blobdir().join(file_name);

            // trace!("file_path: {file_path:?}");

            assert_eq!(
                file_path.components().next_back().unwrap().as_os_str(),
                file_name
            );
            assert!(file_path
                .components()
                .any(|c| c.as_os_str() == std::ffi::OsStr::new(account_folder)));
            match fs::read(&file_path).await {
                Ok(blob) => {
                    let res = http::Response::builder()
                        .status(http::StatusCode::OK)
                        // Otherwise e.g. SVG images don't get displayed
                        // in the composer draft.
                        .header(
                            http::header::CONTENT_TYPE,
                            MimeType::parse_with_fallback(
                                &blob,
                                file_name.to_str().context(format!(
                                    "failed to convert blob file name {file_name:?} to str"
                                ))?,
                                MimeType::OctetStream,
                            ),
                        )
                        .header(http::header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .body(blob)?;
                    responder.respond(res);
                }
                Err(err) => {
                    error!("dcblob loading error: {err:#} {file_path:?}");
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
            error!("Failed to build reply for dcblob protocol: {err:#}")
        }
    });
}
