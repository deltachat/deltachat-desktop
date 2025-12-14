use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
enum RuntimeTarget {
    Tauri,
    // Browser,
    // Electron,
}

#[derive(Debug, Serialize)]
struct VersionInformation {
    label: &'static str,
    value: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
struct BuildInfo {
    version: &'static str,
    git_ref: &'static str,
    build_timestamp: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TauriSpecificScheme {
    blobs: &'static str,
    chat_background_image: &'static str,
    webxdc_icon: &'static str,
    stickers: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TauriSpecific {
    scheme: TauriSpecificScheme,
}

/// information about the runtime as defined in packages/shared/shared-types.d.ts - make sure to look there to keep it in sync
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeInfo {
    /// used to determine wether to use borderless design and to use command key in shortcuts or not
    is_mac: bool,
    is_appx: bool,
    target: RuntimeTarget,
    versions: Vec<VersionInformation>,
    // runningUnderARM64Translation - not used by tauri runtime and is optional
    // rpcServerPath - not used by tauri runtime and is optional
    build_info: BuildInfo,
    is_content_protection_supported: bool,
    hide_emoji_and_sticker_picker: bool,
    tauri_specific: TauriSpecific,
}

#[tauri::command]
pub fn get_runtime_info() -> RuntimeInfo {
    let webview_version =
        tauri::webview_version().unwrap_or("Error calling tauri::webview_version()".to_string());

    let tauri_specific = TauriSpecific {
        #[cfg(not(any(target_os = "windows", target_os = "android")))]
        scheme: TauriSpecificScheme {
            blobs: "dcblob://",
            chat_background_image: "dcchatbgimage://dummy.host/",
            webxdc_icon: "webxdc-icon://",
            stickers: "dcsticker://",
        },
        #[cfg(any(target_os = "windows", target_os = "android"))]
        scheme: TauriSpecificScheme {
            blobs: "http://dcblob.localhost/",
            chat_background_image: "http://dcchatbgimage.localhost/",
            webxdc_icon: "http://webxdc-icon.localhost/",
            stickers: "http://dcsticker.localhost/",
        },
    };

    RuntimeInfo {
        is_mac: cfg!(target_os = "macos"),
        is_appx: false, // TODO: check if windows and if appx
        target: RuntimeTarget::Tauri,
        versions: vec![
            VersionInformation {
                label: "Tauri",
                value: tauri::VERSION.to_owned(),
            },
            VersionInformation {
                label: "Webview",
                value: webview_version,
            },
        ],
        build_info: BuildInfo {
            version: env!("CARGO_PKG_VERSION"),
            // this is set in build.rs
            git_ref: env!("BUILD_INFO_GIT"),
            // this is set in build.rs
            build_timestamp: env!("BUILD_TIME_STAMP").parse().unwrap_or(1), // 1 instead of 0, ss that we can identify the issue
        },
        is_content_protection_supported: cfg!(target_os = "macos") || cfg!(target_os = "windows"),
        hide_emoji_and_sticker_picker: cfg!(target_os = "ios"),
        tauri_specific,
    }
}
