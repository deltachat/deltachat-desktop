use std::{collections::HashMap, path::PathBuf, str::FromStr};

use serde::{Deserialize, Serialize};
use tauri::{path::SafePathBuf, Runtime, State};
use user_notify::NotificationBuilder;

use crate::{
    temp_file::{remove_temp_file, write_temp_file_from_base64},
    Notifications,
};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("not called from main window")]
    NotMainWindow,
    #[error(transparent)]
    Notify(#[from] user_notify::Error),
    #[error("failed to delete tmp file")]
    FailedToDeleteTmpFile,
    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),
    #[error("Infallible error, something went really wrong: {0}")]
    Infallible(#[from] std::convert::Infallible),
    #[error("Value missing in User Info for key {0}")]
    ValueMissing(String),
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[allow(clippy::enum_variant_names)]
#[derive(Serialize, Deserialize, Clone, Copy)]
pub(crate) enum NotificationPayload {
    OpenAccount {
        account_id: u32,
    },
    OpenChat {
        account_id: u32,
        chat_id: u32,
    },
    OpenChatMessage {
        account_id: u32,
        chat_id: u32,
        message_id: u32,
    },
}

pub(crate) const NOTIFICATION_PAYLOAD_KEY: &str = "NotificationPayload";
pub(crate) const NOTIFICATION_REPLY_TO_CATEGORY: &str = "chat.delta.tauri.message.with.reply.to";
pub(crate) const NOTIFICATION_REPLY_TO_ACTION_ID: &str = "chat.delta.tauri.message.reply.action";

#[allow(clippy::too_many_arguments)]
#[tauri::command]
pub(crate) async fn show_notification(
    app: tauri::AppHandle,
    window: tauri::Window,
    notifications: State<'_, Notifications>,
    title: String,
    body: String,
    icon: Option<String>,
    icon_is_avatar: bool,
    account_id: u32,
    message_id: u32,
    chat_id: u32,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    let app_clone = app.clone();

    let mut notification = NotificationBuilder::new();

    let notification_kind = match (message_id, chat_id, account_id) {
        (0, 0, _) => NotificationPayload::OpenAccount { account_id },
        (0, _, _) => NotificationPayload::OpenChat {
            account_id,
            chat_id,
        },
        _ => NotificationPayload::OpenChatMessage {
            account_id,
            chat_id,
            message_id,
        },
    };

    let mut user_info = HashMap::new();
    user_info.insert(
        NOTIFICATION_PAYLOAD_KEY.to_owned(),
        serde_json::to_string(&notification_kind)?,
    );

    notification = notification
        .title(&title)
        .body(&body)
        .set_user_info(user_info)
        .set_thread_id(&format!("{account_id}-{chat_id}"))
        .set_xdg_category(user_notify::XdgNotificationCategory::ImReceived);

    if let NotificationPayload::OpenChatMessage { .. } = notification_kind {
        notification = notification.set_category_id(NOTIFICATION_REPLY_TO_CATEGORY);
    }

    let mut temp_file_to_clean_up = None;

    if let Some(icon) = icon {
        // file could be
        // - data uri - webxdc icon
        // - absolute path to file in blobdir - chat avatar, image in message
        if icon.starts_with("data:") {
            // TODO write to disk
            log::error!("todo webxdc icon: {:?}", icon.get(0..30));

            match icon.strip_prefix("data:image/png;base64,") {
                None => {
                    log::error!("webxdc icon format not supported yet (only supports png at the time): {:?}", icon.get(0..30));
                }
                Some(base_64) => {
                    match write_temp_file_from_base64(app_clone.clone(), "webxdc_icon.png", base_64)
                        .await
                    {
                        Ok(tmp_file) => {
                            // IDEA: on non macos set icon of webxdc instead?
                            if cfg!(target_os = "windows") {
                                notification = notification.set_icon(PathBuf::from_str(&tmp_file)?);
                            } else {
                                notification =
                                    notification.set_image(PathBuf::from_str(&tmp_file)?);
                            }
                            temp_file_to_clean_up.replace(tmp_file);
                        }
                        Err(err) => {
                            log::error!("failed to write webxdc icon to temp file: {err}");
                        }
                    }
                }
            }
        } else if cfg!(target_os = "windows") && icon_is_avatar {
            notification = notification
                .set_icon(PathBuf::from_str(&icon)?)
                .set_icon_round_crop(true);
        } else {
            notification = notification.set_image(PathBuf::from_str(&icon)?);
        };
    }

    let manager = notifications.manager.clone();
    manager.send_notification(notification).await?;

    // here we can delete the tmp file again,
    // atleast on macos (os moves it to datastore) and on linux (transfers image data on dbus)
    if let Some(tmp_file) = temp_file_to_clean_up {
        remove_temp_file(
            app_clone.clone(),
            SafePathBuf::from_str(&tmp_file).map_err(|_| Error::FailedToDeleteTmpFile)?,
        )
        .await
        .map_err(|_| Error::FailedToDeleteTmpFile)?;
    }

    Ok(())
}

#[tauri::command]
pub(crate) async fn clear_notifications<R: Runtime>(
    window: tauri::Window<R>,
    account_id: u32,
    chat_id: u32,
    notifications: State<'_, Notifications>,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    let notifications_to_clear:Vec<String> = notifications
        .manager
        .get_active_notifications()
        .await?
        .iter()
        .filter_map(|handle| {
            let payload = handle
                .get_user_info()
                .get(NOTIFICATION_PAYLOAD_KEY)
                .ok_or(Error::ValueMissing(NOTIFICATION_PAYLOAD_KEY.to_owned()))
                .and_then(|s| {
                    serde_json::from_str::<NotificationPayload>(s).map_err(Error::SerdeJson)
                });
            match payload {
                Ok(payload) => Some((
                    handle.get_id(),
                    payload,
                )),
                Err(err) => {
                    log::warn!("clear_notifications: some notification has a payload that could not be decoded: {err:?}");
                    log::debug!("clear_notifications: unknown payload {:?}", handle
                        .get_user_info());
                    None
                },
            }
        })
        // filter what notifications are affected
        .filter(|(_id, payload)|
            match payload {
                NotificationPayload::OpenAccount { account_id:a } => a == &account_id,
                NotificationPayload::OpenChat { account_id:a, chat_id:c }
                | NotificationPayload::OpenChatMessage { account_id:a, chat_id:c,..} => a == &account_id && c == &chat_id,
            }
        ).map(|(id,_payload)|id).collect();

    notifications.manager.remove_delivered_notifications(
        notifications_to_clear
            .iter()
            .map(|id| id.as_str())
            .collect(),
    )?;

    Ok(())
}

#[tauri::command]
pub(crate) async fn clear_all_notifications<R: Runtime>(
    window: tauri::Window<R>,
    notifications: State<'_, Notifications>,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    if let Err(err) = notifications.manager.remove_all_delivered_notifications() {
        log::error!("remove_all_delivered_notifications failed: {err}");
    }

    Ok(())
}
