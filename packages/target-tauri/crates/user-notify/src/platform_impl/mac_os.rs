use objc2::{MainThreadMarker, rc::Retained};
use objc2_foundation::{NSBundle, NSString};
use objc2_user_notifications::{
    UNMutableNotificationContent, UNNotificationRequest, UNUserNotificationCenter,
};

use crate::{Error, NotificationBuilder, NotificationHandle};

pub trait NotificationBuilderExtMacOS {}

pub struct NotificationBuilderMacOS {
    notification: Retained<UNMutableNotificationContent>,
}

impl NotificationBuilder for NotificationBuilderMacOS {
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

    fn set_image(self, path: std::path::PathBuf) -> Self {
        unsafe {}
        self
    }

    fn set_icon(self, path: std::path::PathBuf) -> Self {
        todo!()
    }

    fn set_thread_id(self, thread_id: &str) -> Self {
        unsafe {
            self.notification
                .setThreadIdentifier(&NSString::from_str(thread_id));
        }
        self
    }

    fn on_click(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
        todo!()
    }

    fn on_close(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
        todo!()
    }

    #[allow(refining_impl_trait)]
    async fn show(self) -> Result<NotificationHandleMacOS, Error> {
        unsafe {
            MainThreadMarker::new().ok_or(Error::NotMainThread)?;
            let bundle_id = NSBundle::mainBundle()
                .bundleIdentifier()
                .ok_or(Error::NoBundleId)?;

            let request = UNNotificationRequest::requestWithIdentifier_content_trigger(
                &bundle_id,
                &self.notification,
                None,
            );

            // UNUserNotificationCenter::currentNotificationCenter()
            //     .addNotificationRequest_withCompletionHandler(&request, completion_handler);
        }

        todo!();

        Ok(NotificationHandleMacOS::new())
    }
}

pub struct NotificationHandleMacOS {}

impl NotificationHandleMacOS {
    fn new() -> Self {
        Self {}
    }
}

impl NotificationHandle for NotificationHandleMacOS {
    fn close(&self) {
        todo!()
    }
}

// /// Get all deliverd notifications from UNUserNotificationCenter that are still active,
// /// so they can be removed. (they might be from last session)
// ///
// /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getdeliverednotifications(completionhandler:)
// async fn get_active_notifications() -> Result<Vec<NotificationHandleMacOS>, Error> {
//     todo!();
// }
//

/// Removes all of your app’s delivered notifications from Notification Center.
///
/// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/removealldeliverednotifications()
pub fn remove_all_delivered_notifications() -> Result<(), Error> {
    unsafe {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;
        UNUserNotificationCenter::currentNotificationCenter().removeAllDeliveredNotifications();
    }
    Ok(())
}

// TODO: method to get notification setting state:
// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getnotificationsettings(completionhandler:)

// TODO: method to request notification permission:
// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/requestauthorization(options:completionhandler:)
