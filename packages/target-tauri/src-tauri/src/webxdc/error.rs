#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error(transparent)]
    DeltaChat(anyhow::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("dc account not found {0}")]
    AccountNotFound(u32),
    #[error("webxdc message not found acc:{0} msg:{1}")]
    WebxdcInstanceNotFound(u32, u32),
    #[error(transparent)]
    UrlParse(#[from] url::ParseError),
    #[error("MenuCreation {0}")]
    MenuCreation(String),
    #[error("webxdc message not found by window label:{0}")]
    WebxdcInstanceNotFoundByLabel(String),
    #[error("anyhow {0:?}")]
    Anyhow(anyhow::Error),
    #[error("failed to make a dummy blackhole proxy, webxdc network isolation might not work")]
    BlackholeProxyUnavailable,
    #[error("channel not initialized yet")]
    ChannelNotInitializedYet,
    #[error("instance exists, but window missing")]
    InstanceExistsButWindowMissing,
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
