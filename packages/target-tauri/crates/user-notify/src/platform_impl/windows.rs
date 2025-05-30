//! This manager logs the calls to it and does nothing more.
//! It can be used for testing application code,
//! or as a fallback for tauri's devmode that runs the app without a bundle id

use std::collections::HashMap;
use std::sync::{Arc, OnceLock};

use async_trait::async_trait;
use windows::Foundation::Collections::StringMap;
use windows::Foundation::TypedEventHandler;
use windows::UI::Notifications::{
    NotificationData, ToastActivatedEventArgs, ToastDismissalReason, ToastDismissedEventArgs,
    ToastNotifier,
};
use windows::core::{HSTRING, IInspectable, Interface};
use windows::{
    Data::Xml::Dom::XmlDocument, UI::Notifications::ToastNotification,
    UI::Notifications::ToastNotificationManager,
};
use windows_collections::IVectorView;

use crate::{
    Error, NotificationBuilder, NotificationHandle, NotificationManager, NotificationResponse,
    NotificationResponseAction,
};

use base64::Engine;

#[derive(Debug, Clone)]
pub struct NotificationHandleWindows {
    id: String,
    user_info: HashMap<String, String>,
}

impl NotificationHandle for NotificationHandleWindows {
    fn close(&self) -> Result<(), crate::Error> {
        log::info!("called close notification handle {self:?}");
        Ok(())
    }

    fn get_id(&self) -> String {
        self.id.clone()
    }

    fn get_user_info(&self) -> &HashMap<String, String> {
        &self.user_info
    }
}

pub struct NotificationManagerWindows {
    #[allow(clippy::type_complexity)]
    handler_callback:
        Arc<OnceLock<Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>>>,
    app_id: String,
    notification_protocol: Option<String>,
}

impl std::fmt::Debug for NotificationManagerWindows {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NotificationManagerWindows")
            .field(
                "handler_callback",
                match &self.handler_callback.get() {
                    Some(_) => &"handler",
                    None => &"no handler",
                },
            )
            .finish()
    }
}

// const POWERSHELL_ID: &str =
//     "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";

const MESSAGE_GROUP: &str = "msg-group";

impl NotificationManagerWindows {
    pub fn new(app_id: String, notification_protocol: Option<String>) -> Self {
        Self {
            handler_callback: Arc::new(OnceLock::new()),
            app_id,
            notification_protocol,
        }
    }

    fn get_toast_notifier(&self) -> Result<ToastNotifier, Error> {
        let toast_notifier =
            ToastNotificationManager::CreateToastNotifierWithId(&HSTRING::from(&self.app_id));
        // if let Err(err) = toast_notifier {
        //     log::error!(
        //         "failed to get toast notifier for current app ({err:?}), falling back to using the one from powershell"
        //     );
        //     toast_notifier =
        //         ToastNotificationManager::CreateToastNotifierWithId(&HSTRING::from(POWERSHELL_ID));
        // }
        Ok(toast_notifier?)
    }

    fn get_history(&self) -> Result<IVectorView<ToastNotification>, Error> {
        let history =
            ToastNotificationManager::History()?.GetHistoryWithId(&HSTRING::from(&self.app_id));
        // if let Err(err) = history {
        //     log::error!(
        //         "failed to get toast history for current app ({err:?}), falling back to using the one from powershell"
        //     );
        //     history = ToastNotificationManager::History()?
        //         .GetHistoryWithId(&HSTRING::from(POWERSHELL_ID));
        // }
        Ok(history?)
    }

    fn user_info_from_toast(toast: &ToastNotification) -> Result<HashMap<String, String>, Error> {
        let user_info_string = toast
            .Data()?
            .Values()?
            .Lookup(&HSTRING::from(USER_INFO_JSON_KEY.to_string()))?;

        let user_info: HashMap<String, String> =
            serde_json::from_str(&quick_xml::escape::unescape(&user_info_string.to_string())?)
                .map_err(Error::FailedToParseUserInfo)?;
        Ok(user_info)
    }

