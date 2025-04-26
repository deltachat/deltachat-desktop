/// Category for the notification
///
/// https://specifications.freedesktop.org/notification-spec/latest/categories.html
pub enum NotificationCategory {
    /// A generic audio or video call notification that doesn't fit into any other category.
    Call,
    /// An audio or video call was ended.
    CallEnded,
    /// A audio or video call is incoming.
    CallIncoming,
    /// An incoming audio or video call was not answered.
    CallUnanswered,
    /// A generic device-related notification that doesn't fit into any other category.
    Device,
    /// A device, such as a USB device, was added to the system.
    DeviceAdded,
    /// A device had some kind of error.
    DeviceError,
    /// A device, such as a USB device, was removed from the system.
    DeviceRemoved,
    /// A generic e-mail-related notification that doesn't fit into any other category.
    Email,
    /// A new e-mail notification.
    EmailArrived,
    /// A notification stating that an e-mail has bounced.
    EmailBounced,
    /// A generic instant message-related notification that doesn't fit into any other category.
    Im,
    /// An instant message error notification.
    ImError,
    /// A received instant message notification.
    ImReceived,
    /// A generic network notification that doesn't fit into any other category.
    Network,
    /// A network connection notification, such as successful sign-on to a network service. This should not be confused with `device.added` for new network devices.
    NetworkConnected,
    /// A network disconnected notification. This should not be confused with `device.removed` for disconnected network devices.
    NetworkDisconnected,
    /// A network-related or connection-related error.
    NetworkError,
    /// A generic presence change notification that doesn't fit into any other category, such as going away or idle.
    Presence,
    /// An offline presence change notification.
    PresenceOffline,
    /// An online presence change notification.
    PresenceOnline,
    /// A generic file transfer or download notification that doesn't fit into any other category.
    Transfer,
    /// A file transfer or download complete notification.
    TransferComplete,
    /// A file transfer or download error.
    TransferError,
    /// Allows custom Category
    /// If it is not standard, then category should be in the form of "x-vendor.class.name."
    Custom(&str),
}

impl NotificationCategory {
    pub fn to_string(self) -> String {
        match self {
            Call => "call",
            CallEnded => "call.ended",
            CallIncoming => "call.incoming",
            Device => "device",
            DeviceAdded => "device.added",
            DeviceError => "device.error",
            DeviceRemoved => "device.removed",
            Email => "email",
            EmailArrived => "email.arrived",
            EmailBounced => "email.bounced",
            Im => "im",
            ImError => "im.error",
            ImReceived => "im.received",
            Network => "network",
            NetworkConnected => "network.connected",
            NetworkDisconnected => "network.disconnected",
            NetworkError => "network.error",
            Presence => "presence",
            PresenceOffline => "presence.offline",
            PresenceOnline => "presence.online",
            Transfer => "transfer",
            TransferComplete => "transfer.complete",
            TransferError => "transfer.error",
            Custom(category) => category,
        }
        .to_owned()
    }
}

pub trait NotificationBuilderExtXdg {
    /// The type of notification this is.
    /// https://specifications.freedesktop.org/notification-spec/latest/categories.html
    fn category_hint(self, category: Category) -> Self;
}

pub struct XdgNotificationBuilder {
    notification_builder: notify_rust::Notification,
}

impl NotificationBuilder for XdgNotificationBuilder {
    fn new() -> Self {
        let notification_builder = notify_rust::Notification::new()
            .auto_icon()
            // As said in the readme all notifications are persistent
            .hint(Hint::Resident(true))
            .timeout(0);

        XdgNotificationBuilder {
            notification_builder,
        }
    }

    fn set_thread_id(self, thread_id: &str) -> Self {
        // does not exist in xdg spec yet: https://github.com/flatpak/xdg-desktop-portal/discussions/1495
        self
    }
}

impl NotificationBuilderExtXdg for XdgNotificationBuilder {
    fn category_hint(self, category: Category) {
        self.notification_builder = notification_builder.hint(Hint::Category(category.to_string()));
        self
    }
}
