//! Native user presence check ("prove you are the person sitting in front of
//! this device") for the Electron main process.
//!
//! macOS uses LocalAuthentication (Touch ID with account password fallback),
//! Windows uses Windows Hello. Every other platform reports `unsupported`, so
//! callers can fall back to their own confirmation.

use napi::bindgen_prelude::Buffer;
use napi_derive::napi;

pub const STATUS_AUTHENTICATED: &str = "authenticated";
pub const STATUS_CANCELLED: &str = "cancelled";
pub const STATUS_FAILED: &str = "failed";
pub const STATUS_UNSUPPORTED: &str = "unsupported";

#[napi(object)]
pub struct UserPresenceOutcome {
  /// `authenticated` | `cancelled` | `failed` | `unsupported`
  pub status: String,
  /// platform error description, for logging only
  pub error: Option<String>,
}

impl UserPresenceOutcome {
  fn new(status: &str) -> Self {
    Self {
      status: status.to_string(),
      error: None,
    }
  }

  /// only used by the platform implementations
  #[allow(dead_code)]
  fn with_error(status: &str, error: impl std::fmt::Display) -> Self {
    Self {
      status: status.to_string(),
      error: Some(error.to_string()),
    }
  }
}

/// Whether the current device can ask for user presence at all. False means the
/// feature is not offered (no Touch ID / no Hello / no PIN configured / Linux).
#[napi]
pub async fn is_user_presence_supported() -> bool {
  imp::is_supported().await
}

/// Shows the system authentication prompt.
///
/// `reason` is displayed to the user and must say what is being authorized.
/// `window_handle` is the native handle of the window the prompt belongs to
/// (`BrowserWindow.getNativeWindowHandle()`), it is only used on Windows.
#[napi]
pub async fn request_user_presence(
  reason: String,
  window_handle: Option<Buffer>,
) -> UserPresenceOutcome {
  let window_handle = window_handle.map(|handle| handle.to_vec());
  imp::request(reason, window_handle).await
}

#[cfg(target_os = "macos")]
mod imp {
  use super::*;

  use block2::RcBlock;
  use objc2::rc::Retained;
  use objc2::runtime::Bool;
  use objc2_foundation::{NSError, NSString};
  use objc2_local_authentication::{LAContext, LAError, LAPolicy};

  /// Touch ID when available, account password otherwise. `DeviceOwnerAuthentication`
  /// (unlike `DeviceOwnerAuthenticationWithBiometrics`) keeps working on Macs
  /// without a Touch Bar / Touch ID sensor.
  const POLICY: LAPolicy = LAPolicy::DeviceOwnerAuthentication;

  fn new_context() -> Retained<LAContext> {
    unsafe { LAContext::new() }
  }

  pub async fn is_supported() -> bool {
    unsafe { new_context().canEvaluatePolicy_error(POLICY) }.is_ok()
  }

  pub async fn request(reason: String, _window_handle: Option<Vec<u8>>) -> UserPresenceOutcome {
    let receiver = {
      let context = new_context();
      if let Err(error) = unsafe { context.canEvaluatePolicy_error(POLICY) } {
        return UserPresenceOutcome::with_error(STATUS_UNSUPPORTED, error);
      }

      let (sender, receiver) = napi::tokio::sync::oneshot::channel::<UserPresenceOutcome>();
      // the reply block is called exactly once, on an arbitrary thread, but it
      // is typed as a multi-call `Fn`, so the sender needs interior mutability
      let sender = std::sync::Mutex::new(Some(sender));
      // The block keeps the context alive until the reply arrives; without the
      // clone the context would be released while the evaluation is still
      // running. Releasing it from the thread the reply is delivered on is
      // fine, `Retained` is only `!Send` as a general precaution.
      let context_for_block = context.clone();
      let reply = RcBlock::new(move |success: Bool, error: *mut NSError| {
        let _keep_alive = &context_for_block;
        let outcome = if success.as_bool() {
          UserPresenceOutcome::new(STATUS_AUTHENTICATED)
        } else {
          // SAFETY: LocalAuthentication passes a valid error whenever
          // `success` is false, and the pointer is only read here
          let error = unsafe { error.as_ref() };
          match error {
            Some(error) => classify(error),
            None => UserPresenceOutcome::new(STATUS_FAILED),
          }
        };
        if let Some(sender) = sender.lock().ok().and_then(|mut sender| sender.take()) {
          let _ = sender.send(outcome);
        }
      });

      unsafe {
        context.evaluatePolicy_localizedReason_reply(POLICY, &NSString::from_str(&reason), &reply)
      };
      receiver
    };

    receiver
      .await
      .unwrap_or_else(|error| UserPresenceOutcome::with_error(STATUS_FAILED, error))
  }

