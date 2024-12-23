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
    // TODO find and set git ref

    tauri_build::build()
}
