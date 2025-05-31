/*!
State that is attached to webxdc windows.
to give the webxdc schemes and the commands the context
*/

use std::collections::HashMap;

use deltachat::message::Message;
use tauri::ipc::Channel;
use tokio::sync::RwLock;

use crate::webxdc::commands::WebxdcUpdate;

#[derive(Clone)]
pub(crate) struct WebxdcInstance {
    pub(crate) account_id: u32,
    // message instead of message_id here to save us some db calls,
    // at the time of writing there is nothing changing in the message that we are interessted in,
    // so it is fine that this snapshot could be out of date
    pub(crate) message: Message,

    pub(crate) channel: Option<Channel<WebxdcUpdate>>,
}

pub(crate) struct WebxdcInstancesState {
    // key of hashmap is window label
    pub(crate) inner: RwLock<HashMap<String, WebxdcInstance>>,
}

impl WebxdcInstancesState {
    pub(crate) fn new() -> Self {
        WebxdcInstancesState {
            inner: RwLock::new(HashMap::new()),
        }
    }

    #[allow(dead_code)]
    pub(crate) async fn remove(&self, webxdc_window: &tauri::WebviewWindow) {
        self.remove_by_window_label(webxdc_window.label()).await
    }
    pub(crate) async fn remove_by_window_label(&self, webxdc_window_label: &str) {
        let _ = self.inner.write().await.remove(webxdc_window_label);
    }

    #[allow(dead_code)]
    pub(crate) async fn add(&self, webxdc_window: &tauri::WebviewWindow, data: WebxdcInstance) {
        self.add_by_window_label(webxdc_window.label(), data).await
    }
    pub(crate) async fn add_by_window_label(
        &self,
        webxdc_window_label: &str,
        data: WebxdcInstance,
    ) {
        let _ = self
            .inner
            .write()
            .await
            .insert(webxdc_window_label.to_string(), data);
    }

    pub(crate) async fn get(&self, webxdc_window: &tauri::WebviewWindow) -> Option<WebxdcInstance> {
        self.get_by_window_label(webxdc_window.label()).await
    }
    pub(crate) async fn get_by_window_label(
        &self,
        webxdc_window_label: &str,
    ) -> Option<WebxdcInstance> {
        self.inner.read().await.get(webxdc_window_label).cloned()
    }

    pub(crate) async fn set_channel(
        &self,
        webxdc_window: &tauri::WebviewWindow,
        channel: Channel<WebxdcUpdate>,
    ) -> Result<(), String> {
        let mut writer = self.inner.write().await;
        if let Some(m) = writer.get_mut(webxdc_window.label()) {
            m.channel = Some(channel);
            Ok(())
        } else {
            Err("instance not found".to_owned())
        }
    }

    pub(crate) async fn get_all_webxdc_window_labels(&self) -> Vec<String> {
        self.inner
            .read()
            .await
            .keys()
            .map(|window_label| window_label.to_owned())
            .collect()
    }
    pub(crate) async fn get_all_webxdc_windows_for_account_id(
        &self,
        search_account_id: u32,
    ) -> Vec<String> {
        self.inner
            .read()
            .await
            .iter()
            .filter_map(|(window_label, WebxdcInstance { account_id, .. })| {
                if search_account_id == *account_id {
                    Some(window_label.to_owned())
                } else {
                    None
                }
            })
            .collect()
    }
    pub(crate) async fn get_webxdc_for_instance(
        &self,
        search_account_id: u32,
        search_instance_id: u32,
    ) -> Option<(String, WebxdcInstance)> {
        self.inner
            .read()
            .await
            .iter()
            .find_map(|(window_label, instance)| {
                if search_account_id == instance.account_id
                    && instance.message.get_id().to_u32() == search_instance_id
                {
                    Some((window_label.to_owned(), instance.clone()))
                } else {
                    None
                }
            })
    }
}
