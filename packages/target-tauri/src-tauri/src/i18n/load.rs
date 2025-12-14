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

#[cfg(not(target_os = "android"))]
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
        #[cfg(debug_assertions)]
        PathBuf::from("../../../_locales"), // development (pnpm tauri dev)
        #[cfg(debug_assertions)]
        PathBuf::from("../../_locales"), // development (cargo run)
        resource_dir.join("_locales"),
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

#[cfg(not(target_os = "android"))]
pub(super) async fn get_locales_dir(app: &AppHandle) -> Result<PathBuf, Error> {
    let resource_dir = app.path().resource_dir()?;
    debug!("get_locale_data {resource_dir:?}");

    let locales_dir = get_locales_dir_from_resource_dir(&resource_dir).await?;
    Ok(locales_dir)
}

#[cfg(not(target_os = "android"))]
pub(super) async fn get_languages(locales_dir: &Path) -> Result<HashMap<String, Language>, Error> {
    Ok(serde_json::from_str(
        &read_to_string(locales_dir.join("_languages.json")).await?,
    )?)
}

#[cfg(target_os = "android")]
use include_dir::{include_dir, Dir};
#[cfg(target_os = "android")]
pub static PROJECT_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../../../_locales");

#[cfg(target_os = "android")]
pub(super) async fn get_languages(app: &AppHandle) -> Result<HashMap<String, Language>, Error> {
    use anyhow::Context;

    // these paths do not work
    // "asset://localhost/_locales/_languages.json"
    // "_locales/_languages.json"
    // ../../../_locales/_languages.json
    // ./
    //
    // std::fs::File::open()
    // app.asset_resolver().get()
    // both don't work

    // so let's hardcode it

    let file = PROJECT_DIR
        .get_file("_languages.json")
        .context("file not found")
        .map_err(Error::Anyhow)?;

    let string = file
        .contents_utf8()
        .context("load failed")
        .map_err(Error::Anyhow)?;

    Ok(serde_json::from_str(&string)?)
}
