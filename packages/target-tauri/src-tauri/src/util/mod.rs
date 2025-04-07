pub mod csp;
pub mod sanitization;
mod truncate_text;

#[cfg(desktop)]
pub(crate) mod fs_watcher;

pub(crate) use truncate_text::truncate_text;
