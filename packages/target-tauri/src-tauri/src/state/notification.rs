use std::sync::Arc;

use tauri::async_runtime::spawn;
use user_notify::{mac_os::NotificationManagerMacOS, NotificationManager};

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
        self.manager.register(vec![]);
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
