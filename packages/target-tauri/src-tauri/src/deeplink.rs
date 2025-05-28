use std::{env::current_dir, path::PathBuf, str::FromStr};

use anyhow::{bail, Context};
use base64::Engine;
use register_default_handler::register_as_default_handler;
use tauri::{AppHandle, Manager};
use tokio::{fs::File, io::AsyncReadExt};

use crate::{
    state::main_window_channels::{MainWindowEvents, SendToChatFile, SendToChatOptions},
    MainWindowChannels,
};

const BASE64_ENGINE: base64::engine::GeneralPurpose = base64::engine::GeneralPurpose::new(
    &base64::alphabet::STANDARD,
    base64::engine::GeneralPurposeConfig::new()
        .with_decode_padding_mode(base64::engine::DecodePaddingMode::Indifferent),
);

/// `handle_dcnotification_scheme` should be set to `true` only if
/// the app has not been already running when the deep link was activated.
/// This is because the normal "on click" notification handler
/// already works in that case, so we don't need another handler to run.
/// The deep-linking handler is only needed when the app isn't running,
/// in order to launch the app.
/// This is also an additional security measure against websites
/// trying to abuse the `dcnotification:` scheme.
pub async fn handle_deep_link(
    app: &AppHandle,
    alternative_cwd: Option<PathBuf>,
    deeplink_or_xdc: String,
    #[cfg(target_os = "windows")] handle_dcnotification_scheme: bool,
) -> Result<(), anyhow::Error> {
    log::info!("handle_deep_link: {deeplink_or_xdc}");
    let main_window_channel = app.state::<MainWindowChannels>();

    let potential_scheme = deeplink_or_xdc
        .to_lowercase()
        .split(":")
        .next()
        .map(|s| s.to_owned());

    if let Ok(main_window) = app
        .get_window("main")
        .context("main window not found")
        .inspect_err(|err| log::error!("{err}"))
    {
        main_window
            .show()
            .context("failed to show main window")
            .inspect_err(|err| log::error!("{err}"))
            .ok();
        main_window
            .set_focus()
            .context("failed to focus main window")
            .inspect_err(|err| log::error!("{err}"))
            .ok();
    }

    if let Some(potential_scheme) = potential_scheme.as_ref() {
        if matches!(
            potential_scheme.as_str(),
            "openpgp4fpr" | "dcaccount" | "dclogin" | "mailto"
        ) || (potential_scheme == "https"
            && deeplink_or_xdc.starts_with("https://i.delta.chat/"))
        {
            main_window_channel
                .emit_event(MainWindowEvents::DeepLinkOpened(deeplink_or_xdc))
                .await?;

            return Ok(());
        }

        #[cfg(target_os = "windows")]
        if potential_scheme == "dcnotification" {
            if !handle_dcnotification_scheme {
                log::info!(
                    "`dcnotification:` deep link handler invoked while `handle_dcnotification_scheme == false`, ignoring"
                );
                return Ok(());
                // Note, however, that we did focus the window still,
                // so we didn't _completely_ ignore the deep link.
            }

            use user_notify::windows::decode_deeplink;

            let response = decode_deeplink(&deeplink_or_xdc)?;

            // This unfortunately means that the "reply" feature
            // (although it's not implemented yet on Windows)
            // will not work while the app is closed.
            let is_untrusted = true;

            crate::Notifications::handle_response(app, response, is_untrusted).await;

            return Ok(());
        }

        if potential_scheme != "file" {
            log::error!("handle_deep_link: scheme {potential_scheme}: is unknown")
        }
    }

    if deeplink_or_xdc.ends_with(".xdc") {
        let mut path = if potential_scheme == Some("file".to_owned()) {
            let path = deeplink_or_xdc
                .strip_prefix("file://")
                .context("failed to remove file scheme prefix from {deeplink_or_xdc}")?;
            PathBuf::from_str(path)?
        } else {
            PathBuf::from_str(&deeplink_or_xdc)?
        };
        if !path.is_absolute() {
            path = alternative_cwd
                .unwrap_or(current_dir()?)
                .join(&deeplink_or_xdc);
        }

        if !path.exists() {
            bail!("path \"{deeplink_or_xdc}\" does not exist");
        }

        let mut file = File::open(&path).await?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).await?;
        let base64_content = BASE64_ENGINE.encode(buffer);

        log::debug!("open webxdc file");
        main_window_channel
            .send_to_chat(
                app,
                SendToChatOptions {
                    file: Some(SendToChatFile {
                        file_name: path
                            .file_name()
                            .map(|os_str| os_str.to_string_lossy().to_string())
                            .unwrap_or("webxdc.xdc".to_owned()),
                        file_content: base64_content,
                    }),
                    text: None,
                },
                None,
            )
            .await?;

        return Ok(());
    }

    Err(anyhow::anyhow!(
        "{deeplink_or_xdc} does not seem to match any supported deeplink format"
    ))
}

#[cfg(desktop)]
#[derive(Debug, Clone)]
pub(crate) struct DeepLinkInvocation {
    pub content: String,
    pub cwd: Option<PathBuf>,
}

pub fn register() {
    register_as_default_handler("openpgp4fpr");
    register_as_default_handler("dcaccount");
    register_as_default_handler("dclogin");
}
