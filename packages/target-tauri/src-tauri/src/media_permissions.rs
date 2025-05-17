use system_permissions::{Error as PermissionCheckError, PermissionKind, Status};

#[tauri::command]
pub(crate) fn check_media_permission(permission: PermissionKind) -> Result<Status, String> {
    // check system media permission
    let result = system_permissions::check(permission);

    match result {
        Err(PermissionCheckError::UnsupportedPlatform) | Ok(Status::Granted) => {
            // IDEA: also check if it is allowed in webview

            // On macOS all permissions are always allowed by default
            // https://github.com/tauri-apps/wry/blob/b7644ba41d28e922ee407e9020091e169b9071b8/src/wkwebview/class/wry_web_view_ui_delegate.rs#L74

            Ok(Status::Granted)
        }
        _ => result.map_err(|err| format!("{err:?}")),
    }
}

#[tauri::command]
pub(crate) async fn request_media_permission(permission: PermissionKind) -> Result<bool, String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    // set system media permission

    system_permissions::request(
        permission,
        Box::new(move |result: bool| {
            if tx.send(result).is_err() {
                log::error!("failed to send result")
            }
        }),
    )
    .map_err(|err| format!("{err:?}"))?;

    // IDEA: also set permission in webview

    // On macOS all permissions are always allowed by default
    // https://github.com/tauri-apps/wry/blob/b7644ba41d28e922ee407e9020091e169b9071b8/src/wkwebview/class/wry_web_view_ui_delegate.rs#L74
    rx.await.map_err(|err| format!("{err:?}"))
}
