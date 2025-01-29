use anyhow::bail;
use log::{debug, error};
use std::{collections::HashMap, path::Path};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use super::{load::get_locales_dir, Language, LocaleData};

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Store(#[from] tauri_plugin_store::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
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
pub fn change_lang(app: AppHandle, locale: &str) -> Result<(), Error> {
    let store = app.store("config.json")?;
    store.set("locale", locale);
    // TODO: update locale in menu
    Ok(())
}

#[tauri::command]
pub(crate) async fn get_locale_data(locale: &str, app: AppHandle) -> Result<LocaleData, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| format!("{e:#}"))?;

    debug!("get_locale_data {resource_dir:?}");
    // android has sth. different it seems -> get_locale_data "asset://localhost/"
    // can maybe be reolved by tauri filesystem plugin??

    inner_get_locale_data(&resource_dir, locale)
        .await
        .map_err(|e| format!("{e:#}"))
}

async fn inner_get_locale_data(resource_dir: &Path, locale: &str) -> anyhow::Result<LocaleData> {
    let locales_dir = get_locales_dir(resource_dir).await?;

    let languages: HashMap<String, Language> = serde_json::from_str(
        &tokio::fs::read_to_string(locales_dir.join("_languages.json")).await?,
    )?;

    let (locale_name, locale_dir) = match languages.get(locale) {
        Some(Language::String(name)) => (name.to_owned(), None),
        Some(Language::Object { name, dir }) => (name.to_owned(), Some(dir.to_owned())),
        None => {
            bail!("Locale {locale} was not found in _languages.json")
        }
    };

    let untranslated_data: HashMap<String, HashMap<String, String>> = serde_json::from_str(
        &tokio::fs::read_to_string(locales_dir.join("_untranslated_en.json")).await?,
    )?;

    let language_file = {
        let file_path = locales_dir.join(format!("{locale}.json"));
        if file_path.exists() {
            file_path
        } else {
            error!(
                "Unable to find language file for {locale} in {file_path:?}, defaulting back to english"
            );
            locales_dir.join("en.json")
        }
    };

    let mut language_data: HashMap<String, HashMap<String, String>> =
        serde_json::from_str(&tokio::fs::read_to_string(language_file).await?)?;

    language_data.extend(untranslated_data.into_iter());

    Ok(LocaleData {
        locale: locale_name,
        dir: locale_dir.unwrap_or_default(),
        messages: language_data,
    })
}
