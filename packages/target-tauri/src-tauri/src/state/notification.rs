use std::sync::Arc;

use tauri::async_runtime::spawn;
use user_notify::{
    mac_os::NotificationManagerMacOS, NotificationCategory, NotificationCategoryAction,
    NotificationManager,
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

    pub fn initialize(&self) {
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
        self.manager.register(categories);
        #[cfg(target_os = "macos")]
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
