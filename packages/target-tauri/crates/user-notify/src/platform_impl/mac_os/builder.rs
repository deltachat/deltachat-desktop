use std::collections::HashMap;

use super::{NotificationManagerMacOS, handle::NotificationHandleMacOS};
use objc2::{MainThreadMarker, rc::Retained};
use objc2_foundation::{NSArray, NSBundle, NSString, NSURL, ns_string};
use objc2_user_notifications::{
    UNMutableNotificationContent, UNNotificationAttachment, UNNotificationRequest,
};

use crate::{Error, NotificationBuilder, NotificationHandle};

// pub trait NotificationBuilderExtMacOS {
//     // IDEA: Conversation notifications with people to sopport breakthrough of focus
// }

pub struct NotificationBuilderMacOS {
    notification: Retained<UNMutableNotificationContent>,
}

impl NotificationBuilder<NotificationManagerMacOS> for NotificationBuilderMacOS {
    fn new() -> Self {
        let notification = unsafe { UNMutableNotificationContent::new() };
        NotificationBuilderMacOS { notification }
    }

    fn body(self, body: &str) -> Self {
        unsafe {
            self.notification.setBody(&NSString::from_str(body));
        }
        self
    }

    fn title(self, title: &str) -> Self {
        unsafe {
            self.notification.setTitle(&NSString::from_str(title));
        }
        self
    }

    fn subtitle(self, subtitle: &str) -> Self {
        unsafe {
            self.notification.setSubtitle(&NSString::from_str(subtitle));
        }
        self
    }

    fn set_image(self, path: std::path::PathBuf) -> Result<Self, Error> {
        unsafe {
            let ns_url =
                NSURL::fileURLWithPath(&NSString::from_str(&path.to_string_lossy().to_string()));
            log::info!("{ns_url:?}");
            let attachment = UNNotificationAttachment::attachmentWithIdentifier_URL_options_error(
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

            self.notification.setAttachments(&ns_array);
        }
        Ok(self)
    }

    fn set_icon(self, _path: std::path::PathBuf) -> Result<Self, Error> {
        log::debug!("notification set_icon is not supported on MacOS");
        Ok(self)
    }

    fn set_thread_id(self, thread_id: &str) -> Self {
        unsafe {
            self.notification
                .setThreadIdentifier(&NSString::from_str(thread_id));
        }
        self
    }

    // fn on_click(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
    //     todo!()
    // }

    // fn on_close(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
    //     todo!()
    // }

    fn set_user_info(self, user_info: HashMap<String, String>) -> Self {
        todo!();
        self
    }

    #[allow(refining_impl_trait)]
    async fn show(
        self,
        manager: &NotificationManagerMacOS,
    ) -> Result<impl NotificationHandle, Error> {
        // MainThreadMarker::new().ok_or(Error::NotMainThread)?; // TODO is this really nesesary

        let request = unsafe {
            let bundle_id = manager
                .bundle_id
                .as_ref()
                .map(|s| NSString::from_str(s))
                .ok_or(Error::NoBundleId)?;
            println!("bundle_id: {bundle_id:?}");

            UNNotificationRequest::requestWithIdentifier_content_trigger(
                &bundle_id,
                &self.notification,
                None,
            )
        };

        let (tx, rx) = tokio::sync::oneshot::channel::<Result<(), Error>>();
        manager.add_notification(&request, move |result| {
            if let Err(err) = tx.send(result) {
                log::error!("add_notification tx.send error {err:?}");
            }
        });
        rx.await??;

        let id = unsafe { request.identifier() };

        log::info!("identifier: {id:?}");

        Ok(NotificationHandleMacOS::new(id))
    }
}
