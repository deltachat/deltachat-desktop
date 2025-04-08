use std::path::PathBuf;

use crate::Error;

// This is what every notification on all platforms has
pub trait NotificationBuilder
where
    Self: Sized,
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

    fn on_click(self, cb: Box<dyn Fn() + Send + Sync>) -> Self;

    fn on_close(self, cb: Box<dyn Fn() + Send + Sync>) -> Self;

    /// Shows notification and returns Notification handle
    fn show(self) -> impl std::future::Future<Output = Result<impl NotificationHandle, Error>>;
}

// Handle to a sent notification
pub trait NotificationHandle {
    /// close the notification
    fn close(&self) -> Result<(), Error>;

    fn get_id(&self) -> String;
}

// https://developer.apple.com/documentation/usernotifications/unnotificationcontent/targetcontentidentifier
// maybe offer a seperate api to catch notifications from previous sessions?
// https://github.com/deltachat/deltachat-desktop/issues/2438
