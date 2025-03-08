use std::collections::HashMap;

use log::{debug, error, info, warn};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use tokio::fs::read_to_string;

use super::{load::get_locales_dir, Language, LocaleData};
use crate::i18n::errors::Error;

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
    // can maybe be resolved by tauri filesystem plugin??

    let locales_dir = get_locales_dir(&resource_dir).await?;

    let languages: HashMap<String, Language> =
        serde_json::from_str(&read_to_string(locales_dir.join("_languages.json")).await?)?;

    let mut get_result = languages.get(locale);
    let mut locale_key = locale;

    if get_result.is_none() {
        warn!("locale {locale} not found, but it is a dialect/variant, so trying to fallback to base language");
        let base_locale = locale
            .split('-')
            .next()
            .ok_or(Error::BaseLocaleExtraction)?;
        info!("base_locale: {base_locale} locale:{locale}");
        get_result = languages.get(base_locale);
        locale_key = base_locale;
    }

    let (_locale_name, locale_dir) = get_result
        .ok_or(Error::LocaleNotFound(locale_key.to_owned()))?
        .to_tuple();

    let untranslated_data: HashMap<String, HashMap<String, String>> =
        serde_json::from_str(&read_to_string(locales_dir.join("_untranslated_en.json")).await?)?;

    let language_file = {
        let file_path = locales_dir.join(format!("{locale_key}.json"));
        if file_path.exists() {
            file_path
        } else {
            error!(
                "Unable to find language file for {locale_key} in {file_path:?}, defaulting to english"
            );
            locales_dir.join("en.json")
        }
    };

    let mut language_data: HashMap<String, HashMap<String, String>> =
        serde_json::from_str(&read_to_string(language_file).await?)?;

    language_data.extend(untranslated_data.into_iter());

    Ok(LocaleData {
        locale: locale_key.to_owned(),
        dir: locale_dir.unwrap_or_default(),
        messages: language_data,
    })
}
