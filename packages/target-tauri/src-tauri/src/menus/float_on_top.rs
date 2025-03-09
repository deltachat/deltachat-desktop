use std::sync::atomic::AtomicBool;

use tauri::WebviewWindow;

// TODO: there should also be an option in tauri to get current float on top state,
// so that we don't need to track it ourselves
// especially needed when we get other windows that can have multiple instances
// (html window and webxdc)
pub static MAIN_FLOATING: AtomicBool = AtomicBool::new(false);
pub static HELP_FLOATING: AtomicBool = AtomicBool::new(false);

pub fn set_float_on_top_based_on_main_window(
    window: &WebviewWindow,
    window_float_on_top_state: &AtomicBool,
) {
    // TODO: is relaxed the correct ordering
    if MAIN_FLOATING.load(std::sync::atomic::Ordering::Relaxed) {
        let _ = window.set_always_on_top(true);
        window_float_on_top_state.store(true, std::sync::atomic::Ordering::Relaxed);
    }
}
