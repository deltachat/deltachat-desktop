use anyhow::Context;
use serde::Deserialize;
use tauri::{AppHandle, Manager};

/// as in RuntimeAppPath in packages/runtime/runtime.ts (keep this in sync manually)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum AppPathName {
    Home,
    Desktop,
    Documents,
    Downloads,
    Pictures,
}

impl AppPathName {
    fn resolve(self, app: AppHandle) -> anyhow::Result<String> {
        let p = app.path();
        Ok(match self {
            AppPathName::Home => p.home_dir()?,
            AppPathName::Desktop => {
                #[cfg(target_os = "android")]
                {
                    anyhow::bail!("desktop dir not available on android")
                }
                #[cfg(not(target_os = "android"))]
                {
                    p.desktop_dir()?
                }
            }
            AppPathName::Documents => p.document_dir()?,
            AppPathName::Downloads => p.download_dir()?,
            AppPathName::Pictures => p.picture_dir()?,
        }
        .to_str()
        .context("path to string conversion failed")?
        .to_owned())
    }
}

#[tauri::command]
pub(crate) fn get_app_path(app: AppHandle, name: AppPathName) -> Result<String, String> {
    name.resolve(app).map_err(|err| format!("{err:#}"))
}
