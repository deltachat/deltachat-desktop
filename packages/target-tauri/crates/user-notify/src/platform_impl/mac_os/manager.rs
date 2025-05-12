use std::cell::{OnceCell, RefCell};
use std::ops::Deref;
use std::sync::Arc;
use std::thread;
use std::{collections::HashMap, ptr::NonNull};

use async_trait::async_trait;
use objc2::Message;
use objc2::runtime::{AnyObject, ProtocolObject};
use send_wrapper::SendWrapper;

use objc2::{MainThreadMarker, rc::Retained, runtime::Bool};
use objc2_foundation::{NSArray, NSBundle, NSDictionary, NSError, NSSet, NSString};
use objc2_user_notifications::{
    UNAuthorizationOptions, UNAuthorizationStatus, UNNotification, UNNotificationAction,
    UNNotificationActionOptions, UNNotificationCategory, UNNotificationCategoryOptions,
    UNNotificationRequest, UNNotificationSettings, UNTextInputNotificationAction,
    UNUserNotificationCenter, UNUserNotificationCenterDelegate,
};

use crate::{Error, NotificationManager, mac_os::delegate::NotificationDelegate};
use crate::{NotificationBuilder, NotificationCategory, NotificationHandle, NotificationResponse};

use super::builder::build_and_send;
use super::handle::NotificationHandleMacOS;

