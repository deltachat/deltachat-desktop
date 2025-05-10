#[cfg(target_os = "macos")]
pub mod mac_os;
pub mod mock;
#[cfg(target_os = "windows")]
pub mod windows;
#[cfg(any(
    target_os = "linux",
    target_os = "dragonfly",
    target_os = "freebsd",
    target_os = "openbsd",
    target_os = "netbsd"
))]
pub mod xdg;
