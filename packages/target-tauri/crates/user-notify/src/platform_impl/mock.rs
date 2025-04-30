//! This manager logs the calls to it and does nothing more.
//! It can be used for testing application code,
//! or as a fallback for tauri's devmode that runs the app without a bundle id

use std::collections::HashMap;

use async_trait::async_trait;
use tokio::sync::RwLock;

use crate::{NotificationBuilder, NotificationHandle, NotificationManager};

#[derive(Debug, Clone)]
pub struct NotificationHandleMock {
    id: String,
    user_info: HashMap<String, String>,
}

impl NotificationHandle for NotificationHandleMock {
    fn close(&self) -> Result<(), crate::Error> {
        log::info!("called close notification handle {self:?}");
        Ok(())
    }

    fn get_id(&self) -> String {
        self.id.clone()
    }

    fn get_user_info(&self) -> &HashMap<String, String> {
        &self.user_info
    }
}

#[derive(Debug, Default)]
pub struct NotificationManagerMock {
    active_notifications: RwLock<Vec<NotificationHandleMock>>,
}

impl NotificationManagerMock {
    pub fn new() -> Self {
        Self::default()
    }

    async fn add_notification(&self, notification: NotificationHandleMock) {
        self.active_notifications.write().await.push(notification);
    }
}

#[async_trait]
impl NotificationManager for NotificationManagerMock {
    async fn get_notification_permission_state(&self) -> Result<bool, crate::Error> {
        log::info!("NotificationManagerMock::get_notification_permission_state");
        Ok(true)
    }

    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, crate::Error> {
        log::info!("NotificationManagerMock::first_time_ask_for_notification_permission");
        Ok(true)
    }

    fn register(
        &self,
        _handler_callback: Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>,
        categories: Vec<crate::NotificationCategory>,
    ) -> Result<(), crate::Error> {
        log::info!("NotificationManagerMock::register {categories:?}");
        Ok(())
    }

    fn remove_all_delivered_notifications(&self) -> Result<(), crate::Error> {
        let mut active_notifications = self.active_notifications.try_write()?;
        let removed_notifiactions = active_notifications.drain(..);
        log::info!(
            "NotificationManagerMock::remove_all_delivered_notifications -> removed the following notifications {removed_notifiactions:?}"
        );
        Ok(())
    }

    fn remove_delivered_notifications(&self, ids: Vec<&str>) -> Result<(), crate::Error> {
        let mut active_notifications = self.active_notifications.try_write()?;
        let all_notifications = active_notifications.drain(..);
        let mut kept = Vec::new();
        let mut removed = Vec::new();
        for n in all_notifications {
            if ids.contains(&n.id.as_str()) {
                removed.push(n);
            } else {
                kept.push(n);
            }
        }
        active_notifications.append(&mut kept);

        log::info!(
            "NotificationManagerMock::remove_delivered_notifications -> removed the following notifications {removed:?}"
        );
        Ok(())
    }

    async fn get_active_notifications(
        &self,
    ) -> Result<Vec<Box<dyn NotificationHandle>>, crate::Error> {
        let active_notifications = self.active_notifications.read().await;
        log::info!(
            "NotificationManagerMock::get_active_notifications - the active notifications are: {active_notifications:?}"
        );
        Ok(active_notifications
            .clone()
            .into_iter()
            .map(|n| Box::new(n) as Box<dyn NotificationHandle>)
            .collect())
    }

    async fn send_notification(
        &self,
        builder: NotificationBuilder,
    ) -> Result<Box<dyn NotificationHandle>, crate::Error> {
        log::info!("show notification {self:?}");
        let id = uuid::Uuid::new_v4().to_string();

        let handle = NotificationHandleMock {
            id,
            user_info: builder.user_info.unwrap_or_default(),
        };

        self.add_notification(handle.clone()).await;
        Ok(Box::new(handle) as Box<dyn NotificationHandle>)
    }
}
