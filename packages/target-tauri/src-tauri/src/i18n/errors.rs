use std::fmt::Display;

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    Sanitization(String),
    LocaleNotFound(String),
    InvalidLocaleDir(String),
    NoValidLocaleDirFound,
    #[error(transparent)]
    IO(#[from] std::io::Error),
    #[error(transparent)]
    SerdeJSON(#[from] serde_json::Error),
    BaseLocaleExtraction,
    #[error(transparent)]
    Anyhow(#[from] anyhow::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::Sanitization(locale) => f.write_fmt(format_args!(
                "Error: {locale} is not a valid locale"
            )),
            Error::LocaleNotFound(locale) => f.write_fmt(format_args!(
                "Error: Locale {locale} was not found in _languages.json"
            )),
            Error::InvalidLocaleDir(directory) => f.write_fmt(format_args!(
                r"Error: Custom locale directory specified in \`DELTACHAT_LOCALE_DIR\` env var is not a valid locale directory.
Make sure it exists and contains atleast the following files:
- _languages.json        // index of what languages exist
- _untranslated_en.json  // for untranslated strings
- en.json                // for fallback

Path to the invalid directory: {directory}",
            )),
            Error::NoValidLocaleDirFound => f.write_fmt(format_args!(
                "No valid Locales Directory found"
            )),
            _ => f.write_fmt(format_args!("{self:?}")),
        }
    }
}
