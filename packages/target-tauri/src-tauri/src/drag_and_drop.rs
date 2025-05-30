use std::path::PathBuf;

use tauri::path::SafePathBuf;
use tauri::{AppHandle, WebviewWindow};

#[tauri::command]
pub(crate) async fn drag_file_out(
    app: AppHandle,
    window: WebviewWindow,
    // should be absolute path
    file_name: SafePathBuf,
) -> Result<(), String> {
    log::debug!("drag_file_out: {file_name:?}");
    let file: PathBuf = PathBuf::from(file_name.as_ref());

    use drag::DragItem;
    let preview_icon =
        drag::Image::Raw(include_bytes!("../../../../images/electron-file-drag-out.png").to_vec());

    app.run_on_main_thread(move || {
        if let Err(error) = drag::start_drag(
            #[cfg(target_os = "linux")]
            &window
                .gtk_window()
                .map_err(|err| format!("failed tp get window.gtk_window: {err:?}"))?,
            #[cfg(not(target_os = "linux"))]
            &window,
            DragItem::Files(vec![file]),
            preview_icon,
            |result, position| log::info!("drag callback: {result:?} - {position:?}"),
            drag::Options {
                mode: drag::DragMode::Copy,
                ..drag::Options::default()
            },
        ) {
            log::error!("drag failed: {error:?}")
        }
        // .map_err(|err| format!("drag failed: {err:?}"))?;
    })
    .map_err(|err| format!("drag failed: failed to run on main thread: {err:?}"))?;
    Ok(())
}

// TODO method to receive files
