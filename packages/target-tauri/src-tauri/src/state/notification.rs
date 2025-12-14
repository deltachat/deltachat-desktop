use std::sync::Arc;

use anyhow::{anyhow, Context};
use deltachat::message::MsgId;
use tauri::{
    async_runtime::{handle, spawn},
    AppHandle, Manager,
};
use user_notify::{
    get_notification_manager, NotificationCategory, NotificationCategoryAction,
    NotificationManager, NotificationResponse,
};

use crate::{
    notifications::{
        self, NotificationPayload, NOTIFICATION_PAYLOAD_KEY, NOTIFICATION_REPLY_TO_ACTION_ID,
        NOTIFICATION_REPLY_TO_CATEGORY,
    },
    state::main_window_channels::MainWindowEvents,
    DeltaChatAppState, MainWindowChannels,
};

#[derive(Debug, Clone)]
pub(crate) struct Notifications {
    pub(crate) manager: Arc<dyn NotificationManager>,
}

impl Notifications {
    pub fn new(app_id: String) -> Self {
        Self {
            manager: get_notification_manager(app_id, Some("dcnotification".to_owned())), // - windows: we don't have deeplinking yet and this makes windows ignore the handelers
                                                                                          // manager: get_notification_manager(app_id, None),
        }
    }

    /// Handle an interaction with a notification.
    ///
    /// `is_untrusted` must be `true` for when the contents of `response`
    /// could be coming from a malicious source, such as a random website
    /// that has `<a href="dcnotification:..."`.
    /// When set to `true`, the handler will not perform effectful
    /// (permanent, destructive) actions, such as automatically sending a reply.
    /// See https://learn.microsoft.com/en-us/windows/apps/develop/launch/handle-uri-activation#remarks
    /// > Any app or website can use your URI scheme name,
    /// > including malicious ones.
    pub(crate) async fn handle_response(
        app: &AppHandle,
        response: NotificationResponse,
        is_untrusted: bool,
    ) {
        log::info!("[[[[response]]]]: {response:?}");
        let mwc = app.state::<MainWindowChannels>();

        let payload: NotificationPayload = match response
            .user_info
            .get(NOTIFICATION_PAYLOAD_KEY)
            .ok_or(notifications::Error::ValueMissing(
                NOTIFICATION_PAYLOAD_KEY.to_owned(),
            ))
            .and_then(|s| serde_json::from_str(s).map_err(notifications::Error::SerdeJson))
        {
            Err(err) => {
                log::error!("Error reading notification payload / user info: {err:?}");
                return;
            }
            Ok(p) => p,
        };

        use user_notify::NotificationResponseAction::*;
        let result = async { match response.action {
            Default => {
                let result = match payload {
                    NotificationPayload::OpenAccount { account_id } => {
                        mwc.emit_event_on_startup_deferred(MainWindowEvents::NotificationClick {
                            account_id,
                            chat_id: 0,
                            msg_id: 0,
                        })
                        .await
                    }
                    // Even though opening a chat or a message can be considered
                    // effectful in that it could send a "read" receipt,
                    // let's not be overzealous, i.e. let's not put this
                    // behind an `is_untrusted` check.
                    // After all, it's the user who allowed a website
                    // to interact with Delta Chat.
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
                };
                if let Some(main_window) = app.get_window("main") {
                    let _ = main_window.show();
                    let _ = main_window.set_focus();
                }
                result
            }
            Dismiss => {
                /* TODO? notification will just close? on macos this the handler is not even called for closing*/
                Ok(())
            }
            Other(action_id) => {
                if is_untrusted {
                    return Err(anyhow!(
                        "the requested notification action is powerful, but the source of the request is untrusted"
                    ));
                }
                match action_id {
                    id if id == NOTIFICATION_REPLY_TO_ACTION_ID => {
                        let NotificationPayload::OpenChatMessage {
                            account_id,
                            message_id,
                            ..
                        } = payload
                        else {
                            return Err(anyhow!(
                                "Reply Action failed because NotificationPayload was not of type NotificationPayload::OpenChatMessage"
                            ));
                        };

                        let Some(user_text) = response.user_text else {
                            // This case should not be possible, if the action was triggered then it should have text
                            return Err(anyhow!("Reply Action failed because no text was given"));
                        };
                        send_reply(app, account_id, message_id, user_text).await
                        // IDEA: open error dialog to inform the user that it failed
                    }
                    _ => {
                        Err(anyhow!(
                            "Action handler for {action_id:?} is not implemented"
                        ))
                    }
                }
            }
        } }.await;
        if let Err(err) = result {
            log::error!("Error reacting to notification response {err:?}");
        }
    }

    pub fn initialize(&self, app: AppHandle) {
        let categories = vec![NotificationCategory {
            identifier: NOTIFICATION_REPLY_TO_CATEGORY.to_string(),
            actions: vec![NotificationCategoryAction::TextInputAction {
                identifier: NOTIFICATION_REPLY_TO_ACTION_ID.to_string(),
                // IDEA: translate strings, but for that we would need to do some bigger refactoring probably?
                title: "Reply".to_string(),
                input_button_title: "Send".to_string(),
                input_placeholder: "Type your reply here".to_string(),
            }],
        }];
        let rt = handle();
        self.manager
            .register(
                Box::new(move |response| {
                    let app = app.clone();
                    rt.spawn(async move {
                        // The handler is invoked by the operating system
                        // directly in response to a notification click,
                        // so it is trusted.
                        let is_untrusted = false;
                        Notifications::handle_response(&app, response, is_untrusted).await
                    });
                }),
                categories,
            )
            .unwrap();
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
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
        let future = spawn(async move {
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
        drop(future)
    }
}

async fn send_reply(
    app: &AppHandle,
    account_id: u32,
    message_id: u32,
    text: String,
) -> Result<(), anyhow::Error> {
    let dc_state = app.state::<DeltaChatAppState>();
    let dc = dc_state.deltachat.read().await;
    let account = dc.get_account(account_id).context("account not found")?;

    let mut message = deltachat::message::Message::new_text(text);
    let quote = deltachat::message::Message::load_from_db(&account, MsgId::new(message_id)).await?;
    message.set_quote(&account, Some(&quote)).await?;
    deltachat::chat::send_msg(&account, quote.get_chat_id(), &mut message).await?;

    Ok(())
}
