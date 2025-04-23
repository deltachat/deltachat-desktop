use std::{
    cell::{Cell, OnceCell, RefCell},
    ptr::NonNull,
    sync::OnceLock,
};

use objc2::{
    DefinedClass, MainThreadMarker, MainThreadOnly, Message, define_class, msg_send,
    rc::Retained,
    runtime::{Bool, ProtocolObject},
};
use objc2_foundation::{
    NSArray, NSBundle, NSError, NSObject, NSObjectProtocol, NSString, NSURL, ns_string,
};
use objc2_user_notifications::{
    UNAuthorizationOptions, UNAuthorizationStatus, UNMutableNotificationContent, UNNotification,
    UNNotificationAttachment, UNNotificationPresentationOptions, UNNotificationRequest,
    UNNotificationResponse, UNNotificationSettings, UNUserNotificationCenter,
    UNUserNotificationCenterDelegate,
};
use send_wrapper::SendWrapper;

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

    fn on_click(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
        todo!()
    }

    fn on_close(self, cb: Box<(dyn Fn() + Send + Sync + 'static)>) -> Self {
        todo!()
    }

    #[allow(refining_impl_trait)]
    async fn show(self) -> Result<NotificationHandleMacOS, Error> {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;

        let request = unsafe {
            let bundle = NSBundle::mainBundle();
            let bundle_id = bundle.bundleIdentifier().ok_or(Error::NoBundleId)?;
            println!("bundle_id: {bundle_id:?}");

            UNNotificationRequest::requestWithIdentifier_content_trigger(
                &bundle_id,
                &self.notification,
                None,
            )
        };

        let (tx, rx) = tokio::sync::oneshot::channel::<Result<(), Error>>();
        add_notification(&request, move |result| {
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
/// adds a notification to the notification center
/// needs to be called from main thread
fn add_notification<F: FnOnce(Result<(), Error>) + Send + 'static>(
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

pub struct NotificationHandleMacOS {
    id: Retained<NSString>, // idea use normal rust string
}

impl NotificationHandleMacOS {
    fn new(id: Retained<NSString>) -> Self {
        Self { id }
    }
}

impl NotificationHandle for NotificationHandleMacOS {
    fn close(&self) -> Result<(), Error> {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;

        let id = self.id.clone();
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

// /// Get all deliverd notifications from UNUserNotificationCenter that are still active,
// /// so they can be removed. (they might be from last session)
// ///
// /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getdeliverednotifications(completionhandler:)
// async fn get_active_notifications() -> Result<Vec<NotificationHandleMacOS>, Error> {
//     todo!();
// }
//

pub fn remove_delivered_notifications(ids: Vec<&str>) -> Result<(), Error> {
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

// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/requestauthorization(options:completionhandler:)
pub fn first_time_ask_for_notification_permission()
-> Result<tokio::sync::oneshot::Receiver<Result<bool, Error>>, Error> {
    unsafe {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;
        NSBundle::mainBundle()
            .bundleIdentifier()
            .ok_or(Error::NoBundleId)?;

        // this needs to be fetched async instead via
        //  UNUserNotificationCenter::currentNotificationCenter().getNotificationSettingsWithCompletionHandler(completion_handler);
        // let notification_settings = UNNotificationSettings::new();
        // let auth_status = notification_settings.authorizationStatus();
        // if auth_status == UNAuthorizationStatus::NotDetermined {
        //     log::info!("first time asking for notification permission");
        // }
        // println!("1 {auth_status:?}");

        let (tx, rx) = tokio::sync::oneshot::channel::<Result<bool, Error>>();

        let cb = RefCell::new(Some(tx));
        let block = block2::RcBlock::new(move |authorized: Bool, error: *mut NSError| {
            if let Some(cb) = cb.take() {
                let result: Result<bool, Error> = if error.is_null() {
                    Ok(authorized.as_bool())
                } else {
                    if let Some(err_ref) = error.as_ref() {
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
        UNUserNotificationCenter::currentNotificationCenter()
            .requestAuthorizationWithOptions_completionHandler(options, &block);
        Ok(rx)
    }
}

// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getnotificationsettings(completionhandler:)
pub fn get_notification_permission_state<F: FnOnce(bool) + Send + 'static>(
    cb: F,
) -> Result<(), Error> {
    unsafe {
        MainThreadMarker::new().ok_or(Error::NotMainThread)?;
        NSBundle::mainBundle()
            .bundleIdentifier()
            .ok_or(Error::NoBundleId)?;
        let cb = RefCell::new(Some(cb));
        let block = block2::RcBlock::new(move |settings: NonNull<UNNotificationSettings>| {
            if let Some(cb) = cb.take() {
                let auth_status = settings.as_ref().authorizationStatus();
                let authorized = match auth_status {
                    UNAuthorizationStatus::Authorized
                    | UNAuthorizationStatus::Provisional
                    | UNAuthorizationStatus::Ephemeral => true,
                    UNAuthorizationStatus::Denied | UNAuthorizationStatus::NotDetermined => false,
                    _ => {
                        log::error!("Unknown Authorisation status: {auth_status:?}");
                        false
                    }
                };
                cb(authorized)
            }
        });
        UNUserNotificationCenter::currentNotificationCenter()
            .getNotificationSettingsWithCompletionHandler(&block);
    }
    Ok(())
}

#[derive(Clone)]
pub struct Ivars {
    // example var to try out ivars, TODO replace this by sth more useful like a channel to extract notifications to
    pub notification_count: RefCell<usize>,
}

// for info on how to use the macro see
// - https://docs.rs/objc2/latest/objc2/#example
//
define_class!(
    // SAFETY:
    // - The superclass NSObject does not have any subclassing requirements.
    // - `UserNotificationDelegate` does not implement `Drop`.
    #[unsafe(super(NSObject))]
    #[ivars = Ivars]
    #[name = "TauriNotificationDelegate"]
    #[thread_kind = MainThreadOnly]
    pub struct NotificationDelegate;

    impl NotificationDelegate {}

    unsafe impl NSObjectProtocol for NotificationDelegate {}

    unsafe impl UNUserNotificationCenterDelegate for NotificationDelegate {
        #[unsafe(method(userNotificationCenter:willPresentNotification:withCompletionHandler:))]
        fn will_present_notification(
            &self,
            _center: &UNUserNotificationCenter,
            _notification: &UNNotification,
            completion_handler: &block2::Block<dyn Fn(UNNotificationPresentationOptions)>,
        ) {
            log::debug!("triggered `userNotificationCenter:willPresentNotification:withCompletionHandler:`");
            let presentation_options = UNNotificationPresentationOptions::empty()
                .union(UNNotificationPresentationOptions::Badge)
                .union(UNNotificationPresentationOptions::Banner)
                .union(UNNotificationPresentationOptions::Sound);
            completion_handler.call((presentation_options,));
            log::debug!("completed `userNotificationCenter:willPresentNotification:withCompletionHandler:`");
        }
        #[unsafe(method(userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:))]
        unsafe fn did_receive_notification_response(
            &self,
            _center: &UNUserNotificationCenter,
            response: &UNNotificationResponse,
            completion_handler: &block2::Block<dyn Fn()>,
        ) {
            // listen for it and log it here, then the todo is to get it out of here
            // probably give a channel with ivars
            log::info!("did_receive_notification_response {response:?}");

            self.ivars().notification_count.replace_with(|&mut old| old + 1);
            log::info!("thusfar user interacted with {} notifications", self.ivars().notification_count.borrow());

            completion_handler.call(());
        }
    }
);

impl NotificationDelegate {
    pub fn new(mtm: MainThreadMarker) -> Retained<Self> {
        let this = Self::alloc(mtm).set_ivars(Ivars {
            notification_count: RefCell::new(0),
        });
        unsafe { msg_send![super(this), init] }
    }
}

impl Drop for NotificationDelegate {
    fn drop(&mut self) {
        panic!("dropped NotificationDelegate")
    }
}

#[derive(Debug)]
pub struct NotificationManager {
    /// reference to the delegate so that it isn't dropped immitiately
    delegate_reference:
        SendWrapper<OnceCell<Retained<ProtocolObject<dyn UNUserNotificationCenterDelegate>>>>,
}

impl NotificationManager {
    pub fn new() -> Self {
        log::debug!("NotificationManager.new called");
        Self {
            delegate_reference: SendWrapper::new(OnceCell::new()),
        }
    }

    // todo find out if it makes a difference when this is called
    pub fn register(&self) {
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
}
