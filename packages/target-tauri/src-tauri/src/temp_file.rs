use std::{ffi::OsStr, fmt::Display, fs::exists, path::PathBuf};

use base64::Engine;
use log::{info, warn};
use tauri::{path::SafePathBuf, AppHandle, Manager, State};
use tokio::{
    fs::{copy, create_dir, create_dir_all, read_dir, remove_dir_all, remove_file, File},
    io::AsyncWriteExt,
};

use crate::DeltaChatAppState;

const TMP_FOLDER_NAME: &str = "delta-tauri-tmp";

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Base64Decode(#[from] base64::DecodeError),
    InvalidFileName,
    PathNotValidUtf8,
    PathToDeleteOutsideOfTempDir,
    SourcePathOutsideOfBlobsDir,
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(format!("{self:?}").as_ref())
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("{self:?}"))
    }
}

pub fn get_temp_folder_path(app: &AppHandle) -> Result<PathBuf, tauri::Error> {
    Ok(app.path().temp_dir()?.join(TMP_FOLDER_NAME))
}

/// creates a temporary file in a temporary directory in the temp folder specied by [get_temp_folder_path]
///
/// It sanitizes the file name, to prevent path traversal,
/// and ensures that the file won't override any other files,
/// by creating a separate directory for it.
async fn create_tmp_file(app: &AppHandle, name: &str) -> Result<(File, PathBuf), Error> {
    // Technically `SafePathBuf` is not necessary here,
    // since we take the last component anyway, but let's still use it
    // for good measure.
    let file_as_path = SafePathBuf::new(name.into()).map_err(|_| Error::InvalidFileName)?;

    // (make sure filename can not escape)
    let dir = get_temp_folder_path(app)?.join(uuid::Uuid::new_v4().to_string());
    create_dir(&dir).await?;

    let file_name = file_as_path
        .as_ref()
        .file_name()
        .ok_or(Error::InvalidFileName)?;
    let file_path = dir.join(file_name);

    assert!(file_path.components().next_back().unwrap().as_os_str() == file_name);
    assert!(file_path
        .components()
        .rev()
        .skip(1)
        .any(|c| c.as_os_str() == OsStr::new(TMP_FOLDER_NAME)));
    let file_handle = File::create(&file_path).await?;

    Ok((file_handle, file_path))
}

// delete tmp file
async fn delete_tmp_file(app: &AppHandle, path: SafePathBuf) -> Result<(), Error> {
    let tmpdir = get_temp_folder_path(app)?.canonicalize()?;
    let resolved_path = path.as_ref().canonicalize()?;
    // Checking `resolved_path.parent()` and not `resolved_path` itself
    // because `tmpdir.starts_with(tmpdir) == true`.
    if !resolved_path
        .parent()
        .ok_or(Error::PathToDeleteOutsideOfTempDir)?
        .starts_with(tmpdir)
    {
        return Err(Error::PathToDeleteOutsideOfTempDir);
    }
    if resolved_path.try_exists()? {
        assert!(resolved_path
            .components()
            .rev()
            .skip(1)
            .any(|c| c.as_os_str() == OsStr::new(TMP_FOLDER_NAME)));
        assert!(!resolved_path
            .components()
            .any(|c| matches!(c, std::path::Component::ParentDir)));
        remove_file(resolved_path).await?
        // empty directory remains, but that is not a problem as the name is random and they are cleared on restart.
    }
    Ok(())
}

// normalize/resolve path, then take absolute path and check if it starts with tmp folder path

// create tmp folder
pub(crate) async fn create_tmp_folder(app: &AppHandle) -> Result<(), Error> {
    let tmp_folder = get_temp_folder_path(app)?;
    info!("using temp folder at {tmp_folder:?}");
    create_dir_all(get_temp_folder_path(app)?).await?;
    Ok(())
}

