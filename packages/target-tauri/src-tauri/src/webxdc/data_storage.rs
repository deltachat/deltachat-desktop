// Data is stored per webxdc app,
// because windows and android only has one origin in the custom scheme,
// we need multiple origins to isolate the webxdc app from eachother.
// To make things easier we also make a new context for each app on the other platforms.
//
// - On macOS/iOS it it uses a datastore id which contains a given prefix, account id and instance id
//
// - On other platforms it uses a seperate folder
//   in the data folder that contains the accound id and a folder for each app (named by instance id)

#[cfg(not(target_vendor = "apple"))]
use std::path::PathBuf;

#[cfg(target_vendor = "apple")]
use log::trace;
use tauri::{AppHandle, Manager, Runtime, WebviewWindowBuilder};

use super::error::Error;

#[cfg(not(target_vendor = "apple"))]
use tokio::fs::{create_dir_all, remove_dir_all};

#[cfg(target_vendor = "apple")]
const DATA_STORE_PREFIX: &[u8; 8] = b"webxdc__";

#[cfg(target_vendor = "apple")]
fn build_data_store_id(account_id: u32, instance_id: u32) -> [u8; 16] {
    let account_id_bytes: [u8; 4] = account_id.to_be_bytes();
    let instance_id_bytes: [u8; 4] = instance_id.to_be_bytes();

    let mut data_store_id = [0; 16];
    data_store_id[..8].copy_from_slice(DATA_STORE_PREFIX);
    data_store_id[8..12].copy_from_slice(&account_id_bytes);
    data_store_id[12..].copy_from_slice(&instance_id_bytes);
    data_store_id
}

#[cfg(target_vendor = "apple")]
fn account_id_from_store_id(data_store_id: &[u8; 16]) -> u32 {
    // rust type system needs "try_into().unwrap()" here, because it does not understand yet that
    //  [8..12] returns exactly [u8; 4] and not a slice with an unknown length ([u8])
    let bytes: [u8; 4] = data_store_id[8..12].try_into().unwrap();
    u32::from_be_bytes(bytes)
}

#[cfg(not(target_vendor = "apple"))]
fn path_to_webxdc_browser_data_dir(app: &AppHandle, account_id: u32) -> Result<PathBuf, Error> {
    let local_data = app.path().app_local_data_dir()?;
    Ok(local_data
        .join("WebxdcBrowsingData")
        .join(format!("acc_{account_id}")))
}

#[allow(unused_variables)]
pub(super) async fn set_data_store<'a, R: Runtime, M: Manager<R>>(
    app: &AppHandle,
    builder: WebviewWindowBuilder<'a, R, M>,
    account_id: u32,
    instance_id: u32,
) -> Result<WebviewWindowBuilder<'a, R, M>, Error> {
    #[cfg(target_vendor = "apple")]
    {
        trace!(
            "build_data_store_id: {:?}",
            build_data_store_id(account_id, instance_id)
        );
        Ok(builder.data_store_identifier(build_data_store_id(account_id, instance_id)))
    }

    #[cfg(not(target_vendor = "apple"))]
    {
        let browser_data_dir =
            path_to_webxdc_browser_data_dir(app, account_id)?.join(instance_id.to_string());
        create_dir_all(&browser_data_dir).await?;
        Ok(builder.data_directory(browser_data_dir))
    }
}

#[allow(unused_variables)]
pub(super) async fn delete_webxdc_data_for_instance(
    app: &AppHandle,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    #[cfg(target_vendor = "apple")]
    {
        app.remove_data_store(build_data_store_id(account_id, instance_id))
            .await?;
    }

    #[cfg(not(target_vendor = "apple"))]
    {
        let path = path_to_webxdc_browser_data_dir(app, account_id)?.join(instance_id.to_string());
        remove_dir_all(path).await?;
    }

    Ok(())
}

#[allow(unused_variables)]
pub(super) async fn delete_webxdc_data_for_account(
    app: &AppHandle,
    account_id: u32,
) -> Result<(), Error> {
    #[cfg(target_vendor = "apple")]
    {
        let all_data_stores: Vec<[u8; 16]> = app.fetch_data_store_identifiers().await?;
        for data_store_id in all_data_stores
            .iter()
            .filter(|id| account_id_from_store_id(id) == account_id)
        {
            app.remove_data_store(*data_store_id).await?
        }
    }

    #[cfg(not(target_vendor = "apple"))]
    {
        let path = path_to_webxdc_browser_data_dir(app, account_id)?;
        remove_dir_all(path).await?;
    }

    Ok(())
}

#[cfg(target_vendor = "apple")]
#[tauri::command]
pub(crate) async fn debug_get_datastore_ids(app: AppHandle) -> Result<Vec<[u8; 16]>, String> {
    app.fetch_data_store_identifiers()
        .await
        .map_err(|err| format!("{:?}", err))
}
