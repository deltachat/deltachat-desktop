use std::path::PathBuf;

use tauri::path::SafePathBuf;
use tauri::WebviewWindow;

#[tauri::command]
pub(crate) fn drag_file_out(
    window: WebviewWindow,
    // should be absolute path
    file_name: SafePathBuf,
) -> Result<(), String> {
    use drag::DragItem;

    //#[cfg(not(feature = "flatpak"))]

    let file_name: PathBuf = PathBuf::from(file_name.as_ref());

    let preview_icon =
        drag::Image::Raw(include_bytes!("../../../../images/electron-file-drag-out.png").to_vec());

    drag::start_drag(
        #[cfg(target_os = "linux")]
        &window
            .gtk_window()
            .map_err(|err| format!("failed tp get window.gtk_window: {err:?}"))?,
        #[cfg(not(target_os = "linux"))]
        &window,
        DragItem::Files(vec![file_name]),
        preview_icon,
        |result, position| log::info!("drag callback: {result:?} - {position:?}"),
        drag::Options {
            mode: drag::DragMode::Copy,
            ..drag::Options::default()
        },
    )
    .map_err(|err| format!("drag failed: {err:?}"))?;

    // #[cfg(feature = "flatpak")] {
    //     let transfer = ashpd::documents::FileTransfer::new()?;
    //     transfer.start_transfer(false, true);
    //     transfer.add_files();
    // }

    Ok(())
}
