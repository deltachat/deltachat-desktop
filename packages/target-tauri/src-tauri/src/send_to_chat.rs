use std::str::FromStr;

use anyhow::{anyhow, Context};
use serde::{Deserialize, Serialize};
use tauri::{path::SafePathBuf, AppHandle, Emitter, EventTarget, Manager};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SendToChatFile {
    file_name: String,
    file_content: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SendToChatOptions {
    file: Option<SendToChatFile>,
    text: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct SendToChatCall {
    options: SendToChatOptions,
    account: Option<u32>,
}

// used by webxdc send to chat and will be used also by open webxdc file with deltachat
pub(crate) async fn send_to_chat(
    app: &AppHandle,
    options: SendToChatOptions,
    account: Option<u32>,
) -> anyhow::Result<()> {
    if let Some(SendToChatFile { file_name, .. }) = &options.file {
        SafePathBuf::from_str(file_name).map_err(|_| anyhow!("invalid file_name '{file_name}'"))?;
    }

    // IDEA: should we use a channel here for additional security?
    // though at time of writing only main window has access to listen for events,
    // so not critically important.
    app.emit_to(
        EventTarget::labeled("main"),
        "event_webxdc_send_to_chat",
        SendToChatCall { options, account },
    )?;
    app.get_window("main")
        .context("could not get main window to focus")?
        .set_focus()?;
    Ok(())
}
