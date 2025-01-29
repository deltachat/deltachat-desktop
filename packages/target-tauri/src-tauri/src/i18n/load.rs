use anyhow::{anyhow, bail, Ok};
use std::path::{Path, PathBuf};

fn is_valid_locale_directory(path: &Path) -> bool {
    path.exists()
        && path.join("en.json").exists()
        && path.join("_languages.json").exists()
        && path.join("_untranslated_en.json").exists()
}

pub(super) async fn get_locales_dir(resource_dir: &Path) -> anyhow::Result<PathBuf> {
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
        resource_dir.join("_locales"),      // TODO - test on windows and linux
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
