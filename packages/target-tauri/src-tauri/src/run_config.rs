use serde::Serialize;

#[derive(Debug, Default, Clone, Copy, Serialize)]
pub struct RunConfig {
    /// Log debug messages
    pub log_debug: bool,
    /// Output the log to stdout / Browser dev console
    pub log_to_console: bool,
    /// opens devtools and enables additional developer apis
    pub devtools: bool,
    /// enables additional developer apis
    pub dev_mode: bool,
    /// watch locales dir and reload on changes
    pub translation_watch: bool,
}

// Information about cli args that are also relevant for frontend
#[tauri::command]
pub fn get_frontend_run_config(state: tauri::State<RunConfig>) -> &RunConfig {
    state.inner()
}
