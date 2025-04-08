use std::{env::current_dir, path::PathBuf, str::FromStr};

use anyhow::bail;
use base64::Engine;
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

pub async fn handle_deep_link(
    app: &AppHandle,
    alternative_cwd: Option<PathBuf>,
    deeplink_or_xdc: String,
) -> Result<(), anyhow::Error> {
    log::info!("handle_deep_link: {deeplink_or_xdc}");
    let main_window_channel = app.state::<MainWindowChannels>();

    let potential_scheme = deeplink_or_xdc
        .to_lowercase()
        .split(":")
        .next()
        .map(|s| s.to_owned());

    if let Some(potential_scheme) = potential_scheme {
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

        log::error!("handle_deep_link: scheme {potential_scheme}: is unknown")
    }

    if deeplink_or_xdc.ends_with(".xdc") {
        let mut path = PathBuf::from_str(&deeplink_or_xdc)?;
        if !path.is_absolute() {
            path = alternative_cwd
                .unwrap_or(current_dir()?)
                .join(&deeplink_or_xdc);
        }

        if !path.exists() {
            bail!("path does not exist");
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

    Ok(())
}

#[cfg(desktop)]
#[derive(Debug, Clone)]
pub(crate) struct DeepLinkInvocation {
    pub content: String,
    pub cwd: Option<PathBuf>,
}
