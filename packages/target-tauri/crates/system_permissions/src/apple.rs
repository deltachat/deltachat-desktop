use std::cell::RefCell;

use objc2::runtime::Bool;
use objc2_av_foundation::{
    AVAuthorizationStatus, AVCaptureDevice, AVMediaTypeAudio, AVMediaTypeVideo,
};

use crate::{Error, PermissionKind, Status};

impl From<AVAuthorizationStatus> for Status {
    fn from(value: AVAuthorizationStatus) -> Self {
        match value {
            s if s == AVAuthorizationStatus::Authorized => Status::Granted,
            s if s == AVAuthorizationStatus::Denied => Status::Denied,
            s if s == AVAuthorizationStatus::NotDetermined => Status::NotDetermined,
            s if s == AVAuthorizationStatus::Restricted => Status::Restricted,
            _ => {
                log::error!("unknown AVAuthorizationStatus:{value:?} , treating as denied");
                Status::Denied
            }
        }
    }
}

// https://developer.apple.com/documentation/bundleresources/requesting-authorization-for-media-capture-on-macos?language=objc
pub(crate) fn check(permission: PermissionKind) -> Result<Status, Error> {
    // https://developer.apple.com/documentation/AVFoundation/AVCaptureDevice/authorizationStatus(for:)?language=objc

    unsafe {
        let media_type = match permission {
            PermissionKind::Video => AVMediaTypeVideo,
            PermissionKind::Audio => AVMediaTypeAudio,
        }
        .expect("static option for AVMediaType should be defined");

        Ok(AVCaptureDevice::authorizationStatusForMediaType(media_type).into())
    }
}

pub(crate) fn request(
    permission: PermissionKind,
    callback: Box<dyn FnOnce(bool)>,
) -> Result<(), Error> {
    // https://developer.apple.com/documentation/AVFoundation/AVCaptureDevice/requestAccess(for:completionHandler:)?language=objc
    unsafe {
        let media_type = match permission {
            PermissionKind::Video => AVMediaTypeVideo,
            PermissionKind::Audio => AVMediaTypeAudio,
        }
        .expect("static option for AVMediaType should be defined");

        let cb = RefCell::new(Some(callback));
        let completion_handler = block2::RcBlock::new(move |result: Bool| {
            if let Some(cb) = cb.take() {
                cb(result.as_bool());
            } else {
                log::error!("callback was already used");
            }
        });

        AVCaptureDevice::requestAccessForMediaType_completionHandler(
            media_type,
            &completion_handler,
        );
        Ok(())
    }
}
