use std::{path::PathBuf, str::FromStr};

use serde::{Deserialize, Serialize};
use tauri::{async_runtime::block_on, path::SafePathBuf, Runtime, State};
use user_notify::{NotificationBuilder, NotificationManager};

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
    #[error("url parse error: {0}")]
    Parse(String),
    #[error(transparent)]
    Notify(#[from] user_notify::Error),
    #[error("failed to delete tmp file")]
    FailedToDeleteTmpFile,
    #[error("Infallible error, something went really wrong: {0}")]
    Infallible(#[from] std::convert::Infallible),
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
pub(crate) async fn show_notification(
    app: tauri::AppHandle,
    window: tauri::Window,
    title: String,
    body: String,
    icon: Option<String>,
    chat_id: u32,
    message_id: u32,
    account_id: u32,
    notifications: State<'_, Notifications>,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    // .extra(
    //     "data",
    //     NotificationClickedEventPayload {
    //         chat_id,
    //         message_id,
    //         account_id,
    //     },
    // );

    let app_clone = app.clone();
    // MacOS needs this to be run on main thread

    let mut notification_builder = {
        #[cfg(target_os = "macos")]
        {
            user_notify::mac_os::NotificationBuilderMacOS::new()
        }
        #[cfg(target_os = "windows")]
        {
            todo!();
        }
        #[cfg(any(
            target_os = "linux",
            target_os = "dragonfly",
            target_os = "freebsd",
            target_os = "openbsd",
            target_os = "netbsd"
        ))]
        {
            todo!();
            // user_notify::xdg::NotificationBuilderXdg::new()
            //     .category_hint(user_notify::xdg::NotificationCategory::ImReceived)
            //     .appname("Delta Chat")
        }
    };

    notification_builder = notification_builder
        .title(&title)
        .body(&body)
        .set_thread_id(&format!("{account_id}-{chat_id}"));

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
                            notification_builder =
                                notification_builder.set_image(PathBuf::from_str(&tmp_file)?)?;
                            temp_file_to_clean_up.replace(tmp_file);
                        }
                        Err(err) => {
                            log::error!("failed to write webxdc icon to temp file: {err}");
                        }
                    }
                }
            }
        } else {
            notification_builder = notification_builder.set_image(PathBuf::from_str(&icon)?)?;
        };
    }

    let manager = notifications.manager.clone();
    let notification = notification_builder.show(manager).await?;

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

    // todo!();

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
