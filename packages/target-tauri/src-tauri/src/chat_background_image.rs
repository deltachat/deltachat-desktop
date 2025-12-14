use std::path::{Path, PathBuf};

use anyhow::Context;
use rand::distr::SampleString;
use tauri::{utils::mime_type::MimeType, Manager, UriSchemeContext, UriSchemeResponder};
use tokio::fs;

pub(crate) fn delta_chat_background_image_protocol<R: tauri::Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: http::Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // info!("dcchatbgimage {}", request.uri());

    // URI format is
    // - Mac, linux, iOS: dcchatbgimage://dummy.host/<file_name>
    // - windows, android: http://dcchatbgimage.localhost/<file_name>

    if ctx.webview_label() != "main" {
        log::error!(
            "prevented other window from accessing dcchatbgimage:// scheme (webview label: {})",
            ctx.webview_label()
        );
        return;
    }

    let bg_images_dir = get_background_images_dir(ctx.app_handle());

    let try_respond = async move || -> anyhow::Result<()> {
        let uri_path = request.uri().path();

        let file_name = uri_path.strip_prefix('/').unwrap_or(uri_path);
        let file_name = percent_encoding::percent_decode_str(file_name).decode_utf8()?;
        let file_name = Path::new(file_name.as_ref())
            .file_name()
            .with_context(|| format!("invalid file name {file_name}"))?;

        let file_path = bg_images_dir?.join(file_name);
        let mut components_rev = file_path.components().rev();
        assert_eq!(components_rev.next().unwrap().as_os_str(), file_name);
        assert_eq!(components_rev.next().unwrap().as_os_str(), "background");
        assert!(!file_path
            .components()
            .any(|c| matches!(c, std::path::Component::ParentDir)));

        let blob = fs::read(&file_path).await?;

        let res = http::Response::builder()
            .status(http::StatusCode::OK)
            .header(
                http::header::CONTENT_TYPE,
                MimeType::parse_with_fallback(
                    &blob,
                    file_name.to_str().context(format!(
                        "failed to convert blob file name {file_name:?} to str"
                    ))?,
                    MimeType::OctetStream,
                ),
            )
            .body(blob)?;
        responder.respond(res);
        Ok(())
    };
    tauri::async_runtime::spawn(async move {
        try_respond()
            .await
            .inspect_err(|err| {
                log::error!("Failed to build reply for dcchatbgimage protocol: {err:#}")
            })
            .ok();
    });
}

/// Takes an arbitrary file path, copies it to "background" directory,
/// deletes the old chat background file from the "background" directory
/// and returns a string containing the new file name, in the format
/// "img: background_{random_alphanumeric_str}.{src_file_ext}".
///
/// When `is_default_picture == true`, `src_path` can be just a file name,
/// referring to an asset file in `images/backgrounds`.
#[tauri::command]
pub(crate) async fn copy_background_image_file<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    src_path: &Path,
    is_default_picture: bool,
) -> Result<String, String> {
    copy_background_image_file_(app, src_path, is_default_picture)
        .await
        .map_err(|err| err.to_string())
}

async fn copy_background_image_file_<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    src_path: &Path,
    is_default_picture: bool,
) -> anyhow::Result<String> {
    let bg_images_dir = get_background_images_dir(&app)
        .context("failed to get the chat background images directory")?;

    log::info!("Copying the new chat background image {src_path:?} to the backgroud images directory {bg_images_dir:?}...");

    if let Err(err) = fs::create_dir(&bg_images_dir).await {
        if err.kind() == std::io::ErrorKind::AlreadyExists {
            log::debug!("chat background images directory already exists");
        } else {
            anyhow::bail!(
                "failed to create chat background images directory at {bg_images_dir:?}: {err}"
            );
        }
    };

    let file_stem_start = "background_";

    // Remove the old file.
    // We expect only one file to be there, but we'll handle the case
    // when there are other files for some reason.
    assert_eq!(
        bg_images_dir.components().next_back().unwrap().as_os_str(),
        "background"
    );
    let mut read_dir = fs::read_dir(&bg_images_dir).await?;
    let mut iters_left: usize = 100;
    while let Some(entry) = read_dir.next_entry().await? {
        if iters_left == 0 {
            // Sanity check. We don't expect this many files in the directory.
            log::error!("can't remove the old file: too many files in the background directory");
            break;
        }
        iters_left -= 1;

        let old_file_path = entry.path();

        let old_file_has_expected_name = old_file_path
            .file_stem()
            .map(|stem| stem.to_string_lossy().starts_with(file_stem_start))
            .unwrap_or(false);

        if !old_file_has_expected_name {
            // Let's not delete file and just proceed.
            // Maybe it's just some random file that somehow ended up here.
            log::warn!("wanted to remove the old chat background image file, but found an unexpected file in the directory ({old_file_path:?}). Proceeding without removing the file.");
            continue;
        }

        fs::remove_file(&old_file_path)
            .await
            .context("failed to delete the old chat background image file")
            .inspect_err(|err| log::error!("{err}"))
            .inspect(|_| log::info!("deleted old chat background file {old_file_path:?}"))
            .ok();
        // After removing one file, don't try to remove any more.
        break;
    }

    let dst_file_name = {
        // Add some random chars to make the file name unique
        // to make sure the browser doesn't use a cached version.
        let rand_chars = rand::distr::Alphanumeric.sample_string(&mut rand::rng(), 8);

        let mut name = PathBuf::new();
        name.set_file_name(format!("{file_stem_start}{rand_chars}"));
        if let Some(ext) = src_path.extension() {
            name.set_extension(ext);
        }

        assert_eq!(name.components().count(), 1);
        name
    };
    let dst_path = {
        let path = bg_images_dir.join(&dst_file_name);
        let mut components_rev = path.components().rev();

        assert_eq!(components_rev.next().unwrap().as_os_str(), dst_file_name);
        assert_eq!(components_rev.next().unwrap().as_os_str(), "background");
        assert!(!path
            .components()
            .any(|c| matches!(c, std::path::Component::ParentDir)));
        path
    };

    if is_default_picture {
        let src_file_name = src_path
            .file_name()
            .with_context(|| format!("invalid src_path {src_path:?}: no file name"))?
            .to_str()
            .with_context(|| format!("invalid unicode file name {src_path:?}"))?;
        let asset = app
            .asset_resolver()
            .get(format!("images/backgrounds/{src_file_name}"))
            .with_context(|| format!("no such default chat background image {src_file_name:?}"))?;

        fs::write(&dst_path, asset.bytes()).await
    } else {
        fs::copy(&src_path, &dst_path).await.map(|_| ())
    }
    .context("failed to copy chat background file")?;

    log::info!("Copied the new chat background image {src_path:?} to {dst_path:?}");

    Ok(format!(
        "img: {}",
        dst_file_name
            .to_str()
            .context("failed to convert back to str")?
    ))
}

fn get_background_images_dir<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> tauri::Result<PathBuf> {
    Ok(app.path().app_data_dir()?.join("background"))
}
