use std::path::{Path, PathBuf};

use super::errors::Error;

fn is_valid_locale_directory(path: &Path) -> bool {
    path.exists()
        && path.join("en.json").exists()
        && path.join("_languages.json").exists()
        && path.join("_untranslated_en.json").exists()
}

pub(super) async fn get_locales_dir(resource_dir: &Path) -> Result<PathBuf, Error> {
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