  fn classify(error: &NSError) -> UserPresenceOutcome {
    let status = match LAError(error.code()) {
      LAError::UserCancel | LAError::SystemCancel | LAError::AppCancel => STATUS_CANCELLED,
      LAError::PasscodeNotSet | LAError::BiometryNotAvailable | LAError::BiometryNotEnrolled => {
        STATUS_UNSUPPORTED
      }
      _ => STATUS_FAILED,
    };
    UserPresenceOutcome::with_error(status, error.localizedDescription())
  }
}

#[cfg(target_os = "windows")]
mod imp {
  use super::*;

  use windows::core::{factory, HSTRING};
  use windows::Security::Credentials::UI::{
    UserConsentVerificationResult, UserConsentVerifier, UserConsentVerifierAvailability,
  };
  use windows::Win32::Foundation::HWND;
  use windows::Win32::System::WinRT::{
    IUserConsentVerifierInterop, RoInitialize, RO_INIT_MULTITHREADED,
  };
  use windows_future::IAsyncOperation;

  /// WinRT calls need an initialized apartment on the calling thread. Both
  /// `S_FALSE` (already initialized) and `RPC_E_CHANGED_MODE` (initialized with
  /// the other threading model) are fine for us, so failures are ignored.
  fn init_apartment() {
    let _ = unsafe { RoInitialize(RO_INIT_MULTITHREADED) };
  }

  pub async fn is_supported() -> bool {
    init_apartment();
    let availability = match UserConsentVerifier::CheckAvailabilityAsync() {
      Ok(operation) => operation.await,
      Err(_) => return false,
    };
    availability
      .map(|availability| availability == UserConsentVerifierAvailability::Available)
      .unwrap_or(false)
  }

  pub async fn request(reason: String, window_handle: Option<Vec<u8>>) -> UserPresenceOutcome {
    let Some(window_handle) = window_handle.as_deref().and_then(parse_window_handle) else {
      // `UserConsentVerifier::RequestVerificationAsync` throws in a plain Win32
      // process, the interop interface with a window handle is the only way in
      return UserPresenceOutcome::with_error(STATUS_FAILED, "missing window handle");
    };

    init_apartment();
    let operation = {
      let interop = match factory::<UserConsentVerifier, IUserConsentVerifierInterop>() {
        Ok(interop) => interop,
        Err(error) => return UserPresenceOutcome::with_error(STATUS_FAILED, error),
      };
      let request = unsafe {
        interop.RequestVerificationForWindowAsync::<IAsyncOperation<UserConsentVerificationResult>>(
          HWND(window_handle as *mut _),
          &HSTRING::from(reason),
        )
      };
      match request {
        Ok(operation) => operation,
        Err(error) => return UserPresenceOutcome::with_error(STATUS_FAILED, error),
      }
    };

    match operation.await {
      Ok(result) => classify(result),
      Err(error) => UserPresenceOutcome::with_error(STATUS_FAILED, error),
    }
  }

  fn classify(result: UserConsentVerificationResult) -> UserPresenceOutcome {
    if result == UserConsentVerificationResult::Verified {
      UserPresenceOutcome::new(STATUS_AUTHENTICATED)
    } else if result == UserConsentVerificationResult::Canceled {
      UserPresenceOutcome::new(STATUS_CANCELLED)
    } else if result == UserConsentVerificationResult::DeviceNotPresent
      || result == UserConsentVerificationResult::NotConfiguredForUser
      || result == UserConsentVerificationResult::DisabledByPolicy
    {
      UserPresenceOutcome::with_error(STATUS_UNSUPPORTED, format!("{result:?}"))
    } else {
      UserPresenceOutcome::with_error(STATUS_FAILED, format!("{result:?}"))
    }
  }

  /// `BrowserWindow.getNativeWindowHandle()` returns the raw pointer in native
  /// endianness and pointer width
  fn parse_window_handle(bytes: &[u8]) -> Option<isize> {
    match bytes.len() {
      8 => Some(i64::from_ne_bytes(bytes.try_into().ok()?) as isize),
      4 => Some(i32::from_ne_bytes(bytes.try_into().ok()?) as isize),
      _ => None,
    }
  }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
mod imp {
  use super::*;

  pub async fn is_supported() -> bool {
    false
  }

  pub async fn request(_reason: String, _window_handle: Option<Vec<u8>>) -> UserPresenceOutcome {
    UserPresenceOutcome::new(STATUS_UNSUPPORTED)
  }
}