    fn register_event_listeners(&self, toast: &ToastNotification) -> Result<(), Error> {
        fn get_activated_action(insp: &Option<IInspectable>) -> Option<String> {
            insp.as_ref().and_then(|insp| {
                insp.cast::<ToastActivatedEventArgs>()
                    .and_then(|args| args.Arguments())
                    .ok()
                    .and_then(|arguments| {
                        if !arguments.is_empty() {
                            Some(arguments.to_string())
                        } else {
                            None
                        }
                    })
            })
        }

        fn get_dismissed_reason(
            args: &Option<ToastDismissedEventArgs>,
        ) -> Option<ToastDismissalReason> {
            args.as_ref().and_then(|args| args.Reason().ok())
        }

        let notification_id = toast.Tag()?.to_string();
        let user_info = Self::user_info_from_toast(toast).unwrap_or_default(); // IDEA: log error

        let notification_id_clone = notification_id.clone();
        let user_info_clone = user_info.clone();
        let handler_callback = self.handler_callback.clone();
        let activation_handler = TypedEventHandler::new(move |_, insp| {
            let action = get_activated_action(&insp);
            if let Some(handler) = handler_callback.get() {
                handler(crate::NotificationResponse {
                    notification_id: notification_id_clone.clone(),
                    action: action
                        .and_then(|action| {
                            decode_deeplink(&action)
                                .map(|response| response.action)
                                .inspect_err(|err| {
                                    log::error!("failed to extract action from {action}: {err}")
                                })
                                .ok()
                        })
                        .unwrap_or(NotificationResponseAction::Default),
                    user_text: None,
                    user_info: user_info_clone.clone(),
                })
            }
            Ok(())
        });
        let handler_callback = self.handler_callback.clone();
        let dismissed_handler = TypedEventHandler::new(move |_, args| {
            let reason = get_dismissed_reason(&args);
            match reason {
                Some(ToastDismissalReason::UserCanceled) => {
                    if let Some(handler) = handler_callback.get() {
                        handler(crate::NotificationResponse {
                            notification_id: notification_id.clone(),
                            action: NotificationResponseAction::Dismiss,
                            user_text: None,
                            user_info: user_info.clone(),
                        })
                    }
                }
                _ => log::debug!("dissmissed toast: {reason:?}"),
            }
            Ok(())
        });

        toast.Activated(&activation_handler)?;
        toast.Dismissed(&dismissed_handler)?;
        Ok(())
    }
}

const USER_INFO_JSON_KEY: &str = "UserInfoJson";

#[async_trait]
impl NotificationManager for NotificationManagerWindows {
    async fn get_notification_permission_state(&self) -> Result<bool, crate::Error> {
        // log::info!("NotificationManagerMock::get_notification_permission_state");
        // todo not implemented yet / todo find out if that is even nessesary on windows
        Ok(true)
    }

    async fn first_time_ask_for_notification_permission(&self) -> Result<bool, crate::Error> {
        // log::info!("NotificationManagerWindows::first_time_ask_for_notification_permission");
        // todo not implemented yet / todo find out if that is even nessesary on windows
        Ok(true)
    }

    fn register(
        &self,
        handler_callback: Box<dyn Fn(crate::NotificationResponse) + Send + Sync + 'static>,
        categories: Vec<crate::NotificationCategory>,
    ) -> Result<(), crate::Error> {
        log::info!("NotificationManagerWindows::register {categories:?}");

        self.handler_callback
            .set(handler_callback)
            .map_err(|_| Error::SettingHandler)?;
        // register handlers to all notifications of last session
        let history = self.get_history()?;
        for toast in history.into_iter() {
            if let Err(err) = self.register_event_listeners(&toast) {
                log::error!(
                    "failed to register event listener to toast from previous session {err:?}"
                );
            }
        }

        Ok(())
    }

    fn remove_all_delivered_notifications(&self) -> Result<(), crate::Error> {
        ToastNotificationManager::History()?.Clear()?;
        Ok(())
    }

