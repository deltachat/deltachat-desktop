use tauri::AppHandle;
use tauri::Emitter;
use tauri::Wry;
use tauri_plugin_store::StoreExt;
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
  #[error(transparent)]
  Store(#[from] tauri_plugin_store::Error),
  #[error(transparent)]
  Tauri(#[from] tauri::Error)
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
      S: serde::ser::Serializer,
    {
      serializer.serialize_str(self.to_string().as_ref())
    }
  }

#[tauri::command]
pub fn change_lang(app: AppHandle, locale: &str) -> Result<(), Error>{
    let store = app.store("config.json")?;
    store.set("locale", locale);
    // TODO: update locale in menu
    Ok(())
}