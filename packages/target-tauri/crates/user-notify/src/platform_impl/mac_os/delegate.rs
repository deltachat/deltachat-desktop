use objc2::{DefinedClass, MainThreadMarker, MainThreadOnly, define_class, msg_send, rc::Retained};
use objc2_foundation::{NSObject, NSObjectProtocol};
use objc2_user_notifications::{
    UNNotification, UNNotificationDefaultActionIdentifier, UNNotificationDismissActionIdentifier,
    UNNotificationPresentationOptions, UNNotificationResponse, UNTextInputNotificationResponse,
    UNUserNotificationCenter, UNUserNotificationCenterDelegate,
};
use tokio::sync::mpsc::Sender;

use crate::{NotificationResponse, NotificationResponseAction};

use super::manager::user_info_dictionary_to_hashmap;

#[derive(Clone)]
pub struct Ivars {
    pub sender: Sender<NotificationResponse>,
}

// for info on how to use the macro see
// - https://docs.rs/objc2/latest/objc2/#example
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

              let request = notification.request();
              let notification_id = request.identifier().to_string();

              let user_info = user_info_dictionary_to_hashmap(request.content().userInfo());

              let event = NotificationResponse {
                  notification_id,
                  action,
                  user_text,
                  user_info
              };
              log::debug!("NotificationResponse {event:?}");

                if let Err(err) = self.ivars().sender.try_send(event) {
                    log::error!("Failed to send notification to handler: {err:?}");
                }
            }

            completion_handler.call(());

            log::debug!("completed `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`");
        }
    }
);

impl NotificationDelegate {
    pub fn new(mtm: MainThreadMarker, tx: Sender<NotificationResponse>) -> Retained<Self> {
        let this = Self::alloc(mtm).set_ivars(Ivars { sender: tx });
        unsafe { msg_send![super(this), init] }
    }
}

impl Drop for NotificationDelegate {
    fn drop(&mut self) {
        panic!("dropped NotificationDelegate")
    }
}
