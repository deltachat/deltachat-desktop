use anyhow::Context;
use log::{error, info, trace};
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};
use tokio::fs;

use crate::AppState;

pub(crate) fn delta_blobs_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    let path = request.uri();
    info!("dcblob {path}");

    // URI format is dcblob://<account folder name>/<blob filename>

    let app_state_deltachat = { ctx.app_handle().state::<AppState>().deltachat.clone() };

    tauri::async_runtime::spawn(async move {
        // workaround for not yet available try_blocks feature
        // https://doc.rust-lang.org/beta/unstable-book/language-features/try-blocks.html
        let result: anyhow::Result<()> = async {
            // parse url (account folder name & blob filename)
            if let (Some(account_folder), Some(file_name)) =
                (request.uri().host(), request.uri().path().split('/').nth(1))
            {
                trace!("dcblob {account_folder} {file_name}");
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
                                .is_some()
                        })
                    })
                    .context("account not found")?;

                // TODO:
                // - [ ] check for ".."
                // - [ ] test if decode uri of filename will be nessesary

                match fs::read(account.get_blobdir().join(file_name)).await {
                    Ok(blob) => {
                        responder.respond(
                            http::Response::builder()
                                .status(http::StatusCode::OK)
                                .body(blob)?,
                        );
                    }
                    Err(err) => {
                        error!("dcblob loading error: {err:#}");
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
            error!("Failed to build reply for dcblob protocol: {err:#}")
        }
    });
}
