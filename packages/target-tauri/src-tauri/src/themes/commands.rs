use std::str::FromStr;

use tauri::{path::SafePathBuf, AppHandle, Manager};
use tokio::fs::{create_dir_all, read_to_string};

use crate::themes::{
    custom_theme_dir,
    error::Error,
    themes::{load_builtin_themes, read_theme_dir, Theme, BUILT_IN_THEMES_PREFIX},
};

#[tauri::command]
pub async fn get_available_themes(app: AppHandle) -> Result<Vec<Theme>, Error> {
    let app = &app;
    let custom_themes_dir = custom_theme_dir(app)?;
    create_dir_all(&custom_themes_dir).await?;
    log::info!("Custom themes dir is: {custom_themes_dir:?}");
    // look at the common places for themes
    Ok([
        // fix when dev server is running (pnpm tauri dev)
        if app.asset_resolver().iter().count() == 0 {
            #[cfg(debug_assertions)]
            {
                read_theme_dir(
                    BUILT_IN_THEMES_PREFIX,
                    &app.path()
                        .resource_dir()?
                        .join("../../packages/target-tauri/html-dist/themes"),
                )
                .await
                .unwrap_or(vec![])
            }
            #[cfg(not(debug_assertions))]
            {
                log::warn!("no assets found");
                vec![]
            }
        } else {
            // only works when assets are bundled (production build or `pnpm tauri dev --no-dev-server`)
            load_builtin_themes(app).await? // dc prefix is defined in load_builtin_themes
        },
        read_theme_dir("custom", &custom_themes_dir).await?,
    ]
    .concat())
}

#[tauri::command]
pub async fn load_theme(app: AppHandle, theme_address: String) -> Result<(Theme, String), Error> {
    let (prefix, name) = if theme_address == "system" {
        return Err(Error::SystemThemeNotAllowed);
    } else {
        let mut split = theme_address.split(':');
        if let (Some(prefix), Some(name)) = (split.next(), split.next()) {
            (prefix, name)
        } else {
            return Err(Error::InvalidAddress(theme_address.clone()));
        }
    };

    let file_name = SafePathBuf::from_str(&format!("{name}.css"))
        .map_err(|_| Error::InvalidAddress(theme_address.clone()))?
        .as_ref()
        .file_name()
        .ok_or(Error::InvalidAddress(theme_address.clone()))?
        .to_string_lossy()
        .to_string();

    let theme_content = if prefix == "dc" {
        if app.asset_resolver().iter().count() == 0 {
            // search in folder
            let themes_dir = &app
                .path()
                .resource_dir()?
                .join("../../packages/target-tauri/html-dist/themes");
            read_to_string(themes_dir.join(&file_name)).await?
        } else {
            // search in assets
            core::str::from_utf8(
                app.asset_resolver()
                    .get(format!("/themes/{file_name}"))
                    .ok_or(Error::AssetLoadFailed)?
                    .bytes(),
            )?
            .to_owned()
        }
    } else if prefix == "custom" {
        // search in folder
        let themes_dir = custom_theme_dir(&app)?;
        read_to_string(themes_dir.join(&file_name)).await?
    } else {
        return Err(Error::InvalidAddressPrefixUnknown(
            prefix.to_owned(),
            theme_address.clone(),
        ));
    };

    let theme = Theme::load_from_file_content(prefix, &file_name, &theme_content)?;

    Ok((theme, theme_content))
}

// TODO: resolveThemeAddress

// TODO: acceptThemeCLI
