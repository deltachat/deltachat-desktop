use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutostartState {
    is_supported: bool,
    // This is not the same as enabled in the desktop settings,
    // this is the actual state not the desktop setting
    // on flatpak this can not be determined
    is_registered: Option<bool>,
}

#[cfg(not(desktop))]
#[tauri::command]
pub(crate) fn get_autostart_state(app: AppHandle) -> Result<AutostartState, String> {
    Ok(AutostartState {
        is_supported: false,
        is_registered: Some(false),
    })
}

#[cfg(all(desktop, feature = "flatpak"))]
#[tauri::command]
pub(crate) async fn get_autostart_state(_app: AppHandle) -> Result<AutostartState, String> {
    return Ok(AutostartState {
        is_supported: true,
        is_registered: None,
    });
}

#[cfg(all(desktop, feature = "flatpak"))]
pub(crate) async fn flatpak_set_auto_start(auto_start: bool) -> Result<(), ashpd::Error> {
    let response = ashpd::desktop::background::Background::request()
        .auto_start(auto_start)
        .command(["deltachat-tauri", "--autostart"])
        .send()
        .await;
    response?.response()?;
    Ok(())
}

#[cfg(all(desktop, not(feature = "flatpak")))]
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
        is_registered: Some(is_registered),
    })
}

// Enabling / disabling is managed in settings.rs

// Launch arguments are specified in lib.rs in `.setup(` closure
