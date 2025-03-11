use std::collections::HashMap;

use errors::Error;
use load::{get_languages, get_locales_dir};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

pub mod commands;
mod errors;
mod load;

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

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Language {
    String(String),
    Object {
        name: String,
        dir: LocaleWritingDirection,
    },
}

// get all locales, returns tuple with id and name
pub async fn get_all_languages(app: &AppHandle) -> Result<Vec<(String, String)>, Error> {
    let locales_dir = get_locales_dir(app).await?;
    let languages: HashMap<String, Language> = get_languages(&locales_dir).await?;
    let mut vec: Vec<(String, String)> = languages
        .into_iter()
        .map(|(id, lang_data)| {
            let name = match lang_data {
                Language::String(name) => name,
                Language::Object { name, dir: _ } => name,
            };
            (id, name)
        })
        .collect();
    vec.sort_unstable_by(|a, b| a.0.cmp(&b.0));
    Ok(vec)
}
