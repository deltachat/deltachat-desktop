use std::io::Cursor;

use base64::Engine;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, thiserror::Error)]
pub(crate) enum Error {
    #[error(transparent)]
    Clipboard(#[from] tauri_plugin_clipboard_manager::Error),
    #[error(transparent)]
    EncodingError(#[from] png::EncodingError),
}
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(format!("{self:?}").as_ref())
    }
}

// currently only used for parsing qr code from clipboard image
#[tauri::command]
pub(crate) fn get_clipboard_image_as_data_uri(app: AppHandle) -> Result<String, Error> {
    let img = app.clipboard().read_image()?;
    let mut bytes: Cursor<Vec<u8>> = Cursor::new(Vec::new());

    let mut encoder = png::Encoder::new(&mut bytes, img.width(), img.height());
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    let mut writer = encoder.write_header()?;
    writer.write_image_data(img.rgba())?;
    writer.finish()?;

    let data = bytes.into_inner();

    let base64_data = base64::prelude::BASE64_STANDARD.encode(&data);
    let mime_type = "image/png";
    let data_uri = format!("data:{};base64,{}", mime_type, base64_data);

    Ok(data_uri)
}
