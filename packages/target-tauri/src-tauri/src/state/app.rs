use std::{path::PathBuf, sync::Arc, time::SystemTime};

use anyhow::{bail, Context};
use log::info;
use tauri::AppHandle;

#[cfg(desktop)]
use tauri::Manager;
use tokio::sync::Mutex;

use crate::{
    i18n::get_all_languages,
    temp_file::{clear_tmp_folder, create_tmp_folder},
};

#[derive(Default)]
pub(crate) struct InnerAppState {
    pub(crate) ui_ready: bool,
    pub(crate) ui_frontend_ready: bool,
    pub(crate) deeplink: Option<String>,
}

impl InnerAppState {
    pub(crate) fn new() -> Arc<Mutex<Self>> {
        Arc::new(Mutex::new(InnerAppState::default()))
    }
}

pub(crate) struct AppState {
    pub(crate) inner: Arc<Mutex<InnerAppState>>,
    pub(crate) startup_timestamp: SystemTime,
    pub(crate) current_log_file_path: String,

    // caching here, because the menu building is sync,
    // but the function to get all languages is async
    /// Vec of all supported languages: (language_code, language_display_name)
    pub(crate) all_languages_for_menu: Vec<(String, String)>,
}

impl AppState {
    pub(crate) async fn try_new(
        app: &tauri::App,
        inner: Arc<Mutex<InnerAppState>>,
        startup_timestamp: SystemTime,
    ) -> anyhow::Result<Self> {
        let handle = app.handle().clone();
        let get_current_log_file_task =
            tauri::async_runtime::spawn(async move { Self::get_current_log_file(handle).await });

        let current_log_file_path = get_current_log_file_task.await??;

        #[cfg(not(target_os = "android"))]
        {
            create_tmp_folder(app.handle()).await?;
            clear_tmp_folder(app.handle()).await?;
        }

        let all_languages_for_menu = get_all_languages(app.handle()).await?;

        Ok(Self {
            inner,
            startup_timestamp,
            current_log_file_path,
            all_languages_for_menu,
        })
    }

    #[cfg(target_os = "ios")]
    async fn get_current_log_file(_app: AppHandle) -> anyhow::Result<String> {
        Ok("does not exist on ios - because iOS uses the system os-log api".to_owned())
    }

    #[cfg(target_os = "android")]
    async fn get_current_log_file(_app: AppHandle) -> anyhow::Result<String> {
        Ok("does not exist on andoid - because android uses the system log api".to_owned())
    }

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    async fn get_current_log_file(app: AppHandle) -> anyhow::Result<String> {
        let mut log_files: Vec<(PathBuf, std::time::Duration)> =
            std::fs::read_dir(app.path().app_log_dir()?)?
                .filter_map(|entry| entry.ok())
                .map(|entry| {
                    let elapsed = entry.metadata()?.created()?.elapsed()?;
                    let path = entry.path();
                    if !path.to_string_lossy().ends_with(".log") {
                        bail!("not logfile")
                    }
                    anyhow::Ok((path, elapsed))
                })
                .filter_map(|entry| entry.ok())
                .collect();
        log_files.sort_by(|a, b| a.1.cmp(&b.1));
        let current_log_file_path = log_files
            .first()
            .context("current logfile does not exist")?
            .0
            .to_str()
            .context("invalid characters in logfile path, this should not happen")?
            .to_owned();
        info!("Current Logfile: {current_log_file_path}");
        Ok(current_log_file_path)
    }

    pub(crate) fn log_duration_since_startup(&self, label: &str) {
        if let Ok(duration) = SystemTime::now().duration_since(self.startup_timestamp) {
            let micros = duration.as_micros();
            info!("{label} took {micros}μs");
        } else {
            info!("{label} took (error)μs");
        }
    }
}
