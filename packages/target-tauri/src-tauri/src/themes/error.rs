use std::str::Utf8Error;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error("theme file does not have the css extension")]
    NoCssExtension,
    #[error("Invalid RegEx Pattern")]
    RegEx(#[from] regex::Error),
    #[error("no metadata found in theme file")]
    NoMetadataInThemeFile,
    #[error("The meta variables meta.name and meta.description must be defined")]
    MetaNameOrDescriptionMissing,
    #[error("Failed to parse path from asset")]
    AssetPathParse,
    #[error("Failed to load asset")]
    AssetLoadFailed,
    #[error("Not a valid theme address '{0}'")]
    InvalidAddress(String),
    #[error("Not a valid theme address prefix `{0}` in `{1}`")]
    InvalidAddressPrefixUnknown(String, String),
    #[error(transparent)]
    Utf8(#[from] Utf8Error),
    #[error("System theme must be resolved dynamically by UI before loading")]
    SystemThemeNotAllowed,
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
