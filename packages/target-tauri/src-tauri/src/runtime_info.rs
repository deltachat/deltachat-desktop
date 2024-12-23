use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
enum RuntimeTarget {
    Tauri,
    Browser,
    Electron,
}

#[derive(Debug, Serialize)]
struct VersionInformation<'a> {
    label: &'a str,
    value: &'a str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
struct BuildInfo<'a> {
    version: &'a str,
    git_ref: &'a str,
    build_timestamp: u64,
}

/// information about the runtime as defined in packages/shared/shared-types.d.ts - make sure to look there to keep it in sync
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeInfo<'a> {
    /// used to determine wether to use borderless design and to use command key in shortcuts or not
    is_mac: bool,
    is_appx: bool,
    target: RuntimeTarget,
    versions: Vec<VersionInformation<'a>>,
    // runningUnderARM64Translation - not used by tauri runtime and is optional
    // rpcServerPath - not used by tauri runtime and is optional
    build_info: BuildInfo<'a>,
    hide_emoji_and_sticker_picker: bool,
}

#[tauri::command]
pub fn get_runtime_info<'a>() -> RuntimeInfo<'a> {
    RuntimeInfo {
        is_mac: cfg!(target_os = "macos"),
        is_appx: false, // TODO: check if windows and if appx
        target: RuntimeTarget::Tauri,
        versions: vec![], // TODO: (tauri version, wry version, webkit/webview version)
        build_info: BuildInfo {
            version: env!("CARGO_PKG_VERSION"),
            git_ref: "?", // TODO: set this in build.rs
            // this is set in build.rs
            build_timestamp: env!("BUILD_TIME_STAMP").parse().unwrap_or(1), // 1 instead of 0, ss that we can identify the issue
        },
        hide_emoji_and_sticker_picker: cfg!(target_os = "ios"),
    }
}