#[derive(Debug)]
pub struct NotificationManagerMacOSInner {
    /// reference to the delegate so that it isn't dropped immitiately
    delegate_reference:
        SendWrapper<OnceCell<Retained<ProtocolObject<dyn UNUserNotificationCenterDelegate>>>>,
    listener_loop: SendWrapper<OnceCell<thread::JoinHandle<()>>>,
    pub(crate) bundle_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct NotificationManagerMacOS {
    pub(super) inner: Arc<NotificationManagerMacOSInner>,
}

impl NotificationManagerMacOS {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        log::debug!("NotificationManager.new called");
        Self {
            inner: Arc::new(NotificationManagerMacOSInner {
                delegate_reference: SendWrapper::new(OnceCell::new()),
                listener_loop: SendWrapper::new(OnceCell::new()),
                bundle_id: unsafe {
                    NSBundle::mainBundle()
                        .bundleIdentifier()
                        .map(|ns_string| ns_string.to_string())
                },
            }),
        }
    }
    /// adds a notification to the notification center
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

#[async_trait]
impl NotificationManager for NotificationManagerMacOS {
    /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getnotificationsettings(completionhandler:)
    async fn get_notification_permission_state(&self) -> Result<bool, Error> {
        self.inner.bundle_id.as_ref().ok_or(Error::NoBundleId)?;
        let (tx, rx) = tokio::sync::oneshot::channel::<bool>();
        unsafe {
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
                    if cb.send(authorized).is_err() {
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
    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, Error> {
        self.inner.bundle_id.as_ref().ok_or(Error::NoBundleId)?;
        let (tx, rx) = tokio::sync::oneshot::channel::<Result<bool, Error>>();

        #[inline]
        fn request_autorization(tx: tokio::sync::oneshot::Sender<Result<bool, Error>>) {
            let cb = RefCell::new(Some(tx));
            let block = block2::RcBlock::new(move |authorized: Bool, error: *mut NSError| {
                if let Some(cb) = cb.take() {
                    let result: Result<bool, Error> = if error.is_null() {
                        Ok(authorized.as_bool())
                    } else if let Some(err_ref) = unsafe { error.as_ref() } {
                        let description = err_ref.localizedDescription();
                        Err(Error::NSError(description.to_string()))
                    } else {
                        Err(Error::NSError("Failed to read error".to_string()))
                    };
                    if cb.send(result).is_err() {
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

    // TODO find out if it makes a difference when this is called
    // - does it handle notifications of previus sessions just fine?
    fn register(
        &self,
        handler_callback: Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>,
        categories: Vec<NotificationCategory>,
    ) -> Result<(), crate::Error> {
        log::debug!("NotificationManager.register called");
        let mtm = MainThreadMarker::new().expect("not on main thread");
        let (tx, mut rx) = tokio::sync::mpsc::channel::<NotificationResponse>(10);
        let notification_delegate = NotificationDelegate::new(mtm, tx);
        unsafe {
            let proto: Retained<ProtocolObject<dyn UNUserNotificationCenterDelegate>> =
                ProtocolObject::from_retained(notification_delegate);

            let notification_center = UNUserNotificationCenter::currentNotificationCenter();
            notification_center.setDelegate(Some(&*proto));

            self.inner.delegate_reference
                .set(proto)
                .expect("failed to set delegate_reference, did you call register multiple times so that the once_cell was already taken?");

            let categories: Retained<NSSet<_>> = categories
                .into_iter()
                .map(|category| W(category_to_native_category(category)))
                .collect();
            notification_center.setNotificationCategories(&categories);

            let handler_loop = thread::spawn(move || {
                while let Some(response) = rx.blocking_recv() {
                    handler_callback(response)
                }
            });
            self.inner.listener_loop.set(handler_loop).expect("failed to set delegate_reference, did you call register multiple times so that the once_cell was already taken?");
        }
        log::debug!("NotificationManager.register completed");
        Ok(())
    }

    /// Removes all of your app’s delivered notifications from Notification Center.
    ///
    /// https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/removealldeliverednotifications()
    fn remove_all_delivered_notifications(&self) -> Result<(), Error> {
        self.inner.bundle_id.as_ref().ok_or(Error::NoBundleId)?;

        unsafe {
            UNUserNotificationCenter::currentNotificationCenter().removeAllDeliveredNotifications();
        }
        Ok(())
    }

    fn remove_delivered_notifications(&self, ids: Vec<&str>) -> Result<(), Error> {
        self.inner.bundle_id.as_ref().ok_or(Error::NoBundleId)?;

        let ids: Vec<_> = ids.iter().map(|s| NSString::from_str(s)).collect();
        let array: Retained<NSArray<NSString>> = NSArray::from_retained_slice(ids.as_slice());

        unsafe {
            UNUserNotificationCenter::currentNotificationCenter()
                .removeDeliveredNotificationsWithIdentifiers(&array);
        }
        Ok(())
    }

    async fn get_active_notifications(&self) -> Result<Vec<Box<dyn NotificationHandle>>, Error> {
        self.inner.bundle_id.as_ref().ok_or(Error::NoBundleId)?;
        // https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getdeliverednotifications(completionhandler:)

        let (tx, rx) = tokio::sync::oneshot::channel::<Vec<NotificationHandleMacOS>>();

        #[inline]
        fn get_active_notifications_inner(
            tx: tokio::sync::oneshot::Sender<Vec<NotificationHandleMacOS>>,
        ) -> Result<(), Error> {
            let cb = RefCell::new(Some(tx));
            let completion_handler =
                block2::RcBlock::new(move |notifications: NonNull<NSArray<UNNotification>>| {
                    if let Some(cb) = cb.take() {
                        let notifications: &NSArray<UNNotification> =
                            unsafe { notifications.as_ref() };

                        let mut handles = Vec::with_capacity(notifications.count());
                        for item in notifications {
                            unsafe {
                                let request = item.request();
                                let id = request.identifier().to_string();

                                let user_info =
                                    user_info_dictionary_to_hashmap(request.content().userInfo());

                                handles.push(NotificationHandleMacOS::new(id, user_info));
                            }
                        }

                        if cb.send(handles).is_err() {
                            log::error!("the receiver dropped");
                        }
                    } else {
                        log::error!("tx was already taken out");
                    }
                });

            unsafe {
                UNUserNotificationCenter::currentNotificationCenter()
                    .getDeliveredNotificationsWithCompletionHandler(&completion_handler);
            }

            Ok(())
        }

        get_active_notifications_inner(tx)?;

        Ok(rx
            .await?
            .into_iter()
            .map(|n| Box::new(n) as Box<dyn NotificationHandle>)
            .collect())
    }

    async fn send_notification(
        &self,
        builder: NotificationBuilder,
    ) -> Result<Box<dyn NotificationHandle>, Error> {
        let (tx, rx) = tokio::sync::oneshot::channel::<Result<(), Error>>();
        let handle = build_and_send(builder, self, tx)?;
        rx.await??;
        Ok::<_, Error>(Box::new(handle) as Box<dyn NotificationHandle>)
    }
}

pub(crate) fn user_info_dictionary_to_hashmap(
    user_info: Retained<NSDictionary<AnyObject, AnyObject>>,
) -> HashMap<String, String> {
    let mut map = HashMap::new();
    let keys = user_info.allKeys();
    for key in keys {
        if let Some(key_ns_string) = key.downcast_ref::<NSString>() {
            if let Some(value) = user_info.objectForKey(key.deref()) {
                if let Some(value_ns_string) = value.downcast_ref::<NSString>() {
                    map.insert(key_ns_string.to_string(), value_ns_string.to_string());
                } else {
                    log::error!("value object failed to downcast to ns_string: {value:?}");
                    continue;
                }
            } else {
                log::error!("no value found fpr key {key:?}");
                continue;
            }
        } else {
            log::error!("key object failed to downcast to ns_string: {key:?}");
            continue;
        }
    }

    map
}

fn category_to_native_category(category: NotificationCategory) -> Retained<UNNotificationCategory> {
    let identifier = NSString::from_str(&category.identifier);

    let actions:Retained<_> = category
        .actions
        .iter()
        .map(|action| {
            use crate::NotificationCategoryAction::*;
            match action {
                Action { identifier, title } => {
                    let identifier = NSString::from_str(identifier);
                    let title = NSString::from_str(title);
                    unsafe {
                       W(UNNotificationAction::actionWithIdentifier_title_options(
                            &identifier,
                            &title,
                            UNNotificationActionOptions::empty(),
                        ))
                    }
                }
                TextInputAction {
                    identifier,
                    title,
                    input_button_title,
                    input_placeholder,
                } => {
                    let identifier = NSString::from_str(identifier);
                    let title = NSString::from_str(title);
                    let text_input_button_title = NSString::from_str(input_button_title);
                    let text_input_placeholder = NSString::from_str(input_placeholder);
                    unsafe {
                       W(  Retained::cast_unchecked::<UNNotificationAction>(
                        UNTextInputNotificationAction::actionWithIdentifier_title_options_textInputButtonTitle_textInputPlaceholder(
                            &identifier, &title, UNNotificationActionOptions::empty(), &text_input_button_title, &text_input_placeholder)))
                    }
                },
            }
        })
        .collect();

    unsafe {
        UNNotificationCategory::categoryWithIdentifier_actions_intentIdentifiers_options(
            &identifier,
            &actions,
            &NSArray::new(),
            UNNotificationCategoryOptions::empty(),
        )
    }
}

/// wrapper to bypass that the I can't implement traits for objc2's Retained here in this crate
struct W<T: ?Sized + Message>(Retained<T>);

impl<O: Message> FromIterator<W<O>> for Retained<NSArray<O>> {
    fn from_iter<T: IntoIterator<Item = W<O>>>(iter: T) -> Self {
        let vec: Vec<Retained<O>> = iter.into_iter().map(|o| o.0).collect();

        let array: Retained<NSArray<O>> = NSArray::from_slice(
            vec.iter()
                .map(|r| r.deref())
                .collect::<Vec<&O>>()
                .as_slice(),
        );
        array
    }
}

impl<O: Message> FromIterator<W<O>> for Retained<NSSet<O>> {
    fn from_iter<T: IntoIterator<Item = W<O>>>(iter: T) -> Self {
        let vec: Vec<Retained<O>> = iter.into_iter().map(|o| o.0).collect();

        let set: Retained<NSSet<O>> = NSSet::from_slice(
            vec.iter()
                .map(|r| r.deref())
                .collect::<Vec<&O>>()
                .as_slice(),
        );
        set
    }
}
