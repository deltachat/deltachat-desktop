#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("window label not found in HtmlEmailInstancesState")]
    WindowNotFoundInState,
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error("user canceled")]
    UserCanceled,
    #[error(transparent)]
    TokioOneshotRecv(#[from] tokio::sync::oneshot::error::RecvError),
    #[error(transparent)]
    DeltaChat(anyhow::Error),
    #[error("you can not load remote content when you have proxy enabled")]
    BlockedByProxy,
    #[error("MenuCreation {0}")]
    MenuCreation(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
