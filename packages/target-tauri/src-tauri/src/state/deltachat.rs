use std::sync::Arc;

use anyhow::Context;
use deltachat_jsonrpc::{
    api::{Accounts, CommandApi},
    yerpc::{RpcClient, RpcSession},
};
use futures_lite::stream::StreamExt;
use log::{error, info};
use tauri::{async_runtime::JoinHandle, Manager};
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

use crate::{
    settings::{StoreExtBoolExt, SYNC_ALL_ACCOUNTS, SYNC_ALL_ACCOUNTS_DEFAULT},
    MainWindowChannels, CONFIG_FILE,
};

pub(crate) struct DeltaChatAppState {
    pub(crate) deltachat: Arc<RwLock<Accounts>>,
    pub(crate) deltachat_rpc_session: RpcSession<CommandApi>,
    #[allow(dead_code)]
    pub(crate) deltachat_rpc_send_task: JoinHandle<anyhow::Result<()>>,
    pub(crate) accounts_dir: String,
}

impl DeltaChatAppState {
    pub(crate) async fn try_new(app: &tauri::App) -> anyhow::Result<Self> {
        let data_dir = app.path().app_data_dir()?;
        info!("Data directory is {data_dir:?}");

        let accounts_dir = data_dir.join("accounts");
        let mut accounts = Accounts::new(accounts_dir.clone(), true).await?;

        if app
            .store(CONFIG_FILE)
            .context("failed to load config.json")?
            .get_bool_or(SYNC_ALL_ACCOUNTS, SYNC_ALL_ACCOUNTS_DEFAULT)
        {
            accounts.start_io().await;
        }

        let accounts = Arc::new(RwLock::new(accounts));
        let state = CommandApi::from_arc(accounts.clone()).await;
        let (client, mut out_receiver) = RpcClient::new();
        let session = RpcSession::new(client.clone(), state.clone());

        info!("account manager created");

        let handle = app.handle().clone();

        let send_task: JoinHandle<anyhow::Result<()>> = tauri::async_runtime::spawn(async move {
            let state = handle.state::<MainWindowChannels>();

            loop {
                let message = match out_receiver.next().await {
                    None => break,
                    Some(message) => message,
                };
                // TODO fail will drop out of loop, do we want that here? or do we just want to log and ignore the error

                if let Err(err) = state.send_jsonrpc_response(message).await {
                    error!("send_jsonrpc_response failed: {err}");
                }
            }
            Ok(())
        });

        Ok(Self {
            deltachat: accounts,
            deltachat_rpc_session: session,
            deltachat_rpc_send_task: send_task,
            accounts_dir: accounts_dir
                .to_str()
                .context("string conversion failed")?
                .to_owned(),
        })
    }

    /// Must be called when exiting the app.
    pub(crate) async fn destroy(&self) {
        self.deltachat.read().await.stop_io().await;
        log::info!("core IO stopped");
        // TODO verify that this is all we need to stop core.
    }
}
