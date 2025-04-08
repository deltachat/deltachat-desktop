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
    #[error("Url from path parse error {0:?}")]
    ParseUrlFromPath(PathBuf),
}
