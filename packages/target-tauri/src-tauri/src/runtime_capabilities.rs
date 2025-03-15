use std::{path::PathBuf, str::FromStr};

use anyhow::Context;
use serde::Serialize;
use tauri::{ipc::CapabilityBuilder, AppHandle, Manager};

use crate::{temp_file::get_temp_folder_path, AppState, DeltaChatAppState};

#[derive(Serialize)]
struct OpenerPluginPathEntry {
    path: String,
}

pub(crate) fn add_runtime_capabilies(app: &AppHandle) -> anyhow::Result<()> {
    let current_log_file_path = app.state::<AppState>().current_log_file_path.clone();
    let log_file = PathBuf::from_str(&current_log_file_path)?;
    let log_folder = log_file.parent().expect("parent folder of logfile exists");

    let accounts_dir = app.state::<DeltaChatAppState>().accounts_dir.clone();

    let sticker_folders = format!("{accounts_dir}/*/stickers");

    let tmp_folder = get_temp_folder_path(app)?;

    app.add_capability(
        CapabilityBuilder::new("open-paths")
            .window("main")
            .permission_scoped(
                "opener:allow-open-path",
                vec![
                    OpenerPluginPathEntry {
                        path: log_file.to_str().context("string conversion")?.to_owned(),
                    },
                    OpenerPluginPathEntry {
                        path: log_folder.to_str().context("string conversion")?.to_owned(),
                    },
                    OpenerPluginPathEntry {
                        path: format!(
                            "{}/**/*",
                            tmp_folder.to_str().context("string conversion")?.to_owned()
                        ),
                    },
                    OpenerPluginPathEntry {
                        path: sticker_folders,
                    },
                ],
                vec![],
            ),
    )?;

    Ok(())
}
