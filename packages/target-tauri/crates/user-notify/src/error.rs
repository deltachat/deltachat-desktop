#[derive(Debug, thiserror::Error)]
pub enum Error {
    // #[error(transparent)]
    // Tauri(#[from] tauri::Error),
    // #[error("window label not found in HtmlEmailInstancesState")]
    // WindowNotFoundInState,
    #[cfg(target_os = "macos")]
    #[error("bundle id is not set, this is required to send notifications")]
    NoBundleId,
    #[cfg(target_os = "macos")]
    #[error("macOS apis need to be called from the main thread, but this is not the main thread")]
    NotMainThread,
}
