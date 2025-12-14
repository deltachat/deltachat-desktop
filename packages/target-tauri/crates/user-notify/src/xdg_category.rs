/// Category for the notification
///
/// https://specifications.freedesktop.org/notification-spec/latest/categories.html
#[derive(Debug)]
pub enum XdgNotificationCategory {
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
    Custom(String),
}
