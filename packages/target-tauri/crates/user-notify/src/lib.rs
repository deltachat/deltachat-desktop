mod error;
mod notification;
mod platform_impl;
mod xdg_category;

use std::sync::Arc;

pub use error::Error;
pub use notification::*;
pub use platform_impl::*;
pub use xdg_category::*;

/// Get the notification manager for the platform
///
/// app_id and notification_protocol are only used on windows
#[allow(unused_variables)]
pub fn get_notification_manager(
    app_id: String,
    notification_protocol: Option<String>,
) -> Arc<dyn NotificationManager> {
    #[cfg(target_os = "macos")]
    {
        use objc2_foundation::NSBundle;
        if unsafe { NSBundle::mainBundle().bundleIdentifier().is_none() } {
            return Arc::new(platform_impl::mock::NotificationManagerMock::new())
                as Arc<dyn NotificationManager>;
        }
        Arc::new(platform_impl::mac_os::NotificationManagerMacOS::new())
            as Arc<dyn NotificationManager>
    }
    #[cfg(target_os = "windows")]
    {
        use ::windows::core::HSTRING;
        match ::windows::UI::Notifications::ToastNotificationManager::CreateToastNotifierWithId(
            &HSTRING::from(&app_id),
        ) {
            Ok(_tf) => Arc::new(platform_impl::windows::NotificationManagerWindows::new(
                app_id.clone(),
                notification_protocol,
            )) as Arc<dyn NotificationManager>,
            Err(err) => {
                log::error!(
                    "failed to get toast notifier for {app_id}, falling back to mock notifification manager: {err:?}"
                );
                Arc::new(platform_impl::mock::NotificationManagerMock::new())
                    as Arc<dyn NotificationManager>
            }
        }
    }
    #[cfg(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "openbsd",
        target_os = "netbsd"
    ))]
    {
        // user_notify::xdg::NotificationBuilderXdg::new()
        //     .category_hint(user_notify::xdg::NotificationCategory::ImReceived)
        //     .appname("Delta Chat")
        Arc::new(platform_impl::xdg::NotificationManagerXdg::new()) as Arc<dyn NotificationManager>
    }
}
