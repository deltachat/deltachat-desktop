use tauri::{Manager, WebviewWindow};

#[tauri::command]
pub(crate) fn open_help_window(
    app: tauri::AppHandle,
    locale: &str,
    anchor: Option<&str>,
) -> Result<(), String> {
    // TODO: support for languages (if help file/directory for language code exists open it, otherwise open english version)
    let app_url = tauri::WebviewUrl::App("help/en/help.html".into());

    let mut help_window: WebviewWindow = if let Some(help_window) = app.get_webview_window("help") {
        help_window
    } else {
        tauri::WebviewWindowBuilder::new(&app, "help", app_url.clone())
            .build()
            .map_err(|err| format!("{err:#}"))?
    };
    help_window.show().map_err(|err| format!("{err:#}"))?;

    let mut url = help_window.url().map_err(|err| format!("{err:#}"))?;
    url.set_fragment(anchor);
    help_window
        .navigate(url)
        .map_err(|err| format!("{err:#}"))?;



    Ok(())
}
