use std::cell::RefCell;

use objc2::AnyThread;
use objc2_app_kit::NSWorkspace;
use objc2_foundation::{NSBundle, NSError, NSString, NSURL};

pub fn register_as_default_handler(
    url_scheme: &str,
    callback: impl Fn(Result<(), String>) + 'static,
) -> Result<(), String> {
    unsafe {
        let bundle_path = NSBundle::mainBundle().bundlePath();

        if !bundle_path.to_string().ends_with(".app") {
            return Err(format!(
                "Not inside of a bundle, this is normal when you run with `tauri dev`: {bundle_path:?}"
            ));
        }

        let workspace = NSWorkspace::sharedWorkspace();

        let application_url_object = NSURL::alloc();
        let application_url_object =
            NSURL::initFileURLWithPath(application_url_object, &bundle_path);

        let cb = RefCell::new(Some(callback));
        let completion_handler = block2::RcBlock::new(move |error: *mut NSError| {
            if error.is_null() {
                if let Some(cb) = cb.take() {
                    cb(Ok(()));
                }
            } else if let Some(cb) = cb.take() {
                let Some(err_ref) = error.as_ref() else {
                    return cb(Err("Failed to read error".to_string()));
                };
                let description = err_ref.localizedDescription();
                cb(Err(description.to_string()));
            }
        });

        let url_scheme = NSString::from_str(url_scheme);

        workspace.setDefaultApplicationAtURL_toOpenURLsWithScheme_completionHandler(
            &application_url_object,
            &url_scheme,
            Some(&completion_handler),
        );
    }

    Ok(())
}
