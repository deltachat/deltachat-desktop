/*!
State that is attached to html email windows,
in essence its the metadata and content,
so it can be served from the special scheme.
*/

use std::collections::HashMap;

use log::warn;
use tokio::sync::RwLock;

#[derive(Clone)]
pub(crate) struct InnerHtmlEmailInstanceData {
    // pub(crate) account_id: u32,
    pub(crate) is_contact_request: bool,
    pub(crate) subject: String,
    pub(crate) sender: String, // this is called "from" in electron edition
    pub(crate) receive_time: String,
    pub(crate) network_allow_state: bool,
    pub(crate) html_content: String,
    pub(crate) blocked_by_proxy: bool,
}

pub(crate) struct HtmlEmailInstancesState {
    pub(crate) inner: RwLock<HashMap<String, InnerHtmlEmailInstanceData>>,
}

impl HtmlEmailInstancesState {
    pub(crate) fn new() -> Self {
        HtmlEmailInstancesState {
            inner: RwLock::new(HashMap::new()),
        }
    }

    pub(crate) async fn remove(&self, id: &str) {
        let _ = self.inner.write().await.remove(id);
    }

    pub(crate) async fn add(&self, id: &str, data: InnerHtmlEmailInstanceData) {
        let _ = self.inner.write().await.insert(id.to_owned(), data);
    }

    pub(crate) async fn get(&self, id: &str) -> Option<InnerHtmlEmailInstanceData> {
        self.inner.read().await.get(id).cloned()
    }

    pub(crate) async fn set_network_allow_state(&self, id: &str, allow_network: bool) {
        let mut inner = self.inner.write().await;
        let Some(instance) = inner.get_mut(id) else {
            // IDEA: return an error if not found
            return;
        };

        if instance.blocked_by_proxy {
            warn!("set_network_allow_state was blocked because proxy is active");
            return;
        }

        instance.network_allow_state = allow_network
    }
}
