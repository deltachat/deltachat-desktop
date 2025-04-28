#[cfg(target_os = "macos")]
mod mac;

/// For uri schemes
pub fn register_as_default_handler(url_scheme: &str) {
    #[cfg(target_os = "macos")]
    {
        let url_scheme_clone = url_scheme.to_owned();
        if let Err(err) = mac::register_as_default_handler(url_scheme, move |result| {
            if let Err(err) = result {
                log::error!(
                    "register_as_default_handler: failed to register as default handler for '{url_scheme_clone:?}', error: {err:?}"
                );
            } else {
                log::debug!(
                    "register_as_default_handler: registered as default handler for '{url_scheme_clone:?}'"
                );
            }
        }) {
            log::error!(
                "register_as_default_handler: failed to register as default handler for '{url_scheme:?}', error: {err:?}"
            );
        }
    }
    #[cfg(target_os = "windows")]
    {
        todo!();
    }
    #[cfg(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "openbsd",
        target_os = "netbsd"
    ))]
    {
        log::debug!(
            "register_as_default_handler: no-op on linux, it is suffient when it is defined in the .desktop-file"
        );
    }
}

/// Register as file handler
pub fn register_as_file_handler() {
    #[cfg(target_os = "macos")]
    {
        log::debug!("register_as_file_handler: on macos file handler needs to be defined in PList");
    }
    #[cfg(target_os = "windows")]
    {
        todo!();
    }
    #[cfg(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "openbsd",
        target_os = "netbsd"
    ))]
    {
        log::debug!(
            "register_as_file_handler: no-op on linux, it is suffient when it is defined in the .desktop-file"
        );
    }
}
