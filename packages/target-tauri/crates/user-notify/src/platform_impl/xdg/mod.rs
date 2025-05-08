mod category;

use std::{
    collections::HashMap,
    sync::{Arc, OnceLock},
};

use async_trait::async_trait;
use image::ImageReader;
use notify_rust::{ActionResponse, CloseReason, Hint, Urgency, handle_action};
use tokio::sync::RwLock;

use crate::{NotificationBuilder, NotificationHandle, NotificationManager, NotificationResponse};

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

#[derive(Default)]
pub struct NotificationManagerXdg {
    active_notifications: RwLock<Vec<NotificationHandleXdg>>,
    handler: OnceLock<Arc<Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>>>,
}

impl std::fmt::Debug for NotificationManagerXdg {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NotificationManagerXdg")
            .field("active_notifications", &self.active_notifications)
            .field("handler", &self.handler.get().is_some().to_string())
            .finish()
    }
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
        handler_callback: Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>,
        categories: Vec<crate::NotificationCategory>,
    ) -> Result<(), crate::Error> {
        log::info!("NotificationManagerXdg::register {categories:?}");

        let _ = self.handler.set(Arc::new(handler_callback));

        // TODO categories? - though the rust notify library
        // does not seem to implement replies anyways
        // only buttons

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
            notification.body(&quick_xml::escape::escape(body));
        }

        if let Some(title) = builder.title {
            notification.summary(&title);
        }

        // subtitles are not supported by xdg spec

        if let Some(path) = builder.image {
            match ImageReader::open(path) {
                Err(error) => {
                    log::error!("failed to load image: {error:?}");
                }
                Ok(img) => match img.decode() {
                    Err(error) => {
                        log::error!("failed to decode image: {error:?}");
                    }
                    Ok(img_data) => {
                        let thumbnail = img_data.thumbnail(512, 512);
                        match thumbnail.try_into() {
                            Err(error) => log::error!("failed to convert image: {error:?}"),
                            Ok(img) => {
                                notification.hint(Hint::ImageData(img));
                            }
                        }
                    }
                },
            }
        }

        if let Some(path) = builder.icon {
            // untested
            notification.icon(&format!("file://{}", path.display()));
        } else {
            notification.auto_icon();
        }

        if let Some(_thread_id) = builder.thread_id {
            // not specified yet (as of first half of 2025, but it is planned)
            // does not exist in xdg spec yet: https://github.com/flatpak/xdg-desktop-portal/discussions/1495
        }

        if let Some(_category_id) = builder.category_id {
            // TODO add buttons acording to template
            log::error!("buttons not implemented yet on linux");
        }

        if let Some(xdg_category) = builder.xdg_category {
            notification.hint(Hint::Category(xdg_category.to_string()));
        }

        // if let Some(payload) = &builder.user_info {
        //     // seems to not exist yet - TODO investigate
        // }

        notification
            .urgency(Urgency::Normal)
            .hint(Hint::Transient(false))
            // default ation is needed otherwise the notification is not clickable
            .action("default", "default");
        //.action("open", "Open");

        let notification_handle = notification.show_async().await?;

        let user_info = builder.user_info.unwrap_or_default();

        if let Some(handler) = self.handler.get() {
            let handler_clone = handler.clone();
            let notification_id = id.clone();
            let cloned_user_info = user_info.clone();
            // on_close and wait_for_action both consume notification_handle so we need to rely on this deprecated feature
            handle_action(notification_handle.id(), move |action| {
                let user_info = cloned_user_info.clone();
                if let ActionResponse::Closed(reason) = action {
                    match reason {
                        CloseReason::Other(_) => {
                            log::warn!("unhandles close reason {reason:?}")
                        }
                        CloseReason::Expired | CloseReason::CloseAction => { /* nothing */ }
                        CloseReason::Dismissed => handler_clone(NotificationResponse {
                            notification_id,
                            action: crate::NotificationResponseAction::Dismiss,
                            user_text: None,
                            user_info,
                        }),
                    }
                } else {
                    handler_clone(NotificationResponse {
                        notification_id,
                        action: crate::NotificationResponseAction::Default,
                        user_text: None,
                        user_info,
                    });
                }
            });
        } else {
            log::error!("no handler set");
        }

        let handle = NotificationHandleXdg {
            id,
            user_info,
            handle: Arc::new(RwLock::new(Some(notification_handle))),
        };

        self.add_notification(handle.clone()).await;
        Ok(Box::new(handle) as Box<dyn NotificationHandle>)
    }
}
