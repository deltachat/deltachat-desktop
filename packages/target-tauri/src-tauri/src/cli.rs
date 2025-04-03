use std::process::exit;

use chrono::DateTime;
use clap::Parser;

use crate::run_config::RunConfig;

#[derive(Parser)]
#[command(about, long_about = None)]
pub struct Cli {
    #[cfg(target_os = "macos")]
    /// Start deltachat in minimized mode
    #[arg(short, long)]
    minimized: bool,
    #[cfg(not(target_os = "macos"))]
    /// Start deltachat in minimized mode with tray icon
    /// (tray icon will be activated for this session regardless whether it's disabled)
    #[arg(short, long)]
    minimized: bool,
    /// opens devtools and activates --log-debug & --log-to-console
    #[arg(long)]
    dev_mode: bool,
    /// Log debug messages
    #[arg(long)]
    log_debug: bool,
    /// Output the log to stdout / Browser dev console
    #[arg(long)]
    log_to_console: bool,
    /// Print version
    #[arg(short = 'V', long)]
    version: bool,
}

pub fn parse_cli_options() -> RunConfig {
    let mut cli = Cli::parse();

    if cli.version {
        println!(
            r"Delta Tauri {} (git: {}, built on {})
Chatmail Core: {} (released on {})
Tauri: {}
Webview: {:?}",
            env!("CARGO_PKG_VERSION"),
            env!("BUILD_INFO_GIT"),
            env!("BUILD_TIME_STAMP")
                .parse::<i64>()
                .map(|millis| DateTime::from_timestamp_millis(millis)
                    .map(|date| date.to_string())
                    .unwrap_or("??".to_owned()))
                .unwrap_or("?".to_owned()),
            *deltachat::constants::DC_VERSION_STR,
            *deltachat::release::DATE,
            tauri::VERSION,
            tauri::webview_version().unwrap_or("?".to_owned())
        );
        exit(0)
    }

    // enable devmode automatically when running via `pnpm tauri dev`
    cli.dev_mode = cfg!(debug_assertions);

    RunConfig {
        log_debug: cli.dev_mode || cli.log_debug,
        log_to_console: cli.dev_mode || cli.log_to_console,
        devtools: cli.dev_mode,
        dev_mode: cli.dev_mode,
        minimized_window: cli.minimized,
        // Tray icon is not forced on macOS because the app icon is still in the Dock,
        // even when Delta Chat has no visible window
        forced_tray_icon: cli.minimized && !cfg!(target_os = "macos"),
    }
}
