use std::cell::{OnceCell, RefCell};
use std::{collections::HashMap, ptr::NonNull};

use objc2::runtime::ProtocolObject;
use send_wrapper::SendWrapper;

use objc2::{MainThreadMarker, rc::Retained, runtime::Bool};
use objc2_foundation::{NSArray, NSBundle, NSError, NSString, NSURL, ns_string};
use objc2_user_notifications::{
    UNAuthorizationOptions, UNAuthorizationStatus, UNMutableNotificationContent,
    UNNotificationAttachment, UNNotificationRequest, UNNotificationSettings,
    UNUserNotificationCenter, UNUserNotificationCenterDelegate,
};

use crate::{Error, NotificationManager, mac_os::delegate::NotificationDelegate};

use super::handle::NotificationHandleMacOS;

#[derive(Debug)]
pub struct NotificationManagerMacOS {
    /// reference to the delegate so that it isn't dropped immitiately
    delegate_reference:
        SendWrapper<OnceCell<Retained<ProtocolObject<dyn UNUserNotificationCenterDelegate>>>>,
    pub(crate) bundle_id: Option<String>,
}

impl NotificationManagerMacOS {
    pub fn new() -> Self {
        log::debug!("NotificationManager.new called");
        Self {
            delegate_reference: SendWrapper::new(OnceCell::new()),
            bundle_id: unsafe {
                NSBundle::mainBundle()
                    .bundleIdentifier()
                    .map(|ns_string| ns_string.to_string())
            },
        }
    }
    /// adds a notification to the notification center
    /// needs to be called from main thread
    pub(super) fn add_notification<F: FnOnce(Result<(), Error>) + Send + 'static>(
        &self,
        request: &UNNotificationRequest,
        cb: F,
    ) {
        unsafe {
            // make the RcBlock callback be a FnOnce
            let cb = RefCell::new(Some(cb));
            let block = block2::RcBlock::new(move |error: *mut NSError| {
                if error.is_null() {
                    if let Some(cb) = cb.take() {
                        cb(Ok(()));
                    }
                } else if let Some(cb) = cb.take() {
                    let Some(err_ref) = error.as_ref() else {
                        return cb(Err(Error::NSError("Failed to read error".to_string())));
                    };
                    let description = err_ref.localizedDescription();
                    cb(Err(Error::NSError(description.to_string())));
                }
            });

            UNUserNotificationCenter::currentNotificationCenter()
                .addNotificationRequest_withCompletionHandler(request, Some(&block));
        }
    }
}

impl NotificationManager for NotificationManagerMacOS {
    /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getnotificationsettings(completionhandler:)
    #[allow(refining_impl_trait)]
    async fn get_notification_permission_state(&self) -> Result<bool, Error> {
        let (tx, rx) = tokio::sync::oneshot::channel::<bool>();
        unsafe {
            // MainThreadMarker::new().ok_or(Error::NotMainThread)?;
            // TODO is this ok not being run on main thread?
            NSBundle::mainBundle()
                .bundleIdentifier()
                .ok_or(Error::NoBundleId)?;
            let cb = RefCell::new(Some(tx));
            let block = block2::RcBlock::new(move |settings: NonNull<UNNotificationSettings>| {
                if let Some(cb) = cb.take() {
                    let auth_status = settings.as_ref().authorizationStatus();
                    let authorized = match auth_status {
                        UNAuthorizationStatus::Authorized
                        | UNAuthorizationStatus::Provisional
                        | UNAuthorizationStatus::Ephemeral => true,
                        UNAuthorizationStatus::Denied | UNAuthorizationStatus::NotDetermined => {
                            false
                        }
                        _ => {
                            log::error!("Unknown Authorisation status: {auth_status:?}");
                            false
                        }
                    };
                    if let Err(_) = cb.send(authorized) {
                        log::error!("the receiver dropped");
                    }
                }
            });
            UNUserNotificationCenter::currentNotificationCenter()
                .getNotificationSettingsWithCompletionHandler(&block);
        }
        Ok(rx.await?)
    }

