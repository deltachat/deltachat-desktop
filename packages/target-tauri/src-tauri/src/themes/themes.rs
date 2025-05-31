use std::{collections::HashMap, path::PathBuf, str::FromStr};

use serde::Serialize;
use tauri::AppHandle;
use tokio::fs::{read_dir, read_to_string};

use super::error::Error;

const HIDDEN_THEME_PREFIX: &str = "dev_";
pub const BUILT_IN_THEMES_PREFIX: &str = "dc";

#[derive(Debug, Clone, Serialize)]
pub struct ThemeMetadata {
    name: String,
    description: String,
    address: String,
    /// whether the theme is a prototype and should be hidden in the selection unless deltachat is started in devmode
    is_prototype: bool,
}

impl ThemeMetadata {
    fn address(prefix: &str, file_name: &str) -> Result<String, Error> {
        let address = format!(
            "{prefix}:{}",
            file_name
                .strip_suffix(".css")
                .ok_or(Error::NoCssExtension)?
        );
        Ok(address)
    }

    fn new(
        prefix: &str,
        file_name: &str,
        name: String,
        description: String,
    ) -> Result<Self, Error> {
        let is_prototype = file_name.starts_with(HIDDEN_THEME_PREFIX);
        let address = Self::address(prefix, file_name)?;

        Ok(Self {
            name,
            description,
            address,
            is_prototype,
        })
    }

    pub(super) fn load_from_file_content(
        prefix: &str,
        file_name: &str,
        content: &str,
    ) -> Result<Self, Error> {
        match Self::parse_theme_meta_data(content) {
            Ok((name, description)) => Ok(Self::new(prefix, file_name, name, description)?),
            Err(err) => {
                log::error!("failed to parse theme metadata: {err:?}");
                Ok(Self::new(
                    prefix,
                    file_name,
                    format!("{} [Invalid Meta]", Self::address(prefix, file_name)?),
                    "[missing description]".to_owned(),
                )?)
            }
        }
    }

    fn parse_theme_meta_data(raw_theme: &str) -> Result<(String, String), Error> {
        // https://docs.rs/regex/latest/regex/#syntax
        let meta_block_regex = regex::Regex::new(".theme-meta ?\\{([^\\}]*)\\}")?;
        let css_var_regex = regex::Regex::new(r#"--(\w*): ?['"](.*?)['"];?"#)?;

        let meta_block = meta_block_regex
            .find(raw_theme)
            .ok_or(Error::NoMetadataInThemeFile)?
            .as_str();

        let mut map = HashMap::new();
        for captures in css_var_regex.captures_iter(meta_block) {
            if let (Some(key), Some(value)) = (
                captures.get(1).map(|m| m.as_str()),
                captures.get(2).map(|m| m.as_str()),
            ) {
                map.insert(key, value);
            } else {
                log::warn!("can't parse css variable {captures:?}");
                continue;
            }
        }

        if let (Some(name), Some(description)) = (map.get("name"), map.get("description")) {
            Ok((name.to_string(), description.to_string()))
        } else {
            Err(Error::MetaNameOrDescriptionMissing)
        }
    }
}

pub(super) async fn read_theme_dir(
    prefix: &str,
    directory: &PathBuf,
) -> Result<Vec<ThemeMetadata>, Error> {
    let mut files = read_dir(directory).await?;
    let mut themes = Vec::new();
    while let Some(file) = files.next_entry().await? {
        let file_name = file.file_name().to_string_lossy().to_string();
        if !file_name.ends_with(".css") || file_name.starts_with('_') {
            continue;
        }
        let path_to_file = directory.join(&file_name);

        let content = match read_to_string(&path_to_file).await {
            Err(err) => {
                log::error!("load theme (failed to read file) '{path_to_file:?}': {err}",);
                continue;
            }
            Ok(content) => content,
        };

        match ThemeMetadata::load_from_file_content(prefix, &file_name, &content) {
            Err(err) => {
                log::error!("load theme '{path_to_file:?}': {err}");
                continue;
            }
            Ok(theme) => themes.push(theme),
        }
    }

    Ok(themes)
}

pub(super) async fn load_builtin_themes(app: &AppHandle) -> Result<Vec<ThemeMetadata>, Error> {
    let prefix = BUILT_IN_THEMES_PREFIX;

    let asset_resolver = app.asset_resolver();
    let assets: Vec<String> = asset_resolver
        .iter()
        .filter(|(path, _content)| path.starts_with("/themes"))
        .map(|(path, _)| path.to_string())
        .collect();
    log::debug!("potential theme candidates: {assets:?}");
    let mut themes = Vec::new();
    for asset_path in assets {
        let asset_bytes = app
            .asset_resolver()
            .get(asset_path.clone())
            .ok_or(Error::AssetLoadFailed)?
            .bytes;
        let file_name = PathBuf::from_str(&asset_path)
            .map_err(|_| Error::AssetPathParse)?
            .file_name()
            .ok_or(Error::AssetPathParse)?
            .to_string_lossy()
            .to_string();
        if !file_name.ends_with(".css") || file_name.starts_with('_') {
            continue;
        }

        let content = match String::from_utf8(asset_bytes.to_vec()) {
            Err(err) => {
                log::error!("load theme (failed to read asset) '{asset_path}': {err}",);
                continue;
            }
            Ok(content) => content,
        };

        match ThemeMetadata::load_from_file_content(prefix, &file_name, &content) {
            Err(err) => {
                log::error!("load theme '{asset_path}': {err}");
                continue;
            }
            Ok(theme) => themes.push(theme),
        }
    }

    Ok(themes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_meta_data_block() {
        let raw_theme = r"// some comment
        .theme-meta {
            --name: 'Dark Theme';
            --description: 'Our default dark theme.';
        }
        // some other comment";
        let (name, description) = ThemeMetadata::parse_theme_meta_data(raw_theme).unwrap();
        assert_eq!(name, "Dark Theme");
        assert_eq!(description, "Our default dark theme.");
    }

    #[test]
    fn parse_meta_data_block_minified() {
        let raw_theme =
            r".theme-meta {--name: 'Dark Theme'; --description: 'Our default dark theme.';}";
        let (name, description) = ThemeMetadata::parse_theme_meta_data(raw_theme).unwrap();
        assert_eq!(name, "Dark Theme");
        assert_eq!(description, "Our default dark theme.");
    }
    #[test]
    fn parse_meta_data_block_double_qoutes() {
        let raw_theme =
            r#".theme-meta {--name: "Dark Theme"; --description: "Our default dark theme.";}"#;
        let (name, description) = ThemeMetadata::parse_theme_meta_data(raw_theme).unwrap();
        assert_eq!(name, "Dark Theme");
        assert_eq!(description, "Our default dark theme.");
    }
}
