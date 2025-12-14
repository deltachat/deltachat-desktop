pub mod csp;
pub mod sanitization;
mod truncate_text;

#[cfg(desktop)]
pub(crate) mod fs_watcher;
pub mod url_origin;

pub(crate) use truncate_text::truncate_text;
