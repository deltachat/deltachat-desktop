use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    // #[error(transparent)]
    // Tauri(#[from] tauri::Error),
    // #[error("window label not found in HtmlEmailInstancesState")]
    // WindowNotFoundInState,
    #[cfg(any(target_os = "macos", target_os = "ios"))]
    #[error("bundle id is not set, this is required to send notifications")]
    NoBundleId,
    #[cfg(any(target_os = "macos", target_os = "ios"))]
    #[error("macOS apis need to be called from the main thread, but this is not the main thread")]
    NotMainThread,
    #[cfg(any(target_os = "macos", target_os = "ios"))]
    #[error("NSError: {0}")]
    NSError(String),
    #[error("Infallible error, something went really wrong: {0}")]
    Infallible(#[from] std::convert::Infallible),
    #[error(transparent)]
    TokioRecv(#[from] tokio::sync::oneshot::error::RecvError),
    #[error(transparent)]
    TokioTryLock(#[from] tokio::sync::TryLockError),
    #[error("Url from path parse error {0:?}")]
    ParseUrlFromPath(PathBuf),
    #[cfg(target_os = "windows")]
    #[error(transparent)]
    Windows(#[from] windows::core::Error),
    #[cfg(target_os = "windows")]
    #[error("Failed to parse user info {0:?}")]
    FailedToParseUserInfo(serde_json::Error),
    #[cfg(target_os = "windows")]
    #[error("Error Setting Handler Callback")]
    SettingHandler,
    #[cfg(target_os = "windows")]
    #[error(transparent)]
    XmlEscape(#[from] quick_xml::escape::EscapeError),
    #[cfg(target_os = "windows")]
    #[error(transparent)]
    UrlParse(#[from] url::ParseError),
    #[cfg(target_os = "windows")]
    #[error(transparent)]
    Base64Decode(#[from] base64::DecodeError),
    #[cfg(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "openbsd",
        target_os = "netbsd"
    ))]
    #[error(transparent)]
    RustNotifyError(#[from] notify_rust::error::Error),
}
