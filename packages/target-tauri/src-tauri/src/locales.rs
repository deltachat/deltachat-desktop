use anyhow::{anyhow, bail, Ok};
use log::error;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

// preperation for RTL pr : https://github.com/deltachat/deltachat-desktop/pull/4168/files#diff-3b1f1ef99e1e3ea3c7a50a48159dbc1c11b582f5af7b8cf9daf1548fdc04c894
#[derive(Default, Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum LocaleWritingDirection {
    #[default]
    Ltr,
    Rtl,
}

#[derive(Default, Serialize)]
pub struct LocaleData {
    locale: String,
    dir: LocaleWritingDirection,
    messages: HashMap<String, HashMap<String, String>>,
}

fn is_valid_locale_directory(path: &Path) -> bool {
    path.exists()
        && path.join("en.json").exists()
        && path.join("_languages.json").exists()
        && path.join("_untranslated_en.json").exists()
}

async fn get_locales_dir(resource_dir: &Path) -> anyhow::Result<PathBuf> {
    let alternative_directory = std::env::var("DELTACHAT_LOCALE_DIR").ok();

    if let Some(directory) = alternative_directory {
        if is_valid_locale_directory(&PathBuf::from(&directory)) {
            return Ok(PathBuf::from(directory));
        } else {
            bail!(
                r"Custom locale directory specified in \`DELTACHAT_LOCALE_DIR\` env var is not a valid locale directory.
Make sure it exists and contains atleast the following files:
- _languages.json        // index of what languages exist
- _untranslated_en.json  // for untranslated strings
- en.json                // for fallback

Path to the invalid directory: {directory}",
            );
        }
    }

    let places = vec![
        resource_dir.join("_locales"), // TODO - test on windows and linux
        PathBuf::from("../../../_locales"), // development
    ];

    if let Some(place) = places
        .into_iter()
        .find(|p| is_valid_locale_directory(&PathBuf::from(p)))
    {
        Ok(place)
    } else {
        Err(anyhow!("No valid Locales Directory found"))
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Language {
    String(String),
    Object {
        name: String,
        dir: LocaleWritingDirection,
    },
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

#[tauri::command]
pub(crate) async fn get_locale_data(locale: &str, app: AppHandle) -> Result<LocaleData, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| format!("{e:#}"))?;

    inner_get_locale_data(&resource_dir, locale)
        .await
        .map_err(|e| format!("{e:#}"))
}
