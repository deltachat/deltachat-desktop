use std::{collections::HashMap, path::PathBuf};

use log::{error, info, warn};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use tokio::fs::read_to_string;

#[cfg(desktop)]
use super::load::get_locales_dir;

use super::{load::get_languages, Language, LocaleData};
use crate::{
    i18n::errors::Error,
    settings::{apply_language_change, CONFIG_FILE, LOCALE_KEY},
    util::sanitization::StrExt,
};

#[tauri::command]
pub async fn change_lang(app: AppHandle, locale: &str) -> Result<(), Error> {
    if !locale.is_ascii_alphanumeric_with_dashes_and_underscores() {
        return Err(Error::Sanitization(locale.to_owned()));
    }

    let store = app.store(CONFIG_FILE)?;
    store.set(LOCALE_KEY, locale);
    apply_language_change(&app).await?;
    Ok(())
}

#[tauri::command]
pub(crate) async fn get_locale_data(locale: &str, app: AppHandle) -> Result<LocaleData, Error> {
    if !locale.is_ascii_alphanumeric_with_dashes_and_underscores() {
        return Err(Error::Sanitization(locale.to_owned()));
    }

    #[cfg(not(target_os = "android"))]
    let locales_dir = get_locales_dir(&app).await?;
    #[cfg(not(target_os = "android"))]
    let languages: HashMap<String, Language> = get_languages(&locales_dir).await?;
    #[cfg(target_os = "android")]
    let languages: HashMap<String, Language> = get_languages(&app).await?;

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

    let (_locale_name, locale_direction) = get_result
        .ok_or(Error::LocaleNotFound(locale_key.to_owned()))?
        .to_tuple();

    #[cfg(not(target_os = "android"))]
    let language_data: HashMap<String, HashMap<String, String>> = {
        let untranslated_data: HashMap<String, HashMap<String, String>> = serde_json::from_str(
            &read_to_string(locales_dir.join("_untranslated_en.json")).await?,
        )?;
        let data_en: HashMap<String, HashMap<String, String>> =
            serde_json::from_str(&read_to_string(locales_dir.join("en.json")).await?)?;

        let language_file = {
            let file_path = locales_dir.join(
                PathBuf::from(format!("{locale_key}.json"))
                    .file_name()
                    .ok_or(Error::LocaleNotFound(locale_key.to_owned()))?,
            );
            if file_path.exists() {
                file_path
            } else {
                error!(
                    "Unable to find language file for {locale_key} in {file_path:?}, defaulting to english"
                );
                locales_dir.join("en.json")
            }
        };

        let mut language_data: HashMap<String, HashMap<String, String>> = data_en;
        let loaded_language_data: HashMap<String, HashMap<String, String>> =
            serde_json::from_str(&read_to_string(language_file).await?)?;

        language_data.extend(loaded_language_data.into_iter());
        language_data.extend(untranslated_data.into_iter());
        language_data
    };
    #[cfg(target_os = "android")]
    let language_data: HashMap<String, HashMap<String, String>> = {
        use crate::i18n::load::PROJECT_DIR;
        use anyhow::Context;

        type Language = HashMap<String, HashMap<String, String>>;
        let untranslated_data: Language = serde_json::from_str(
            &PROJECT_DIR
                .get_file("_untranslated_en.json")
                .context("file not found")
                .map_err(Error::Anyhow)?
                .contents_utf8()
                .context("load failed")
                .map_err(Error::Anyhow)?,
        )?;

        let data_en: Language = serde_json::from_str(
            &PROJECT_DIR
                .get_file("en.json")
                .context("file not found")
                .map_err(Error::Anyhow)?
                .contents_utf8()
                .context("load failed")
                .map_err(Error::Anyhow)?,
        )?;

        let mut language_data: Language = data_en;

        if let Some(file) = PROJECT_DIR.get_file(format!("{locale_key}.json")) {
            let loaded_language_data: Language = serde_json::from_str(
                file.contents_utf8()
                    .context("load failed")
                    .map_err(Error::Anyhow)?,
            )?;
            language_data.extend(loaded_language_data.into_iter());
        } else {
            error!("Unable to find language file for {locale_key}, defaulting to english");
            // no need to load anything as english is already the base
        }
        language_data.extend(untranslated_data.into_iter());
        language_data
    };

    Ok(LocaleData {
        locale: locale_key.to_owned(),
        dir: locale_direction.unwrap_or_default(),
        messages: language_data,
    })
}
