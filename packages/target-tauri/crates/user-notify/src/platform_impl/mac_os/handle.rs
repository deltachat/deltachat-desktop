use objc2::{MainThreadMarker, rc::Retained};
use objc2_foundation::{NSArray, NSBundle, NSString};
use objc2_user_notifications::UNUserNotificationCenter;

use crate::{Error, NotificationHandle};

pub struct NotificationHandleMacOS {
    id: String, // idea use normal rust string
}

impl NotificationHandleMacOS {
    pub(super) fn new(id: String) -> Self {
        Self { id }
    }
}

impl NotificationHandle for NotificationHandleMacOS {
    fn close(&self) -> Result<(), Error> {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;

        let id = NSString::from_str(&self.id);
        let array: Retained<NSArray<NSString>> = NSArray::from_retained_slice(&[id]);

        unsafe {
            NSBundle::mainBundle()
                .bundleIdentifier()
                .ok_or(Error::NoBundleId)?;

            UNUserNotificationCenter::currentNotificationCenter()
                .removeDeliveredNotificationsWithIdentifiers(&array);
        }
        Ok(())
    }

    fn get_id(&self) -> String {
        self.id.to_string()
    }
}
