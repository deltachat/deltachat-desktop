use anyhow::Context;
use log::error;
use percent_encoding::percent_decode_str;
use tauri::{Manager, UriSchemeContext, UriSchemeResponder};
use tokio::fs;

use crate::state::deltachat::DeltaChatAppState;

pub(crate) fn delta_stickers_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("dcsticker {}", request.uri());

    // URI format is
    // - Mac, linux, iOS: dcsticker://<account folder name>/<sticker pack>/<sticker filename>
    // - windows, android: http://dcsticker.localhost/<account folder name>/<sticker pack>/<sticker filename>

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
            // parse url (account folder name, sticker pack folder and sticker filename)
            let parsed = {
                let mut splited = request.uri().path().split('/');
                #[cfg(not(any(target_os = "windows", target_os = "android")))]
                {
                    (request.uri().host(), splited.nth(1), splited.next())
                }
                #[cfg(any(target_os = "windows", target_os = "android"))]
                {
                    (splited.nth(1), splited.next(), splited.next())
                }
            };

            if let (Some(account_folder), Some(pack_folder), Some(file_name)) = parsed {
                // trace!("dcsticker {account_folder} {pack_folder} {file_name}");

                if matches!(pack_folder, ".." | "." | "") {
                    anyhow::bail!("path escape attempt detected")
                }

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

                let decoded_packname = percent_decode_str(pack_folder).decode_utf8()?.into_owned();
                let decoded_filename = percent_decode_str(file_name).decode_utf8()?.into_owned();
                let file_path = account
                    .get_blobdir()
                    .join("../stickers")
                    .join(decoded_packname)
                    .join(decoded_filename);
                // trace!("file_path: {file_path:?}");

                match fs::read(&file_path).await {
                    Ok(blob) => {
                        responder.respond(
                            http::Response::builder()
                                .status(http::StatusCode::OK)
                                .body(blob)?,
                        );
                    }
                    Err(err) => {
                        error!("dcsticker loading error: {err:#} {file_path:?}");
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
            error!("Failed to build reply for dcsticker protocol: {err:#}")
        }
    });
}
