use serde::Serialize;

#[derive(Debug, Default, Clone, Serialize)]
pub struct RunConfig {
    /// deeplink or webxdc file to open
    pub deeplink: Option<String>,
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
    /// Start deltachat in minimized mode without visible window
    pub minimized_window: bool,
    /// Force tray icon active, because started in minimized mode without visible window
    pub forced_tray_icon: bool,
    /// the theme address that was set via cli argument
    pub theme: Option<String>,
    /// reloading the theme when it changes
    pub theme_watch: bool,
}

// Information about cli args that are also relevant for frontend
#[tauri::command]
pub fn get_frontend_run_config(state: tauri::State<RunConfig>) -> &RunConfig {
    state.inner()
}
