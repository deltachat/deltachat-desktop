use std::sync::Arc;

use tauri::{
    async_runtime::{handle, spawn},
    AppHandle, Manager,
};
use user_notify::{
    mac_os::NotificationManagerMacOS, NotificationCategory, NotificationCategoryAction,
    NotificationManager,
};

use crate::{
    notifications::{self, NotificationPayload, NOTIFICATION_PAYLOAD_KEY},
    state::main_window_channels::MainWindowEvents,
    MainWindowChannels,
};

#[derive(Debug, Clone)]
pub(crate) struct Notifications {
    #[cfg(target_os = "macos")]
    pub(crate) manager: Arc<NotificationManagerMacOS>,
}

impl Notifications {
    pub fn new() -> Self {
        Self {
            #[cfg(target_os = "macos")]
            manager: Arc::new(NotificationManagerMacOS::new()),
        }
    }

    pub fn initialize(&self, app: AppHandle) {
        let categories = vec![NotificationCategory {
            identifier: "chat.delta.tauri.message.with.reply.to".to_string(),
            actions: vec![NotificationCategoryAction::TextInputAction {
                identifier: "chat.delta.tauri.message.reply.action".to_string(),
                // IDEA: translate strings, but for that we would need to do some bigger refactoring probably?
                title: "Reply".to_string(),
                input_button_title: "Send".to_string(),
                input_placeholder: "Type your reply here".to_string(),
            }],
        }];
        let rt = handle();
        self.manager.register(
            move |response| {
                let app = app.clone();
                rt.spawn(async move {
                    log::info!("[[[[response]]]]: {response:?}");
                    let mwc = app.state::<MainWindowChannels>();

                    let payload: NotificationPayload = match response
                        .user_info
                        .get(NOTIFICATION_PAYLOAD_KEY)
                        .ok_or(notifications::Error::ValueMissing(
                            NOTIFICATION_PAYLOAD_KEY.to_owned(),
                        ))
                        .and_then(|s| {
                            serde_json::from_str(s).map_err(notifications::Error::SerdeJson)
                        }) {
                        Err(err) => {
                            log::error!("Error reading notification payload / user info: {err:?}");
                            return;
                        }
                        Ok(p) => p,
                    };

                    use user_notify::NotificationResponseAction::*;
                    let result = match response.action {
                        Default => match payload {
                            NotificationPayload::OpenAccount { account_id } => {
                                mwc.emit_event_on_startup_deferred(MainWindowEvents::NotificationClick {
                                    account_id,
                                    chat_id: 0,
                                    msg_id: 0,
                                })
                                .await
                            }
                            NotificationPayload::OpenChat {
                                account_id,
                                chat_id,
                            } => {
                                mwc.emit_event_on_startup_deferred(MainWindowEvents::NotificationClick {
                                    account_id,
                                    chat_id,
                                    msg_id: 0,
                                })
                                .await
                            }
                            NotificationPayload::OpenChatMessage {
                                account_id,
                                chat_id,
                                message_id,
                            } => {
                                mwc.emit_event_on_startup_deferred(MainWindowEvents::NotificationClick {
                                    account_id,
                                    chat_id,
                                    msg_id: message_id,
                                })
                                .await
                            }
                        },
                        Dismiss => {
                            /* TODO? notification will just close? on macos this the handler is not even called for closing*/
                            Ok(())
                        }
                        Other(action_id) => todo!(),
                    };
                    if let Err(err) = result {
                        log::error!("Error reacting to notification response {err:?}");
                    }
                });
            },
            categories,
        );
        #[cfg(not(target_os = "macos"))]
        {
            // remove all notifications that are still there from previous sessions,
            // as they probably don't work anymore and are just stuck
            //
            // https://github.com/deltachat/deltachat-desktop/issues/2438#issuecomment-1090735045
            if let Err(err) = self.manager.remove_all_delivered_notifications() {
                log::error!("remove_all_delivered_notifications: {err:?}");
            }
        }
    }

    pub fn ask_for_permission(&self) {
        let manager_clone = self.manager.clone();
        // this is run on startup so we don't want to block/wait on it
        let _ = spawn(async move {
            match manager_clone
                .first_time_ask_for_notification_permission()
                .await
            {
                Err(err) => {
                    log::error!("failed to ask for notification permission: {err:?}");
                }
                Ok(false) => {
                    log::info!("push notification permission is denied");
                }
                Ok(true) => {
                    log::info!("push notification permission is allowed");
                }
            }
        });
    }
}
