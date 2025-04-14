use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutostartState {
    is_supported: bool,
    // This is not the same as enabled in the desktop settings,
    // this is the actual state not the desktop setting
    is_registered: bool,
}

#[cfg(not(desktop))]
#[tauri::command]
pub(crate) fn get_autostart_state(app: AppHandle) -> Result<AutostartState, String> {
    Ok(AutostartState {
        is_supported: false,
        is_registered: false,
    })
}

#[cfg(desktop)]
#[tauri::command]
pub(crate) fn get_autostart_state(app: AppHandle) -> Result<AutostartState, String> {
    use tauri_plugin_autostart::ManagerExt;
    let autostart_manager = app.autolaunch();
    let is_registered = autostart_manager
        .is_enabled()
        .map_err(|err| format!("{err}"))?;
    // IDEA: maybe this needs more complex logic for when there is a portable package for example
    let is_supported = true;
    Ok(AutostartState {
        is_supported,
        is_registered,
    })
}

// Enabling / disabling is managed in settings.rs

// Launch arguments are specified in lib.rs in `.setup(` closure
