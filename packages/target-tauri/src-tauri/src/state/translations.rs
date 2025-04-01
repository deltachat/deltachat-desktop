use log::error;

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

use crate::{
    i18n::{commands::get_locale_data, LocaleData},
    settings::{CONFIG_FILE, LOCALE_KEY},
};

pub struct TranslationStateInner {
    data: LocaleData,
}

pub(crate) struct TranslationState {
    inner: RwLock<TranslationStateInner>,
}

impl TranslationState {
    pub(crate) async fn try_new(app: &tauri::App) -> anyhow::Result<Self> {
        let locale = app
            .store(CONFIG_FILE)?
            .get(LOCALE_KEY)
            .and_then(|s| s.as_str().map(|s| s.to_owned()))
            .unwrap_or("en".to_owned());
        let locale_data = get_locale_data(&locale, app.handle().clone()).await?;
        let locale_data = RwLock::new(TranslationStateInner { data: locale_data });

        Ok(Self { inner: locale_data })
    }
    pub(crate) async fn reload_from_config(&self, app: &AppHandle) -> anyhow::Result<()> {
        let mut inner = self.inner.write().await;
        let locale = app
            .store(CONFIG_FILE)?
            .get(LOCALE_KEY)
            .and_then(|s| s.as_str().map(|s| s.to_owned()))
            .unwrap_or("en".to_owned());
        (*inner).data = get_locale_data(&locale, app.clone()).await?;
        Ok(())
    }

    pub(crate) async fn translate(&self, key: &str) -> String {
        let data = &self.inner.read().await.data;

        if let Some(data) = data.messages.get(key) {
            if let Some(message) = data.get("message") {
                message.to_owned()
            } else {
                error!("Message not existing for {key}");
                key.to_owned()
            }
        } else {
            error!("Translation for key {key} missing");
            key.to_owned()
        }
    }

    pub(crate) fn sync_translate(&self, key: &str) -> String {
        if let Ok(data) = &self.inner.try_read() {
            if let Some(data) = data.data.messages.get(key) {
                if let Some(message) = data.get("message") {
                    message.to_owned()
                } else {
                    error!("Message not existing for {key}");
                    key.to_owned()
                }
            } else {
                error!("Translation for key {key} missing");
                key.to_owned()
            }
        } else {
            error!("Translations are blocked {key}");
            format!("B {key}")
        }
    }
}
