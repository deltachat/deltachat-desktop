use std::str::FromStr;

use serde::{Deserialize, Serialize};
use tauri::{Runtime, Url};
use tauri_plugin_notification::{Attachment, NotificationExt};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("not called from main window")]
    NotMainWindow,
    #[error("url parse error: {0}")]
    Parse(String),
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Serialize, Deserialize, Clone, Copy)]
struct NotificationClickedEventPayload {
    chat_id: u32,
    message_id: u32,
    account_id: u32,
}

#[tauri::command]
pub(crate) async fn show_notification<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    title: &str,
    body: &str,
    icon: Option<&str>,
    chat_id: u32,
    message_id: u32,
    account_id: u32,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    let mut notification_builder = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .group(format!("{account_id}-{chat_id}"))
        // IDEA: should we use .auto_cancel() ?
        // - not for now because we want to know that the clear callbacks work, but maybe later
        .extra(
            "data",
            NotificationClickedEventPayload {
                chat_id,
                message_id,
                account_id,
            },
        );

    if let Some(icon) = icon {
        // file could be
        // - data uri - webxdc icon
        // - absolute path to file in blobdir - chat avatar, image in message
        let url = if icon.starts_with("data:") {
            Url::from_str(icon).map_err(|err| Error::Parse(format!("{err:?}")))?
        } else {
            Url::from_file_path(icon).map_err(|err| Error::Parse(format!("{err:?}")))?
        };
        notification_builder = notification_builder.attachment(Attachment::new(
            format!("attachment:{account_id}-{chat_id}-{message_id}"),
            url,
        ))
    }

    notification_builder.show();

    // let _ = app.emit(
    //     "notification_clicked",
    //     NotificationClickedEventPayload,
    // );

    Ok(())
}

#[tauri::command]
pub(crate) async fn clear_notifications<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    chat_id: u32,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    // there seems to be no api for this in https://docs.rs/tauri-plugin-notification/latest/tauri_plugin_notification/struct.NotificationBuilder.html
    todo!();

    Ok(())
}

#[tauri::command]
pub(crate) async fn clear_all_notifications<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    // there seems to be no api for this in https://docs.rs/tauri-plugin-notification/latest/tauri_plugin_notification/struct.NotificationBuilder.html
    todo!();

    Ok(())
}
