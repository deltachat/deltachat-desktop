/*!
State that is attached to webxdc windows.
to give the webxdc schemes and the commands the context
*/

use std::{collections::HashMap, sync::Arc};

use deltachat::message::Message;
use tokio::sync::RwLock;

#[derive(Clone)]
pub(crate) struct WebxdcInstance {
    pub(crate) account_id: u32,
    // message instead of message_id here to save us some db calls,
    // at the time of writing there is nothing changing in the message that we are interessted in,
    // so it is fine that this snapshot could be out of date
    pub(crate) message: Message,
}

pub(crate) struct WebxdcInstancesState {
    // key of hashmap is window label
    pub(crate) inner: Arc<RwLock<HashMap<String, WebxdcInstance>>>,
}

impl WebxdcInstancesState {
    pub(crate) fn new() -> Self {
        WebxdcInstancesState {
            inner: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub(crate) async fn remove(&self, window_label: &str) {
        let _ = self.inner.write().await.remove(window_label);
    }

    pub(crate) async fn add(&self, window_label: &str, data: WebxdcInstance) {
        let _ = self
            .inner
            .write()
            .await
            .insert(window_label.to_owned(), data);
    }

    pub(crate) async fn get(&self, window_label: &str) -> Option<WebxdcInstance> {
        self.inner.read().await.get(window_label).cloned()
    }

    pub(crate) async fn get_all_webxdc_window_labels(&self) -> Vec<String> {
        self.inner
            .read()
            .await
            .iter()
            .map(|(window_label, _)| window_label.to_owned())
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
