use std::{collections::HashMap, ops::Deref, sync::Arc};

use super::{NotificationManagerMacOS, handle::NotificationHandleMacOS};
use objc2::{rc::Retained, runtime::AnyObject};
use objc2_foundation::{NSArray, NSDictionary, NSString, NSURL, ns_string};
use objc2_user_notifications::{
    UNMutableNotificationContent, UNNotificationAttachment, UNNotificationRequest,
};
use uuid::Uuid;

use crate::{Error, NotificationBuilder, NotificationHandle};

// pub trait NotificationBuilderExtMacOS {
//     // IDEA: Conversation notifications with people to sopport breakthrough of focus
// }

#[derive(Debug, Default)]
pub struct NotificationBuilderMacOS {
    body: Option<String>,
    title: Option<String>,
    subtitle: Option<String>,
    image: Option<std::path::PathBuf>,
    thread_id: Option<String>,
    category_id: Option<String>,
    user_info: Option<HashMap<String, String>>,
}

impl NotificationBuilder<NotificationManagerMacOS> for NotificationBuilderMacOS {
    fn new() -> Self {
        NotificationBuilderMacOS {
            ..Default::default()
        }
    }

    fn body(mut self, body: &str) -> Self {
        self.body = Some(body.to_owned());
        self
    }

    fn title(mut self, title: &str) -> Self {
        self.title = Some(title.to_owned());
        self
    }

    fn subtitle(mut self, subtitle: &str) -> Self {
        self.subtitle = Some(subtitle.to_owned());
        self
    }

    fn set_image(mut self, path: std::path::PathBuf) -> Result<Self, Error> {
        self.image = Some(path);
        Ok(self)
    }

    fn set_icon(self, _path: std::path::PathBuf) -> Result<Self, Error> {
        log::debug!("notification set_icon is not supported on MacOS");
        Ok(self)
    }

    fn set_thread_id(mut self, thread_id: &str) -> Self {
        self.thread_id = Some(thread_id.to_owned());
        self
    }

    fn set_category_id(mut self, category_id: &str) -> Self {
        self.category_id = Some(category_id.to_owned());
        self
    }

    // fn on_click(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
    //     todo!()
    // }

    // fn on_close(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
    //     todo!()
    // }

    fn set_user_info(mut self, user_info: HashMap<String, String>) -> Self {
        self.user_info = Some(user_info);
        self
    }

    #[allow(refining_impl_trait)]
    async fn show(
        self,
        manager: Arc<NotificationManagerMacOS>,
    ) -> Result<impl NotificationHandle, Error> {
        // MainThreadMarker::new().ok_or(Error::NotMainThread)?; // TODO is this really nesesary

        let (tx, rx) = tokio::sync::oneshot::channel::<Result<(), Error>>();
        let handle = self.build_and_send(&manager, tx)?;
        rx.await??;

        Ok::<_, Error>(handle)
    }
}

impl NotificationBuilderMacOS {
    fn build_and_send(
        self,
        manager: &NotificationManagerMacOS,
        tx: tokio::sync::oneshot::Sender<Result<(), Error>>,
    ) -> Result<NotificationHandleMacOS, Error> {
        let (request, id, user_info) = self.build(manager)?;
        manager.add_notification(&request, move |result| {
            if let Err(err) = tx.send(result) {
                log::error!("add_notification tx.send error {err:?}");
            }
        });
        Ok(NotificationHandleMacOS::new(id, user_info))
    }

    fn build(
        self,
        manager: &NotificationManagerMacOS,
    ) -> Result<
        (
            Retained<UNNotificationRequest>,
            String,
            HashMap<String, String>,
        ),
        Error,
    > {
        let mut user_info = HashMap::new();

        let notification: Retained<UNMutableNotificationContent> = unsafe {
            let notification = UNMutableNotificationContent::new();

            if let Some(body) = self.body {
                notification.setBody(&NSString::from_str(&body));
            }

            if let Some(title) = self.title {
                notification.setTitle(&NSString::from_str(&title));
            }

            if let Some(subtitle) = self.subtitle {
                notification.setSubtitle(&NSString::from_str(&subtitle));
            }

            if let Some(path) = self.image {
                let ns_url = NSURL::fileURLWithPath(&NSString::from_str(
                    &path.to_string_lossy().to_string(),
                ));
                log::trace!("{ns_url:?}");
                let attachment =
                    UNNotificationAttachment::attachmentWithIdentifier_URL_options_error(
                        ns_string!(""),
                        &ns_url,
                        None,
                    )
                    .map_err(|ns_err| {
                        let description = ns_err.localizedDescription();
                        Error::NSError(description.to_string())
                    })?;

                let ns_array: Retained<NSArray<UNNotificationAttachment>> =
                    NSArray::from_retained_slice(&[attachment]);

                notification.setAttachments(&ns_array);
            }

            if let Some(thread_id) = self.thread_id {
                notification.setThreadIdentifier(&NSString::from_str(&thread_id));
            }
            if let Some(category_id) = self.category_id {
                notification.setCategoryIdentifier(&NSString::from_str(&category_id));
            }

            if let Some(payload) = self.user_info {
                let mut user_info_keys = Vec::with_capacity(payload.len());
                let mut user_info_values = Vec::with_capacity(payload.len());
                for (key, value) in payload.iter() {
                    user_info_keys.push(NSString::from_str(key));
                    user_info_values.push(NSString::from_str(value));
                }
                let string_dictionary = NSDictionary::from_slices(
                    user_info_keys
                        .iter()
                        .map(|r| r.deref())
                        .collect::<Vec<&NSString>>()
                        .as_slice(),
                    user_info_values
                        .iter()
                        .map(|r| r.deref())
                        .collect::<Vec<&NSString>>()
                        .as_slice(),
                );
                let anyobject_dictionary = Retained::cast_unchecked::<
                    NSDictionary<AnyObject, AnyObject>,
                >(string_dictionary);
                notification.setUserInfo(anyobject_dictionary.deref());
                user_info = payload;
            }

            notification
        };

        unsafe {
            let bundle_id = manager
                .inner
                .bundle_id
                .as_ref()
                .map(|s| NSString::from_str(s))
                .ok_or(Error::NoBundleId)?;
            // log::trace!("bundle_id: {bundle_id:?}");

            let id = format!("{}.{}", Uuid::new_v4(), bundle_id.to_string());

            let r = UNNotificationRequest::requestWithIdentifier_content_trigger(
                &NSString::from_str(&id),
                &notification,
                None,
            );

            log::trace!("{r:?}  -- {:?}", r.identifier());

            return Ok((r, id, user_info));
        };
    }
}
