//! Detector to find out whether computer resumed from sleep
//!
//! Why?
//! internet connection and imap connection gets broken by sleep
//! and needs to be reconnected
//!
//! How?
//! While we could have looked into talking with system apis (like https://github.com/pewsheen/psp),
//! For now we choose a much simpler solution: check for jumps in system time

use std::time::{Duration, SystemTime};

use tauri::{async_runtime::spawn, AppHandle, Manager};
use tokio::time::sleep;

use crate::{state::main_window_channels::MainWindowEvents, MainWindowChannels};

const PROBE_INTERVAL: Duration = Duration::from_secs(60);
// smallest sleep duration we can detect with this
const JUMP_DETECTION_THRESHOLD: Duration = Duration::from_secs(3);

pub(crate) fn start_resume_after_sleep_detector(app: &AppHandle) {
    let cloned_app = app.clone();
    spawn(async move {
        let threshold = PROBE_INTERVAL + JUMP_DETECTION_THRESHOLD;
        // Using `SystemTime` instead of `Instant` because instant pauses on sleep in my tests,
        // it is also documented in `Instant` that it doesn't measure time linearly.
        let mut last_time = SystemTime::now();
        loop {
            sleep(PROBE_INTERVAL).await;
            let now = SystemTime::now();
            // log::debug!(
            //     "{:?}",
            //     now.duration_since(last_time)
            //         .unwrap_or(Duration::from_secs(1))
            // );
            if now
                .duration_since(last_time)
                .unwrap_or(Duration::from_secs(1))
                > threshold
            {
                log::info!("Potential resume after sleep detected");
                if let Err(err) = cloned_app
                    .state::<MainWindowChannels>()
                    .emit_event(MainWindowEvents::ResumeFromSleep)
                    .await
                {
                    log::error!("failed to inform frontend about resume from sleep: {err:?}");
                }
            }
            last_time = SystemTime::now();
        }
    });
}
