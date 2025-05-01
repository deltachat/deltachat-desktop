mod category;

use std::{collections::HashMap, ops::Deref, sync::Arc};

use async_trait::async_trait;
use notify_rust::Hint;
use tokio::sync::RwLock;

use crate::{NotificationBuilder, NotificationHandle, NotificationManager};

#[derive(Debug, Clone)]
pub struct NotificationHandleXdg {
    id: String,
    user_info: HashMap<String, String>,
    handle: Arc<RwLock<Option<notify_rust::NotificationHandle>>>,
}

impl NotificationHandle for NotificationHandleXdg {
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
pub struct NotificationManagerXdg {
    active_notifications: RwLock<Vec<NotificationHandleXdg>>,
}

impl NotificationManagerXdg {
    pub fn new() -> Self {
        Self::default()
    }

    async fn add_notification(&self, notification: NotificationHandleXdg) {
        self.active_notifications.write().await.push(notification);
    }
}

#[async_trait]
impl NotificationManager for NotificationManagerXdg {
    async fn get_notification_permission_state(&self) -> Result<bool, crate::Error> {
        log::info!(
            "NotificationManagerXdg::get_notification_permission_state: not implemented yet"
        );

        Ok(true)
    }

    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, crate::Error> {
        log::info!(
            "NotificationManagerXdg::first_time_ask_for_notification_permission: not implemented yet"
        );
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
        let removed_notifications = active_notifications.drain(..);

        for notification in removed_notifications {
            if let Some(handle) = notification.handle.try_write()?.take() {
                handle.close();
            } else {
                log::error!("handle is not there anymore");
            }
        }

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

        for notification in removed {
            if let Some(handle) = notification.handle.try_write()?.take() {
                handle.close();
            } else {
                log::error!("handle is not there anymore");
            }
        }

        Ok(())
    }

    async fn get_active_notifications(
        &self,
    ) -> Result<Vec<Box<dyn NotificationHandle>>, crate::Error> {
        // can only get notification from active session for now
        let active_notifications = self.active_notifications.read().await;
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

        let mut notification = notify_rust::Notification::new();

        // As said in the readme all notifications are persistent (TODO confirm it does what I expect on kde and gnome)
        notification.hint(Hint::Urgency(notify_rust::Urgency::Normal));
        notification.hint(Hint::Resident(true));
        if let Some(xdg_app_name) = builder.xdg_app_name {
            notification.appname(&xdg_app_name);
        }

        if let Some(body) = builder.body {
            notification.body(&body);
        }

        if let Some(title) = builder.title {
            notification.summary(&title);
        }

        if let Some(subtitle) = builder.subtitle {
            notification.subtitle(&subtitle);
        }

        if let Some(path) = builder.image {
            //TODO
        }

        if let Some(path) = builder.icon {
            //TODO
        } else {
            notification.auto_icon();
        }

        if let Some(_thread_id) = builder.thread_id {
            // not specified yet (as of first half of 2025, but it is planned)
            // does not exist in xdg spec yet: https://github.com/flatpak/xdg-desktop-portal/discussions/1495
        }

        if let Some(category_id) = builder.category_id {
            // TODO add buttons acording to template
            log::error!("buttons not implemented yet on linux");
        }

        if let Some(xdg_category) = builder.xdg_category {
            notification.hint(Hint::Category(xdg_category.to_string()));
        }

        if let Some(payload) = &builder.user_info {
            // seems to not exist yet - TODO investigate
        }

        let notification_handle = notification.show_async().await?;

        let handle = NotificationHandleXdg {
            id,
            user_info: builder.user_info.unwrap_or_default(),
            handle: Arc::new(RwLock::new(Some(notification_handle))),
        };

        self.add_notification(handle.clone()).await;
        Ok(Box::new(handle) as Box<dyn NotificationHandle>)
    }
}
