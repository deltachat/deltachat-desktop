use std::{cell::RefCell, collections::HashMap};

use objc2::{DefinedClass, MainThreadMarker, MainThreadOnly, define_class, msg_send, rc::Retained};
use objc2_foundation::{NSObject, NSObjectProtocol};
use objc2_user_notifications::{
    UNNotification, UNNotificationDefaultActionIdentifier, UNNotificationDismissActionIdentifier,
    UNNotificationPresentationOptions, UNNotificationResponse, UNTextInputNotificationResponse,
    UNUserNotificationCenter, UNUserNotificationCenterDelegate,
};

use crate::{NotificationResponse, NotificationResponseAction};

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
            // TODO convert these debug statements into trace
            log::debug!("triggered `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`");
            // listen for it and log it here, then the todo is to get it out of here
            // probably give a channel with ivars
            log::debug!("did_receive_notification_response {response:?}");

            self.ivars().notification_count.replace_with(|&mut old| old + 1);
            log::info!("thusfar user interacted with {} notifications", self.ivars().notification_count.borrow());

            unsafe {
              let action_id = response.actionIdentifier();
              let action: NotificationResponseAction = match &*action_id {
                a if a == UNNotificationDefaultActionIdentifier => NotificationResponseAction::Default,
                a if a == UNNotificationDismissActionIdentifier => NotificationResponseAction::Dismiss,
                _ => NotificationResponseAction::Other(action_id.to_string()),
              };

              let user_text = response
                .downcast_ref::<UNTextInputNotificationResponse>()
                .map(|text_response| text_response.userText().to_string());

              let notification = response.notification();

              let notification_id = notification.request().identifier().to_string();


              let event = NotificationResponse {
                  notification_id,
                  action,
                  user_text,
                  user_info: HashMap::new() // TODO: maybe just use a well known key and allow all serde json values
              };
              log::debug!("NotificationResponse {event:?}");

              // TODO somehow pass events to the handler (I thought a tokio channel and worker that listens for those events would be nice, or just classical channel and thread?)
            }

            completion_handler.call(());

            log::debug!("completed `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`");
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
