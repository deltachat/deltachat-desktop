use std::{collections::HashMap, fmt::Debug, path::PathBuf};

use async_trait::async_trait;

use crate::{Error, xdg_category::XdgNotificationCategory};

#[derive(Debug, Default)]
pub struct NotificationBuilder {
    pub(crate) body: Option<String>,
    pub(crate) title: Option<String>,
    pub(crate) subtitle: Option<String>,
    pub(crate) image: Option<std::path::PathBuf>,
    pub(crate) icon: Option<std::path::PathBuf>,
    pub(crate) icon_round_crop: bool,
    pub(crate) thread_id: Option<String>,
    pub(crate) category_id: Option<String>,
    pub(crate) xdg_category: Option<XdgNotificationCategory>,
    pub(crate) xdg_app_name: Option<String>,
    pub(crate) user_info: Option<HashMap<String, String>>,
}

impl NotificationBuilder
where
    Self: Sized,
{
    pub fn new() -> Self {
        NotificationBuilder {
            ..Default::default()
        }
    }
    /// main content of notification
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/body](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/body)
    /// - Linux / XDG: [body](https://specifications.freedesktop.org/notification-spec/latest/basic-design.html#:~:text=This%20is%20a%20multi,the%20summary%20is%20displayed.)
    /// - Windows: [text2](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text2)
    pub fn body(mut self, body: &str) -> Self {
        self.body = Some(body.to_owned());
        self
    }
    /// primary description of notification
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/title](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/title)
    /// - Linux / XDG: [summary](https://specifications.freedesktop.org/notification-spec/latest/basic-design.html#:~:text=This%20is%20a,using%20UTF%2D8.)
    /// - Windows: [text2](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text2)
    pub fn title(mut self, title: &str) -> Self {
        self.title = Some(title.to_owned());
        self
    }
    /// Sets secondary description of Notification
    ///
    /// Plaform specific:
    /// - MacOS [UNNotificationContent/subtitle](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/subtitle)
    /// - Linux / XDG: **not suported!**
    /// - Windows [text1](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.text1)
    pub fn subtitle(mut self, subtitle: &str) -> Self {
        self.subtitle = Some(subtitle.to_owned());
        self
    }

    // IDEA: sound support

    /// Set Image Attachment
    ///
    /// Plaform specific:
    /// - MacOS: passed by file path, must be gif, jpg, or png
    /// - For linux the file is read and transfered over dbus (in case you are in a flatpak and it can't read from files) ["image-data"](https://specifications.freedesktop.org/notification-spec/latest/icons-and-images.html#icons-and-images-formats)
    /// - Windows: passed by file path. [image](https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html#method.image)
    pub fn set_image(mut self, path: PathBuf) -> Self {
        self.image = Some(path);
        self
    }

    /// Set App icon
    ///
    /// Plaform specific:
    /// - MacOS: not supported to change the app icon?
    /// - For linux the file is read and transfered over dbus (in case you are in a flatpak and it can't read from files) [app_icon](https://specifications.freedesktop.org/notification-spec/latest/icons-and-images.html#icons-and-images-formats)
    /// - Windows: [`<image placement="appLogoOverride" />`](https://learn.microsoft.com/uwp/schemas/tiles/toastschema/element-image)
    pub fn set_icon(mut self, path: PathBuf) -> Self {
        self.icon = Some(path);
        self
    }

    /// Set App icon to be round
    ///
    /// Plaform specific:
    /// - MacOS: not supported
    /// - Linux: not supported
    /// - Windows: [`<image placement='appLogoOverride' hint-crop='circle' />`](https://learn.microsoft.com/uwp/schemas/tiles/toastschema/element-image)
    pub fn set_icon_round_crop(mut self, icon_round_crop: bool) -> Self {
        self.icon_round_crop = icon_round_crop;
        self
    }

    /// Set Thread id, this is used to group related notifications
    ///
    /// Plaform specific:
    /// - MacOS: [UNNotificationContent/threadIdentifier](https://developer.apple.com/documentation/usernotifications/unnotificationcontent/threadidentifier)
    /// - Linux not specified yet:
    /// - Windows: not supported
    pub fn set_thread_id(mut self, thread_id: &str) -> Self {
        self.thread_id = Some(thread_id.to_owned());
        self
    }

    /// Set the notification Category, those are basically templates how the notification should be displayed
    ///
    /// It is used to add a text field or buttons to the notification.
    ///
    /// Categories are defined by passing them to [NotificationManager::register] on app startup
    pub fn set_category_id(mut self, category_id: &str) -> Self {
        self.category_id = Some(category_id.to_owned());
        self
    }

    /// Set the xdg notification Category
    ///
    /// The type of notification this is acording to https://specifications.freedesktop.org/notification-spec/latest/categories.html
    ///
    /// Platform specific: only work on linux, this does nothing on other platforms
    pub fn set_xdg_category(mut self, category: XdgNotificationCategory) -> Self {
        self.xdg_category = Some(category);
        self
    }

    /// Set the xdg App Name
    ///
    /// Platform specific: only work on linux, this does nothing on other platforms
    pub fn set_xdg_app_name(mut self, name: String) -> Self {
        self.xdg_app_name = Some(name);
        self
    }

    /// set metadata for a notification
    ///
    /// ## Platform Specific
    /// - on MacOS this uses UserInfo field in the notification content, so it works accross sessions
    /// - windows stores this in toast [NotificationData](https://learn.microsoft.com/en-us/uwp/api/windows.ui.notifications.notificationdata?view=winrt-26100)
    /// - linux: on linux we emulate this by storing this info inside of NotificationManager
    pub fn set_user_info(mut self, user_info: HashMap<String, String>) -> Self {
        self.user_info = Some(user_info);
        self
    }
}

