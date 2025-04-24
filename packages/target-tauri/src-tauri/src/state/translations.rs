use std::sync::Arc;

use log::error;

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;
use translationfn::{Substitution, TranslationEngine};

use crate::{
    i18n::commands::get_locale_data,
    settings::{CONFIG_FILE, LOCALE_KEY},
};

pub struct TranslationStateInner {
    tx_engine: TranslationEngine,
}

pub(crate) struct TranslationState {
    inner: Arc<RwLock<TranslationStateInner>>,
}

impl TranslationState {
    pub(crate) async fn try_new(app: &AppHandle) -> anyhow::Result<Self> {
        let state = Arc::new(RwLock::new(TranslationStateInner {
            tx_engine: Self::load(app).await?,
        }));

        Ok(Self { inner: state })
    }
    pub(crate) async fn reload_from_config(&self, app: &AppHandle) -> anyhow::Result<()> {
        let mut inner = self.inner.write().await;
        inner.tx_engine = Self::load(app).await?;
        Ok(())
    }

    async fn load(app: &AppHandle) -> anyhow::Result<TranslationEngine> {
        let locale = app
            .store(CONFIG_FILE)?
            .get(LOCALE_KEY)
            .and_then(|s| s.as_str().map(|s| s.to_owned()))
            .unwrap_or("en".to_owned());
        let locale_data = get_locale_data(&locale, app.clone()).await?;
        Ok(TranslationEngine::new(
            locale_data.messages,
            &locale_data.locale,
        )?)
    }

    pub(crate) async fn translate(&self, key: &str, substitution: Substitution<'_>) -> String {
        let tx_en = &self.inner.read().await.tx_engine;
        tx_en.translate(key, substitution)
    }

    pub(crate) fn sync_translate(&self, key: &str, substitution: Substitution) -> String {
        if let Ok(lock) = &self.inner.try_read() {
            lock.tx_engine.translate(key, substitution)
        } else {
            error!("Translations are blocked {key}");
            format!("B {key}")
        }
    }
}
