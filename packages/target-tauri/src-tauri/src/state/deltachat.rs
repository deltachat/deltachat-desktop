use std::sync::Arc;

use deltachat_jsonrpc::{
    api::{Accounts, CommandApi},
    yerpc::{RpcClient, RpcSession},
};
use futures_lite::stream::StreamExt;
use log::info;
use tauri::{async_runtime::JoinHandle, Emitter, EventTarget, Manager};
use tokio::sync::RwLock;

pub(crate) struct DeltaChatAppState {
    pub(crate) deltachat: Arc<RwLock<Accounts>>,
    pub(crate) deltachat_rpc_session: RpcSession<CommandApi>,
    #[allow(dead_code)]
    pub(crate) deltachat_rpc_send_task: JoinHandle<anyhow::Result<()>>,
}

impl DeltaChatAppState {
    pub(crate) async fn try_new(app: &tauri::App) -> anyhow::Result<Self> {
        let data_dir = app.path().app_data_dir()?;
        info!("Data directory is {data_dir:?}");

        let accounts = Accounts::new(data_dir.join("accounts"), true).await?;
        let accounts = Arc::new(RwLock::new(accounts));
        let state = CommandApi::from_arc(accounts.clone()).await;
        let (client, mut out_receiver) = RpcClient::new();
        let session = RpcSession::new(client.clone(), state.clone());

        info!("account manager created");

        let handle = app.handle().clone();

        let send_task: JoinHandle<anyhow::Result<()>> = tauri::async_runtime::spawn(async move {
            loop {
                let message = match out_receiver.next().await {
                    None => break,
                    Some(message) => serde_json::to_string(&message)?,
                };
                // TODO fail will drop out of loop, do we want that here? or do we just want to log and ignore the error
                handle.emit_to(EventTarget::labeled("main"), "dc-jsonrpc-message", message)?;
            }
            Ok(())
        });

        Ok(Self {
            deltachat: accounts,
            deltachat_rpc_session: session,
            deltachat_rpc_send_task: send_task,
        })
    }
}
