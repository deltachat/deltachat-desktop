use std::sync::Arc;

use deltachat_jsonrpc::yerpc;
use std::str::FromStr;
use tauri::{ipc::Channel, State, WebviewWindow};
use tokio::sync::RwLock;

use anyhow::{anyhow, Context};
use serde::{Deserialize, Serialize};
use tauri::{path::SafePathBuf, AppHandle, Manager};

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
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum MainWindowEvents {
    SendToChat {
        options: SendToChatOptions,
        account: Option<u32>,
    },
    LocaleReloaded(String),
    ShowAboutDialog,
    ShowSettingsDialog,
    ShowKeybindingsDialog,
}

pub(crate) struct InnerMainWindowChannelsState {
    pub(crate) events: Channel<MainWindowEvents>,
    pub(crate) jsonrpc: Channel<deltachat_jsonrpc::yerpc::Message>,
}

/// Channels to communicate with the front-end's Runtime class (see `runtime.ts`).
pub(crate) struct MainWindowChannels {
    inner: Arc<RwLock<Option<InnerMainWindowChannelsState>>>,
}

impl MainWindowChannels {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(None)),
        }
    }

    /// Makes this struct's methods direct all data to the specified channels.
    ///
    /// This method is supposed to be called when the front-end `Runtime` class
    /// gets initialized.
    async fn set(
        &self,
        events: Channel<MainWindowEvents>,
        jsonrpc: Channel<deltachat_jsonrpc::yerpc::Message>,
    ) {
        let _ = self
            .inner
            .write()
            .await
            .replace(InnerMainWindowChannelsState { jsonrpc, events });
    }

    // used by webxdc send to chat and will be used also by open webxdc file with deltachat
    pub(crate) async fn send_to_chat(
        &self,
        app: &AppHandle,
        options: SendToChatOptions,
        account: Option<u32>,
    ) -> anyhow::Result<()> {
        if let Some(SendToChatFile { file_name, .. }) = &options.file {
            SafePathBuf::from_str(file_name)
                .map_err(|_| anyhow!("invalid file_name '{file_name}'"))?;
        }
        self.emit_event(MainWindowEvents::SendToChat { options, account })
            .await?;
        app.get_window("main")
            .context("could not get main window to focus")?
            .set_focus()?;
        Ok(())
    }

    pub(crate) async fn emit_event(&self, event: MainWindowEvents) -> anyhow::Result<()> {
        self.inner
            .read()
            .await
            .as_ref()
            .context("main window channel not initialized yet, should not happen, contact devs")?
            .events
            .send(event)?;
        Ok(())
    }

    pub(crate) async fn send_jsonrpc_response(
        &self,
        message: yerpc::Message,
    ) -> anyhow::Result<()> {
        self.inner
            .read()
            .await
            .as_ref()
            .context(
                "main window channel not initialized yet, should not normally happen, contact devs",
            )?
            .jsonrpc
            .send(message)?;
        Ok(())
    }
}

/// Makes the back-end send JSON-RCP responses and some other events
/// to the channels specified in this command's arguments.
#[tauri::command]
pub async fn set_main_window_channels(
    window: WebviewWindow,
    main_window_channels: State<'_, MainWindowChannels>,
    events: Channel<MainWindowEvents>,
    jsonrpc: Channel<deltachat_jsonrpc::yerpc::Message>,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("can only be called from main window".to_owned());
    }

    main_window_channels.set(events, jsonrpc).await;
    Ok(())
}