// Used on app startup and shutdown.
/// remove all tmp files
pub(crate) async fn clear_tmp_folder(app: &AppHandle) -> Result<(), Error> {
    let tmp_folder = get_temp_folder_path(app)?;
    if !exists(&tmp_folder)? {
        warn!("tmp folder does not exist at: {tmp_folder:?}");
        return Ok(());
    }

    let mut items = 0;
    assert!(tmp_folder
        .components()
        .rev()
        .any(|c| c.as_os_str() == OsStr::new(TMP_FOLDER_NAME)));
    let mut entries = read_dir(tmp_folder).await?;
    while let Some(entry) = entries.next_entry().await? {
        if entry.metadata().await?.is_dir() {
            remove_dir_all(entry.path()).await?;
        } else {
            remove_file(entry.path()).await?;
        }
        items += 1;
    }

    info!("cleared {items} items from tmp folder");

    Ok(())
}

const BASE64_ENGINE: base64::engine::GeneralPurpose = base64::engine::GeneralPurpose::new(
    &base64::alphabet::STANDARD,
    base64::engine::GeneralPurposeConfig::new()
        .with_decode_padding_mode(base64::engine::DecodePaddingMode::Indifferent),
);
// Tauri Commands
// ==============

// writeTempFileFromBase64
/// just accepts the raw base64 string, not data urls
///
/// The base64 decoder used is padding-indifferent,
/// i.e. different base64 strings may produce the same binary contents.
#[tauri::command]
pub(crate) async fn write_temp_file_from_base64(
    app: AppHandle,
    name: &str,
    content: &str,
) -> Result<String, Error> {
    let base64_data = BASE64_ENGINE.decode(content)?;
    let (mut file_handle, file_path) = create_tmp_file(&app, name).await?;
    file_handle.write_all(&base64_data).await?;

    Ok(file_path
        .to_str()
        .ok_or(Error::PathNotValidUtf8)?
        .to_owned())
}

// writeTempFile
#[tauri::command]
pub(crate) async fn write_temp_file(
    app: AppHandle,
    name: &str,
    content: &str,
) -> Result<String, Error> {
    let (mut file_handle, file_path) = create_tmp_file(&app, name).await?;
    file_handle.write_all(content.as_bytes()).await?;

    Ok(file_path
        .to_str()
        .ok_or(Error::PathNotValidUtf8)?
        .to_owned())
}

// removeTempFile
#[tauri::command]
pub(crate) async fn remove_temp_file(app: AppHandle, path: SafePathBuf) -> Result<(), Error> {
    delete_tmp_file(&app, path).await
}

//copyBlobFileToInternalTmpDir
/// It fails if `file_name` is not a plain name (e.g. includes parent dir);
/// if `source_path` is not a file inside of one of accounts' blobs dir.
#[tauri::command]
pub(crate) async fn copy_blob_file_to_internal_tmp_dir(
    app: AppHandle,
    dc: State<'_, DeltaChatAppState>,
    file_name: &str,
    source_path: SafePathBuf,
) -> Result<String, Error> {
    let source_path = source_path.as_ref();

    {
        let maybe_blobs_dir = source_path
            .parent()
            .ok_or(Error::SourcePathOutsideOfBlobsDir)?;
        if maybe_blobs_dir
            .file_name()
            .ok_or(Error::SourcePathOutsideOfBlobsDir)?
            != "dc.db-blobs"
        {
            return Err(Error::SourcePathOutsideOfBlobsDir);
        }

        let maybe_accounts_dir = maybe_blobs_dir
            .parent()
            .ok_or(Error::SourcePathOutsideOfBlobsDir)?
            .parent()
            .ok_or(Error::SourcePathOutsideOfBlobsDir)?;
        if maybe_accounts_dir
            .to_str()
            .ok_or(Error::SourcePathOutsideOfBlobsDir)?
            != dc.accounts_dir
        {
            return Err(Error::SourcePathOutsideOfBlobsDir);
        }
    }

    let (file_handle, file_path) = create_tmp_file(&app, file_name).await?;
    drop(file_handle);
    copy(source_path, file_path.clone()).await?;

    Ok(file_path
        .to_str()
        .ok_or(Error::PathNotValidUtf8)?
        .to_owned())
}
