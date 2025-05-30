use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Status {
    /// User allowed Access
    Granted,
    /// User was not asked yet.
    NotDetermined,
    /// User denied Access
    Denied,
    /// User can't grant access due to restrictions.
    Restricted,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PermissionKind {
    /// Camera
    Video,
    /// Microphone
    Audio,
}

#[derive(Debug)]
pub enum Error {
    UnsupportedPlatform,
}

#[cfg(target_vendor = "apple")]
mod apple;

pub fn check(permission: PermissionKind) -> Result<Status, Error> {
    #[cfg(target_vendor = "apple")]
    {
        apple::check(permission)
    }
    #[cfg(not(target_vendor = "apple"))]
    {
        Err(Error::UnsupportedPlatform)
    }
}

pub fn request(permission: PermissionKind, callback: Box<dyn FnOnce(bool)>) -> Result<(), Error> {
    #[cfg(target_vendor = "apple")]
    {
        apple::request(permission, callback)
    }
    #[cfg(not(target_vendor = "apple"))]
    {
        Err(Error::UnsupportedPlatform)
    }
}
