use log::{debug, error};
use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::i18n::errors::Error;

use super::{load::get_locales_dir, Language, LocaleData};

#[tauri::command]
pub fn change_lang(app: AppHandle, locale: &str) -> Result<(), Error> {
    let store = app.store("config.json")?;
    store.set("locale", locale);
    // TODO: update locale in menu
    Ok(())
}

#[tauri::command]
pub(crate) async fn get_locale_data(locale: &str, app: AppHandle) -> Result<LocaleData, Error> {
    let resource_dir = app.path().resource_dir()?;

    debug!("get_locale_data {resource_dir:?}");
    // android has sth. different it seems -> get_locale_data "asset://localhost/"
    // can maybe be reolved by tauri filesystem plugin??

    let locales_dir = get_locales_dir(&resource_dir).await?;

    let languages: HashMap<String, Language> = serde_json::from_str(
        &tokio::fs::read_to_string(locales_dir.join("_languages.json")).await?,
    )?;

    let (locale_name, locale_dir) = match languages.get(locale) {
        Some(Language::String(name)) => (name.to_owned(), None),
        Some(Language::Object { name, dir }) => (name.to_owned(), Some(dir.to_owned())),
        None => return Err(Error::LocaleNotFound(locale.to_owned())),
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
