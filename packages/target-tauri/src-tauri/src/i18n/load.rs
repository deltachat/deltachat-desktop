use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

use log::debug;
use tauri::{AppHandle, Manager};
use tokio::fs::read_to_string;

use super::{errors::Error, Language};

fn is_valid_locale_directory(path: &Path) -> bool {
    path.exists()
        && path.join("en.json").exists()
        && path.join("_languages.json").exists()
        && path.join("_untranslated_en.json").exists()
}

pub(super) async fn get_locales_dir_from_resource_dir(
    resource_dir: &Path,
) -> Result<PathBuf, Error> {
    let alternative_directory = std::env::var("DELTACHAT_LOCALE_DIR").ok();

    if let Some(directory) = alternative_directory {
        if is_valid_locale_directory(&PathBuf::from(&directory)) {
            return Ok(PathBuf::from(directory));
        } else {
            return Err(Error::InvalidLocaleDir(directory.to_owned()));
        }
    }

    let places = vec![
        resource_dir.join("_locales"),      // TODO - test on windows and linux
        PathBuf::from("../../../_locales"), // development
    ];

    if let Some(place) = places
        .into_iter()
        .find(|p| is_valid_locale_directory(&PathBuf::from(p)))
    {
        Ok(place)
    } else {
        Err(Error::NoValidLocaleDirFound)
    }
}

pub(super) async fn get_locales_dir(app: &AppHandle) -> Result<PathBuf, Error> {
    let resource_dir = app.path().resource_dir()?;

    debug!("get_locale_data {resource_dir:?}");
    // android has sth. different it seems -> get_locale_data "asset://localhost/"
    // can maybe be resolved by tauri filesystem plugin??

    let locales_dir = get_locales_dir_from_resource_dir(&resource_dir).await?;
    Ok(locales_dir)
}

pub(super) async fn get_languages(locales_dir: &Path) -> Result<HashMap<String, Language>, Error> {
    Ok(serde_json::from_str(
        &read_to_string(locales_dir.join("_languages.json")).await?,
    )?)
}
