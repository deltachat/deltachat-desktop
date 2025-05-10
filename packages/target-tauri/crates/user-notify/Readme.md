## User Notifications

Simple library to implement all notification features that we need for delta tauri.

Notifications stay until they are closed by the user or by the app.

## Useful links

- macOS:
  - https://developer.apple.com/documentation/usernotifications
  - https://lib.rs/crates/objc2-user-notifications/features#feature-UNNotificationCategory
- Windows:
  - https://docs.rs/tauri-winrt-notification/latest/tauri_winrt_notification/struct.Toast.html
  - https://learn.microsoft.com/en-us/uwp/api/windows.ui.notifications.toastnotification
- xdg / Linux:
  - https://specifications.freedesktop.org/notification-spec/latest/protocol.html
  - https://github.com/hoodie/notify-rust

## Future

For the future we could consider to implement https://developer.apple.com/documentation/usernotifications/implementing-communication-notifications to show a user avatar in the notifications.
