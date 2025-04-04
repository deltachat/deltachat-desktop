use std::collections::HashMap;

use errors::Error;
use load::get_languages;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[cfg(desktop)]
use load::get_locales_dir;

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
    pub locale: String,
    pub dir: LocaleWritingDirection,
    pub messages: HashMap<String, HashMap<String, String>>,
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

impl Language {
    pub(crate) fn to_tuple(&self) -> (String, Option<LocaleWritingDirection>) {
        match self {
            Language::String(name) => (name.to_owned(), None),
            Language::Object { name, dir } => (name.to_owned(), Some(*dir)),
        }
    }
}

/// get all locales, returns tuple with id and name
pub async fn get_all_languages(app: &AppHandle) -> Result<Vec<(String, String)>, Error> {
    #[cfg(not(target_os = "android"))]
    let locales_dir = get_locales_dir(app).await?;
    #[cfg(not(target_os = "android"))]
    let languages: HashMap<String, Language> = get_languages(&locales_dir).await?;
    #[cfg(target_os = "android")]
    let languages: HashMap<String, Language> = get_languages(&app).await?;
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

#[cfg(desktop)]
pub fn watch_translations(app: AppHandle) {
    use std::time::Duration;
    use tauri::Manager;

    use crate::{
        state::main_window_channels::MainWindowEvents, util::fs_watcher::async_watch_debounced,
        MainWindowChannels,
    };

    let app_clone = app.clone();
    let callback = Box::new(move || {
        let app_clone = app_clone.clone();
        async move {
            if let Err(err) = app_clone
                .state::<MainWindowChannels>()
                .emit_event(MainWindowEvents::LocaleReloaded(None))
                .await
            {
                log::error!("watch_translations: failed notify frontend: {err}:?");
            }
        }
    });

    tauri::async_runtime::spawn(async move {
        if let Ok(watch_dir) = get_locales_dir(&app).await {
            log::info!("watch_translations: watching for changes in {watch_dir:?}");
            if let Err(err) =
                async_watch_debounced(watch_dir, callback, Duration::from_millis(400)).await
            {
                log::error!("watch_translations: failed to watch locales dir: {err:?}");
            }
        } else {
            log::error!("watch_translations: failed to get locales dir");
        }
    });
}