    fn remove_delivered_notifications(&self, ids: Vec<&str>) -> Result<(), crate::Error> {
        let manager = ToastNotificationManager::History()?;
        for id in ids {
            if let Err(err) = manager.RemoveGroupedTagWithId(
                &HSTRING::from(id.to_owned()),
                &HSTRING::from(MESSAGE_GROUP.to_owned()),
                &HSTRING::from(self.app_id.clone()),
            ) {
                log::error!("failed to remove toast notification with tag {id}: {err:?}");
            }
        }

        Ok(())
    }

    async fn get_active_notifications(
        &self,
    ) -> Result<Vec<Box<dyn NotificationHandle>>, crate::Error> {
        let history = self.get_history()?;

        let mut handles: Vec<NotificationHandleWindows> = Vec::new();

        for toast in history.into_iter() {
            let user_info: HashMap<String, String> =
                Self::user_info_from_toast(&toast).unwrap_or_default(); // IDEA: log error
            handles.push(NotificationHandleWindows {
                id: toast.Tag()?.to_string(),
                user_info,
            });
        }

        log::debug!("get_active_notifications: {handles:?}");

        Ok(handles
            .into_iter()
            .map(|h| Box::new(h) as Box<dyn NotificationHandle>)
            .collect())
    }

    async fn send_notification(
        &self,
        builder: NotificationBuilder,
    ) -> Result<Box<dyn NotificationHandle>, crate::Error> {
        log::info!("show notification {self:?}");

        // The tag can be maximum 16 characters long. However, the Creators Update (15063) extends this limit to 64 characters.
        // ~ https://learn.microsoft.com/en-us/uwp/api/windows.ui.notifications.toastnotification.tag?view=winrt-26100#remarks
        let id = uuid::Uuid::new_v4().to_string()[..16].to_owned();

        let title_xml = builder
            .title
            .map(|title| {
                format!(
                    r#"<text id="1">{}</text>"#,
                    quick_xml::escape::escape(title)
                )
            })
            .unwrap_or("".to_string());

        let subtitle_xml = builder
            .subtitle
            .map(|subtitle| {
                format!(
                    r#"<text id="2">{}</text>"#,
                    quick_xml::escape::escape(subtitle)
                )
            })
            .unwrap_or("".to_string());

        let body_xml = builder
            .body
            .map(|body| format!(r#"<text id="3">{}</text>"#, quick_xml::escape::escape(body)))
            .unwrap_or("".to_string());

        let image_xml = builder
            .image
            .map(|image_path| {
                format!(
                    r#"<image id="1" src="file:///{}" />"#, // alt="image"
                    quick_xml::escape::escape(image_path.display().to_string())
                )
            })
            .unwrap_or("".to_string());

        let icon_xml = builder
            .icon
            .map(|icon_path| {
                format!(
                    r#"<image placement='appLogoOverride' src="file:///{}" {} />"#, // alt="icon"
                    quick_xml::escape::escape(icon_path.display().to_string()),
                    if builder.icon_round_crop {
                        r#"hint-crop="circle""#
                    } else {
                        ""
                    }
                )
            })
            .unwrap_or("".to_string());

        let user_info_string = builder
            .user_info
            .as_ref()
            .and_then(|user_info| match serde_json::to_string(user_info) {
                Ok(user_info_string) => Some(user_info_string),
                Err(err) => {
                    log::error!("failed to serialize user_info: ({user_info:?}) {err:?}");
                    None
                }
            })
            .unwrap_or("{}".to_string());

        let launch_options =
            if let Some(notification_protocol) = self.notification_protocol.as_ref() {
                let launch_url = encode_deeplink(
                    notification_protocol,
                    &NotificationResponse {
                        notification_id: id.clone(),
                        action: NotificationResponseAction::Default,
                        user_text: None,
                        user_info: builder.user_info.clone().unwrap_or_default(),
                    },
                );
                format!(r#"launch="{launch_url}" activationType="protocol""#)
            } else {
                "".to_owned()
            };

        let toast_xml = XmlDocument::new()?;
        // https://learn.microsoft.com/uwp/schemas/tiles/toastschema/schema-root
        toast_xml
            .LoadXml(&HSTRING::from(format!(
                r#"<toast duration="short" {launch_options}>
                    <visual>
                        <binding template="ToastGeneric">
                            {title_xml}
                            {subtitle_xml}
                            {body_xml}
                            {icon_xml}
                            {image_xml}
                        </binding>
                    </visual>
                    <audio src="ms-winsoundevent:Notification.SMS" />
                    <!-- <audio silent="true" /> -->
                </toast>"#
            )))
            .expect("the xml is malformed");

        // IDEA: button support via category?

        // IDEA: figgure out if reply text field is possible with this API

        let toast = ToastNotification::CreateToastNotification(&toast_xml)?;

        toast.SetTag(&HSTRING::from(id.clone()))?;

        // group seems to be sth. different than thread. messages are not grouped by it.
        // [ToastNotification.Group](https://learn.microsoft.com/uwp/api/windows.ui.notifications.toastnotification.group?view=winrt-26100)
        // setting it gives the tag a scope, so we can not simply remove it without also knowing its group id
        //
        // if let Some(thread_id) = builder.thread_id {
        //     toast.SetGroup(&HSTRING::from(thread_id))?;
        // };
        toast.SetGroup(&HSTRING::from(MESSAGE_GROUP))?;

        let user_info_map = StringMap::new()?;
        user_info_map.Insert(
            &HSTRING::from(USER_INFO_JSON_KEY),
            &HSTRING::from(user_info_string),
        )?;

        toast.SetData(&NotificationData::CreateNotificationDataWithValues(
            &user_info_map,
        )?)?;

        self.register_event_listeners(&toast)?;

        self.get_toast_notifier()?.Show(&toast)?;

        let handle = NotificationHandleWindows {
            id,
            user_info: builder.user_info.unwrap_or_default(),
        };

        Ok(Box::new(handle) as Box<dyn NotificationHandle>)
    }
}

fn encode_deeplink(scheme: &str, action: &NotificationResponse) -> String {
    let NotificationResponse {
        notification_id,
        action,
        user_info,
        ..
    } = action;

    // TODO: dedup code to not do the encoding here again
    let user_info_string = match serde_json::to_string(&user_info) {
        Ok(user_info_string) => Some(user_info_string),
        Err(err) => {
            log::error!("failed to serialize user_info: ({user_info:?}) {err:?}");
            None
        }
    }
    .unwrap_or("{}".to_string());

    let launch_attribute = base64::prelude::BASE64_STANDARD.encode(&user_info_string);

    let action_string = match &action {
        NotificationResponseAction::Default => "__default__",
        NotificationResponseAction::Dismiss => "__dismiss__",
        NotificationResponseAction::Other(action) => action.as_ref(),
    };

    format!("{scheme}://{notification_id}/{action_string}?{launch_attribute}")
}

pub fn decode_deeplink(link: &str) -> Result<NotificationResponse, Error> {
    let url = url::Url::parse(link)?;

    let user_info: HashMap<String, String> = match url.query() {
        None => {
            log::error!("notification deeplink has no user info");
            HashMap::new()
        }
        Some(base64_userinfo) => {
            let user_info_str = base64::prelude::BASE64_STANDARD.decode(base64_userinfo)?;
            serde_json::from_slice(user_info_str.as_slice())
                .map_err(Error::FailedToParseUserInfo)?
        }
    };

    Ok(NotificationResponse {
        notification_id: url.host().map(|host| host.to_string()).unwrap_or_default(),
        action: match url.path().to_string().as_str() {
            "/__default__" => NotificationResponseAction::Default,
            "/__dismiss__" => NotificationResponseAction::Dismiss,
            action => NotificationResponseAction::Other(action.to_owned()),
        },
        user_text: None,
        user_info,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode() {
        let input = NotificationResponse {
            action: NotificationResponseAction::Default,
            notification_id: "abcd123-abc12".to_string(),
            user_info: HashMap::from([
                ("a".to_string(), "b".to_string()),
                ("c".to_string(), "d".to_string()),
            ]),
            user_text: None,
        };
        let encoded = encode_deeplink("dcnotification", &input);
        let output = decode_deeplink(&encoded);
        assert_eq!(input, output.unwrap());
    }
}
