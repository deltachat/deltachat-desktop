use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let source_date_epoch = std::env::var("SOURCE_DATE_EPOCH").unwrap_or("".to_owned());
    let build_time_stamp = if !source_date_epoch.is_empty() {
        source_date_epoch
            .parse::<u128>()
            .expect("unable to parse SOURCE_DATE_EPOCH")
            * 1000
    } else {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
    };

    println!("cargo:rustc-env=BUILD_TIME_STAMP={build_time_stamp}");
    println!("cargo:rustc-env=BUILD_INFO_GIT={}", get_git_ref());

    tauri_build::try_build(tauri_build::Attributes::default().app_manifest(
        // By default, Tauri enables all commands in all windows
        // (source: https://github.com/tauri-apps/tauri/pull/9008).
        // Adding `.commands()` explicitly here makes it generate
        // permissions for the commands, and makes it require to specify
        // the permissions for our commands in capabilities explicitly
        // for each window / webview.
        // see also https://docs.rs/tauri-build/latest/tauri_build/struct.AppManifest.html
        // and https://v2.tauri.app/security/permissions/
        tauri_build::AppManifest::default().commands(&[
            // When adding a command, don't forget to also add it
            // to `invoke_handler()` in `lib.rs`, and to `permissions`
            // in `capabilities`.
            "greet",
            "set_main_window_channels",
            "get_frontend_run_config",
            "deltachat_jsonrpc_request",
            "ui_ready",
            "ui_frontend_ready",
            "get_current_logfile",
            "copy_image_to_clipboard",
            "get_autostart_state",
            "get_app_path",
            "get_clipboard_image_as_data_uri",
            "download_file",
            "show_open_file_dialog",
            "get_locale_data",
            "change_lang",
            "write_temp_file_from_base64",
            "write_temp_file",
            "remove_temp_file",
            "copy_blob_file_to_internal_tmp_dir",
            "copy_background_image_file",
            "on_webxdc_message_changed",
            "on_webxdc_message_deleted",
            "on_webxdc_status_update",
            "on_webxdc_realtime_data",
            "delete_webxdc_account_data",
            "close_all_webxdc_instances",
            "debug_get_datastore_ids",
            "open_webxdc",
            "send_webxdc_update",
            "get_webxdc_updates",
            "join_webxdc_realtime_channel",
            "leave_webxdc_realtime_channel",
            "send_webxdc_realtime_data",
            "register_webxdc_channel",
            "webxdc_send_to_chat",
            "get_runtime_info",
            "change_desktop_settings_apply_side_effects",
            "open_help_window",
            "open_html_window",
            "get_html_window_info",
            "html_email_open_menu",
            "html_email_set_load_remote_content",
            "update_tray_icon_badge",
            "get_available_themes",
            "get_theme",
            "get_current_active_theme_address",
            "show_notification",
            "clear_notifications",
            "clear_all_notifications",
            "check_media_permission",
            "request_media_permission",
            "drag_file_out",
        ]),
    ))
    .expect("failed to run tauri-build");
}

fn gather_process_stdout(command: &str, args: &[&str]) -> Result<String, String> {
    let output = std::process::Command::new(command)
        .args(args)
        .output()
        .map_err(|err| err.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err("Command failed to execute".to_string())
    }
}

fn get_git_ref() -> String {
    if let Ok(git_ref) = std::env::var("VERSION_INFO_GIT_REF") {
        return git_ref;
    }

    let git_describe = gather_process_stdout("git", &["describe", "--tags"])
        .expect("git describe failed;Hint: you could also set VERSION_INFO_GIT_REF manually");
    let git_branch;

    if let Ok(git_symbolic_ref) =
        std::env::var("GITHUB_HEAD_REF").or_else(|_| std::env::var("GITHUB_REF"))
    {
        git_branch = git_symbolic_ref
            .split('/')
            .next_back()
            .unwrap_or("main")
            .to_string();
        println!("{git_symbolic_ref} {git_branch}");
    } else {
        git_branch = gather_process_stdout("git", &["symbolic-ref", "HEAD"])
            .map(|r| r.split('/').next_back().unwrap_or("main").to_owned())
            .unwrap_or("main".to_owned())
            .to_string();
    }

    if git_branch == "main" {
        git_describe
    } else {
        format!("{git_describe}-{git_branch}")
    }
}
