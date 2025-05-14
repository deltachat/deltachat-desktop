use std::path::PathBuf;

use tauri::path::SafePathBuf;
use tauri::WebviewWindow;

#[tauri::command]
pub(crate) async fn drag_file_out(
    window: WebviewWindow,
    // should be absolute path
    file_name: SafePathBuf,
) -> Result<(), String> {
    let file: PathBuf = PathBuf::from(file_name.as_ref());

    // #[cfg(feature = "flatpak")]
    // {
    //     use std::os::fd::AsFd;
    //     let file = std::fs::File::open(file).map_err(|err| format!("can't open file {err:?}"))?;

    //     let transfer = ashpd::documents::FileTransfer::new()
    //         .await
    //         .map_err(|err| format!("fasiled to create transfer: {err:?}"))?;
    //     let key = transfer
    //         .start_transfer(false, true)
    //         .await
    //         .map_err(|err| format!("fasiled to start transfer: {err:?}"))?;
    //     transfer
    //         .add_files(&key, &[file])
    //         .await
    //         .map_err(|err| format!("failed add file to transfer: {err:?}"))?;

    //     // TODO: somehow needs to replace the file with a file transfer file
    //     // that contains the transfer key and is of mimetype "application/vnd.portal.filetransfer
    //     //
    //     // seems to not be supported yet, I suggest we add another DragItem type f
    // }

    use drag::DragItem;
    let preview_icon =
        drag::Image::Raw(include_bytes!("../../../../images/electron-file-drag-out.png").to_vec());

    drag::start_drag(
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
    )
    .map_err(|err| format!("drag failed: {err:?}"))?;

    Ok(())
}

// TODO method to receive files
