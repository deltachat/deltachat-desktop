use std::{collections::HashMap, path::PathBuf, sync::Arc};

use crate::Error;

// This is what every notification on all platforms has
pub trait NotificationBuilder<NManager>
where
    Self: Sized,
    NManager: NotificationManager,
{
    fn new() -> Self;
    /// main content of notification
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/body](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/body)
    /// - Linux / XDG: [body](https://specifications.freedesktop.org/notification-spec/latest/basic-design.html#:~:text=This%20is%20a%20multi,the%20summary%20is%20displayed.)
    /// - Windows: [text2](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text2)
    fn body(self, body: &str) -> Self;
    /// primary description of notification
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/title](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/title)
    /// - Linux / XDG: [summary](https://specifications.freedesktop.org/notification-spec/latest/basic-design.html#:~:text=This%20is%20a,using%20UTF%2D8.)
    /// - Windows: [text2](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text2)
    fn title(self, title: &str) -> Self;
    /// Sets secondary description of Notification
    ///
    /// Plaform specific:
    /// - MacOS [UNNotificationContent/subtitle](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/subtitle)
    /// - Linux / XDG: **not suported!**
    /// - Windows [text1](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text1)
    fn subtitle(self, subtitle: &str) -> Self;

    // IDEA: actions, aka buttons
    // IDEA: sound support

    /// Set Image Attachment
    ///
    /// Plaform specific:
    /// - MacOS: passed by file path, must be gif, jpg, or png
    /// - For linux the file is read and transfered over dbus (in case you are in a flatpak and it can't read from files) ["image-data"](https://specifications.freedesktop.org/notification-spec/latest/icons-and-images.html#icons-and-images-formats)
    /// - Windows: passed by file path. [image](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.image)
    fn set_image(self, path: PathBuf) -> Result<Self, Error>;

    /// Set App icon
    ///
    /// Plaform specific:
    /// - MacOS: not supported to change the app icon?
    /// - For linux the file is read and transfered over dbus (in case you are in a flatpak and it can't read from files) [app_icon](https://specifications.freedesktop.org/notification-spec/latest/icons-and-images.html#icons-and-images-formats)
    /// - Windows not implemented yet because it already uses the app icon
    fn set_icon(self, path: PathBuf) -> Result<Self, Error>;

    /// Set Thread id, this is used to group related notifications
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/threadIdentifier](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/threadidentifier)
    /// - Linux not specified yet:
    /// - Windows: not implemented
    fn set_thread_id(self, thread_id: &str) -> Self;

    // IDEA: convinience methods? but I believe a generic callback is better in which you get [NotificationResponse]
    // and identify the notification based on id or userinfo is better
    // because then your notifications will also work across sessions (atleast on macOS)
    //
    // if we make this convinience methods we would store them then:
    // - document that you should probably use the other way, because thes don't work across sessions
    // - save them in the manager like the emulated user_info
    //
    // fn on_click(self, cb: Box<dyn Fn() + Send + Sync>) -> Self;
    // fn on_close(self, cb: Box<dyn Fn() + Send + Sync>) -> Self;

    /// set metadata for a notification
    ///
    /// ## Platform Specific
    /// - on MacOS this uses UserInfo field in the notification content, so it works accross sessions
    /// - TODO: on other platforms we emulate this by storing this info inside of NotificationManager
    fn set_user_info(self, user_info: HashMap<String, String>) -> Self;

    /// Shows notification and returns Notification handle
    fn show(
        self,
        manager: Arc<NManager>,
    ) -> impl std::future::Future<Output = Result<impl NotificationHandle, Error>>;
}

// Handle to a sent notification
pub trait NotificationHandle
where
    Self: Send + Sync,
{
    /// close the notification
    fn close(&self) -> Result<(), Error>;

    fn get_id(&self) -> String;
}

// https://developer.apple.com/documentation/usernotifications/unnotificationcontent/targetcontentidentifier
// maybe offer a seperate api to catch notifications from previous sessions?
// https://github.com/deltachat/deltachat-desktop/issues/2438

pub trait NotificationManager
where
    Self: Send + Sync,
{
    /// Needs to be called from main thread
    fn get_notification_permission_state(
        &self,
    ) -> impl std::future::Future<Output = Result<bool, Error>>;

    /// Needs to be called from main thread
    fn first_time_ask_for_notification_permission(
        &self,
    ) -> impl std::future::Future<Output = Result<bool, Error>>;

    fn register(&self);

    /// Removes all of your app’s delivered notifications from Notification Center.
    ///
    /// ## Platform specific:
    /// - MacOS: [UNUserNotificationCenter.removeAllDeliveredNotifications](https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/removealldeliverednotifications())
    fn remove_all_delivered_notifications(&self) -> Result<(), Error>;

    /// Removes specific delivered notifications by their id from Notification Center.
    fn remove_delivered_notifications(&self, ids: Vec<&str>) -> Result<(), Error>;

    /// Get all deliverd notifications from UNUserNotificationCenter that are still active.
    ///
    /// ## Platform specific:
    /// - MacOS:
    ///   - also includes notifications from previous sessions
    ///   - [UNUserNotificationCenter.getDeliveredNotificationsWithCompletionHandler](https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/getdeliverednotifications(completionhandler:))
    /// - Others: TODO: implemented/emulated by keeping track of all notifications in memory
    fn get_active_notifications(
        &self,
    ) -> impl std::future::Future<Output = Result<Vec<impl NotificationHandle>, Error>>;

    /// Set a function to handle user responses (clicking notification, closing it, clicking an action on it)
    fn set_user_response_handler(
        &self,
        handler_callback: impl Fn(NotificationResponse) + Send + Sync,
    );
}

/// Emmited when user clicked on a notification
///
/// ## Platform-specific
///
/// - **macOS**: https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate/usernotificationcenter(_:didreceive:withcompletionhandler:)?language=objc
/// - **Other**: Unsupported.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq)]
pub struct NotificationResponse {
    /// id of the notification that was assigned by the system
    pub notification_id: String,
    pub action: NotificationResponseAction,
    /// The text that the user typed in as reponse
    ///
    /// corresponds to [UNTextInputNotificationResponse.userText](https://developer.apple.com/documentation/usernotifications/untextinputnotificationresponse/usertext?language=objc)
    pub user_text: Option<String>,

    pub user_info: HashMap<String, String>,
}

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq)]
pub enum NotificationResponseAction {
    /// When user clicks on the notification
    ///
    /// ## Platform Specific
    /// - MacOS: corresponds to [UNNotificationDefaultActionIdentifier](https://developer.apple.com/documentation/usernotifications/unnotificationdefaultactionidentifier?language=objc)
    Default,
    /// When user closes the notification
    ///
    /// ## Platform Specific
    /// - MacOS: corresponds to [UNNotificationDismissActionIdentifier](https://developer.apple.com/documentation/usernotifications/unnotificationdismissactionidentifier?language=objc)
    Dismiss,
    /// The identifier string of the action that the user selected, if it is not one of the other actions in [NotificationResponseAction]
    Other(String),
}
