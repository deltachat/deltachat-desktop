use std::collections::HashMap;

use objc2::{MainThreadMarker, rc::Retained};
use objc2_foundation::{NSArray, NSBundle, NSString};
use objc2_user_notifications::UNUserNotificationCenter;

use crate::{Error, NotificationHandle};

#[derive(Debug)]
pub struct NotificationHandleMacOS {
    id: String,
    user_info: HashMap<String, String>,
}

impl NotificationHandleMacOS {
    pub(super) fn new(id: String, user_data: HashMap<String, String>) -> Self {
        Self {
            id,
            user_info: user_data,
        }
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

    fn get_user_info(&self) -> &HashMap<String, String> {
        &self.user_info
    }
}
