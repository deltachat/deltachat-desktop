// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() -> std::process::ExitCode {
    let exit_code_i32 = deltachat_tauri_lib::run();
    let Ok(exit_code_u8) = u8::try_from(exit_code_i32) else {
        std::process::exit(exit_code_i32);
    };
    std::process::ExitCode::from(exit_code_u8)
}
