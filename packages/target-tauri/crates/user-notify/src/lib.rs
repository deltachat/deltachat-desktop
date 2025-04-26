mod error;
mod notification;
mod platform_impl;

use std::sync::Arc;

pub use error::Error;
pub use notification::*;
pub use platform_impl::*;

pub fn get_notification_manager() -> Arc<dyn NotificationManager> {
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
        todo!();
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
        todo!();
    }
}
