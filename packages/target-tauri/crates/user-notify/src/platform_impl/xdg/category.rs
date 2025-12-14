use std::fmt::Display;

use crate::xdg_category::XdgNotificationCategory;

impl Display for XdgNotificationCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use XdgNotificationCategory::*;
        let category_string = match &self {
            Call => "call",
            CallEnded => "call.ended",
            CallIncoming => "call.incoming",
            CallUnanswered => "call.unanswered",
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
        };
        write!(f, "{category_string}")
    }
}
