use serde::{Deserialize, Serialize};
use tauri::{async_runtime::block_on, Runtime};
use user_notify::NotificationBuilder;

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
    title: String,
    body: String,
    icon: Option<String>,
    chat_id: u32,
    message_id: u32,
    account_id: u32,
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

    // // TODO images -> need to all be temporarely written to disk
    // // (atleast until notification is clicked, so maybe reuse ecxisiting temp file system?)
    //
    // if let Some(icon) = icon {
    //     // file could be
    //     // - data uri - webxdc icon
    //     // - absolute path to file in blobdir - chat avatar, image in message
    //     let url = if icon.starts_with("data:") {
    //         Url::from_str(icon).map_err(|err| Error::Parse(format!("{err:?}")))?
    //     } else {
    //         Url::from_file_path(icon).map_err(|err| Error::Parse(format!("{err:?}")))?
    //     };
    //     notification_builder = notification_builder.attachment(Attachment::new(
    //         format!("attachment:{account_id}-{chat_id}-{message_id}"),
    //         url,
    //     ))
    // }

    let app_clone = app.clone();
    // MacOS needs this to be run on main thread
    app.run_on_main_thread(move || {
        // TODO find way to make this async
        // by doing conversion to async here and not in user_notify crate
        let notification = match block_on(async {
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
                    user_notify::xdg::NotificationBuilderXdg::new()
                        .category_hint(user_notify::xdg::NotificationCategory::ImReceived)
                        .appname("Delta Chat")
                }
            };

            let notification_builder = notification_builder
                .title(&title)
                .body(&body)
                .set_thread_id(&format!("{account_id}-{chat_id}"));

            notification_builder.show().await
        }) {
            Ok(notification) => notification,
            Err(err) => {
                log::error!("show notification failed {err:?}");
                return;
            }
        };
    })?;

    // notification.clo

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
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> Result<(), Error> {
    if window.label() != "main" {
        return Err(Error::NotMainWindow);
    }

    #[cfg(not(target_os = "macos"))]
    {
        // there seems to be no api for this in https://docs.rs/tauri-plugin-notification/latest/tauri_plugin_notification/struct.NotificationBuilder.html
        todo!("loop through all notifications we hold in the manager and call close on them");
    }

    #[cfg(target_os = "macos")]
    {
        app.run_on_main_thread(|| {
            if let Err(err) = user_notify::mac_os::remove_all_delivered_notifications() {
                log::error!("remove_all_delivered_notifications failed: {err}");
            }
        })?;
    }

    Ok(())
}
