use std::collections::HashMap;

use log::error;
use tauri::{AppHandle, State};
use tauri_plugin_store::StoreExt;
use tokio::fs::read_to_string;

use super::{
    load::{get_languages, get_locales_dir},
    Language, LocaleData,
};
use crate::{
    i18n::errors::Error,
    settings::{CONFIG_FILE, LOCALE_KEY},
    state::menu_manager::MenuManger,
};

#[tauri::command]
pub fn change_lang(
    app: AppHandle,
    menu_manager: State<MenuManger>,
    locale: &str,
) -> Result<(), Error> {
    let store = app.store(CONFIG_FILE)?;
    store.set(LOCALE_KEY, locale);
    menu_manager.update_all(&app);
    Ok(())
}

#[tauri::command]
pub(crate) async fn get_locale_data(locale: &str, app: AppHandle) -> Result<LocaleData, Error> {
    let locales_dir = get_locales_dir(&app).await?;
    let languages: HashMap<String, Language> = get_languages(&locales_dir).await?;

    let (_locale_name, locale_dir) = match languages.get(locale) {
        Some(Language::String(name)) => (name.to_owned(), None),
        Some(Language::Object { name, dir }) => (name.to_owned(), Some(dir.to_owned())),
        None => return Err(Error::LocaleNotFound(locale.to_owned())),
    };

    let untranslated_data: HashMap<String, HashMap<String, String>> =
        serde_json::from_str(&read_to_string(locales_dir.join("_untranslated_en.json")).await?)?;

    let language_file = {
        let file_path = locales_dir.join(format!("{locale}.json"));
        if file_path.exists() {
            file_path
        } else {
            error!(
                "Unable to find language file for {locale} in {file_path:?}, defaulting to english"
            );
            locales_dir.join("en.json")
        }
    };

    let mut language_data: HashMap<String, HashMap<String, String>> =
        serde_json::from_str(&read_to_string(language_file).await?)?;

    language_data.extend(untranslated_data.into_iter());

    Ok(LocaleData {
        locale: locale.to_owned(),
        dir: locale_dir.unwrap_or_default(),
        messages: language_data,
    })
}
