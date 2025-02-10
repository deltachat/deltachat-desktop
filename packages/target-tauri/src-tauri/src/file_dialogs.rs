use std::fs;

use anyhow::Context;
use log::{info, warn};
use serde::Deserialize;
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};

#[tauri::command]
pub(crate) async fn download_file(
    app: AppHandle,
    path_to_source: &str,
    filename: &str,
) -> Result<(), String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = tokio::sync::oneshot::channel::<Option<FilePath>>();

    app.dialog()
        .file()
        .set_file_name(filename)
        .save_file(|path| {
            if tx.send(path).is_err() {
                warn!("download_file: receiver dropped");
            }
        });

    let file_path = rx
        .await
        .context("the sender dropped")
        .map_err(|err| format!("{err:#}"))?;

    if let Some(file_path) = file_path {
        fs::copy(
            path_to_source,
            file_path.into_path().map_err(|err| format!("{err:#}"))?,
        )
        .map_err(|err| format!("{err:#}"))?;
    } else {
        info!("User aborted save-file dialog");
    }
    Ok(())
}

#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub(crate) enum OpenProperties {
    OpenFile,
    OpenDirectory,
    CreateDirectory,
    MultiSelections,
}

#[derive(Debug, Deserialize)]
pub(crate) struct Filter {
    name: String,
    extensions: Vec<String>,
}

#[tauri::command]
pub(crate) async fn show_open_file_dialog(
    app: AppHandle,
    title: Option<&str>,
    filters: Option<Vec<Filter>>,
    properties: Vec<OpenProperties>,
    default_path: Option<&str>,
) -> Result<Vec<tauri_plugin_dialog::FilePath>, String> {
    info!("show_open_file_dialog\n\n{title:?}{filters:?}{properties:?}{default_path:?}");

    //bug: file attaching. -> * filter not recognized

    let mut dialog = app
        .dialog()
        .file()
        .set_can_create_directories(properties.contains(&OpenProperties::CreateDirectory));

    if let Some(title) = title {
        dialog = dialog.set_title(title);
    }

    if let Some(default_path) = default_path {
        dialog = dialog.set_directory(default_path);
    }

    if let Some(filters) = filters {
        // macOS merges all filters into one
        // -> also it doesn't support `*` wildcards
        // So in this case we skip adding the filter
        if !(cfg!(target_os = "macos")
            && filters
                .iter()
                .any(|filter| filter.extensions.contains(&"*".to_owned())))
        {
            // TODO: Find out if "*" filter is a problem on other platforms,
            // If so, make an issue on https://github.com/PolyMeilex/rfd/issues
            for filter in filters {
                dialog = dialog.add_filter(
                    filter.name,
                    &filter
                        .extensions
                        .iter()
                        .map(|s| s.as_str())
                        .collect::<Vec<&str>>(),
                );
            }
        }
    }

    let (tx, rx) = tokio::sync::oneshot::channel::<Option<Vec<FilePath>>>();

    if properties.contains(&OpenProperties::OpenFile) {
        if properties.contains(&OpenProperties::MultiSelections) {
            dialog.pick_files(|path| {
                if tx.send(path).is_err() {
                    warn!("download_file: receiver dropped");
                }
            });
        } else {
            dialog.pick_file(|path| {
                if tx.send(path.map(|file| vec![file])).is_err() {
                    warn!("download_file: receiver dropped");
                }
            });
        }
    } else if properties.contains(&OpenProperties::OpenDirectory) {
        #[cfg(any(target_os = "ios", target_os = "android"))]
        {
            return Err("opening folders is not supported by tauri on ios and android".to_owned());
        }
        #[cfg(not(any(target_os = "ios", target_os = "android")))]
        {
            if properties.contains(&OpenProperties::MultiSelections) {
                dialog.pick_folders(|path| {
                    if tx.send(path).is_err() {
                        warn!("download_file: receiver dropped");
                    }
                });
            } else {
                dialog.pick_folder(|path| {
                    if tx.send(path.map(|folder: FilePath| vec![folder])).is_err() {
                        warn!("download_file: receiver dropped");
                    }
                });
            }
        }
    } else {
        return Err(
            "Open Properties missing, must contain one of OpenFile or OpenDirectory".to_owned(),
        );
    }

    if let Some(files) = rx
        .await
        .context("the sender dropped")
        .map_err(|err| format!("{err:#}"))?
    {
        Ok(files)
    } else {
        info!("User aborted open dialog");
        Ok(vec![])
    }
}