// Handle to a sent notification
pub trait NotificationHandle
where
    Self: Send + Sync + Debug,
{
    /// close the notification
    fn close(&self) -> Result<(), Error>;

    fn get_id(&self) -> String;

    fn get_user_info(&self) -> &HashMap<String, String>;
}

// https://developer.apple.com/documentation/usernotifications/unnotificationcontent/targetcontentidentifier
// maybe offer a seperate api to catch notifications from previous sessions?
// https://github.com/deltachat/deltachat-desktop/issues/2438

#[async_trait]
pub trait NotificationManager
where
    Self: Send + Sync + Debug,
{
    /// Needs to be called from main thread
    async fn get_notification_permission_state(&self) -> Result<bool, crate::Error>;

    /// Needs to be called from main thread
    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, Error>;

    /// registers and initializes the notification handler and categories.
    /// Set a function to handle user responses (clicking notification, closing it, clicking an action on it)
    ///
    /// ## Platform specific:
    /// - MacOS: sets the UNUserNotificationCenterDelegate
    fn register(
        &self,
        handler_callback: Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>,
        categories: Vec<NotificationCategory>,
    ) -> Result<(), Error>;

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
    async fn get_active_notifications(&self) -> Result<Vec<Box<dyn NotificationHandle>>, Error>;

    /// Shows notification and returns Notification handle
    async fn send_notification(
        &self,
        builder: NotificationBuilder,
    ) -> Result<Box<dyn NotificationHandle>, Error>;
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

/// Notification Categories are used to define actions for notifications that have this category set
#[derive(Debug, Clone)]
pub struct NotificationCategory {
    /// Id of the category by which it is referenced on notifications [NotificationBuilder::set_category_id]
    pub identifier: String,
    /// The actions to display when the system delivers notifications of this type.
    pub actions: Vec<NotificationCategoryAction>,
}

#[derive(Debug, Clone)]
pub enum NotificationCategoryAction {
    /// ## Platform specific
    /// https://developer.apple.com/documentation/usernotifications/unnotificationaction?language=objc
    Action {
        identifier: String,
        title: String,
        /* IDEA: also support icon https://developer.apple.com/documentation/usernotifications/unnotificationaction/init(identifier:title:options:icon:)?language=objc */
    },
    TextInputAction {
        identifier: String,
        title: String,
        /* IDEA: also support icon and option https://developer.apple.com/documentation/usernotifications/untextinputnotificationaction/init(identifier:title:options:textinputbuttontitle:textinputplaceholder:)?language=objc */
        input_button_title: String,
        input_placeholder: String,
    },
}