    /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/requestauthorization(options:completionhandler:)
    #[allow(refining_impl_trait)]
    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, Error> {
        unsafe {
            // MainThreadMarker::new().ok_or(Error::NotMainThread)?;
            // TODO is this ok not being run on main thread?
            NSBundle::mainBundle()
                .bundleIdentifier()
                .ok_or(Error::NoBundleId)?;
        }
        let (tx, rx) = tokio::sync::oneshot::channel::<Result<bool, Error>>();

        #[inline]
        fn request_autorization(tx: tokio::sync::oneshot::Sender<Result<bool, Error>>) {
            let cb = RefCell::new(Some(tx));
            let block = block2::RcBlock::new(move |authorized: Bool, error: *mut NSError| {
                if let Some(cb) = cb.take() {
                    let result: Result<bool, Error> = if error.is_null() {
                        Ok(authorized.as_bool())
                    } else {
                        if let Some(err_ref) = unsafe { error.as_ref() } {
                            let description = err_ref.localizedDescription();
                            Err(Error::NSError(description.to_string()))
                        } else {
                            Err(Error::NSError("Failed to read error".to_string()))
                        }
                    };
                    if let Err(_) = cb.send(result) {
                        log::error!("the receiver dropped");
                    }
                }
            });

            let mut options = UNAuthorizationOptions::empty();
            options.set(UNAuthorizationOptions::Alert, true);
            options.set(UNAuthorizationOptions::Sound, true);
            options.set(UNAuthorizationOptions::Badge, true);
            unsafe {
                UNUserNotificationCenter::currentNotificationCenter()
                    .requestAuthorizationWithOptions_completionHandler(options, &block);
            }
        }
        request_autorization(tx);
        Ok(rx.await??)
    }

    // todo find out if it makes a difference when this is called
    // - does it handle notifications of previus sessions just fine?
    fn register(&self) {
        log::debug!("NotificationManager.register called");
        let mtm = MainThreadMarker::new().expect("not on main thread");
        let notification_delegate = NotificationDelegate::new(mtm);
        unsafe {
            let proto: Retained<ProtocolObject<dyn UNUserNotificationCenterDelegate>> =
                ProtocolObject::from_retained(notification_delegate);

            UNUserNotificationCenter::currentNotificationCenter().setDelegate(Some(&*proto));

            self.delegate_reference
                .set(proto)
                .expect("failed to set delegate_reference, did you call register multiple times so that the once_cell was already taken?");
        }
        log::debug!("NotificationManager.register completed");
    }

    fn remove_all_delivered_notifications(&self) -> Result<(), Error> {
        remove_all_delivered_notifications()
    }

    fn remove_delivered_notifications(&self, ids: Vec<&str>) -> Result<(), Error> {
        remove_delivered_notifications(ids)
    }

    #[allow(refining_impl_trait)]
    async fn get_active_notifications(&self) -> Result<Vec<NotificationHandleMacOS>, Error> {
        // https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getdeliverednotifications(completionhandler:)
        todo!()
    }

    fn set_user_response_handler(
        &self,
        handler_callback: impl Fn(crate::NotificationResponse) + Send + Sync,
    ) {
        todo!()
    }
}

fn remove_delivered_notifications(ids: Vec<&str>) -> Result<(), Error> {
    MainThreadMarker::new().ok_or(Error::NotMainThread)?;

    let ids: Vec<_> = ids.iter().map(|s| NSString::from_str(s)).collect();
    let array: Retained<NSArray<NSString>> = NSArray::from_retained_slice(ids.as_slice());

    unsafe {
        NSBundle::mainBundle()
            .bundleIdentifier()
            .ok_or(Error::NoBundleId)?;

        UNUserNotificationCenter::currentNotificationCenter()
            .removeDeliveredNotificationsWithIdentifiers(&array);
    }
    unsafe {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;
        NSBundle::mainBundle()
            .bundleIdentifier()
            .ok_or(Error::NoBundleId)?;

        UNUserNotificationCenter::currentNotificationCenter().removeAllDeliveredNotifications();
    }
    Ok(())
}

/// Removes all of your app’s delivered notifications from Notification Center.
///
/// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/removealldeliverednotifications()
pub fn remove_all_delivered_notifications() -> Result<(), Error> {
    unsafe {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;
        NSBundle::mainBundle()
            .bundleIdentifier()
            .ok_or(Error::NoBundleId)?;

        UNUserNotificationCenter::currentNotificationCenter().removeAllDeliveredNotifications();
    }
    Ok(())
}
