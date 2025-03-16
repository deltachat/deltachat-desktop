use std::{str::FromStr, sync::Arc};

use deltachat::{
    chat::Chat,
    message::{Message, MsgId},
    webxdc::WebxdcInfo,
};
use log::{error, info, trace, warn};

use tauri::{
    async_runtime::block_on, image::Image, AppHandle, Manager, State, Url, WebviewUrl,
    WebviewWindowBuilder, WindowEvent,
};

use crate::{
    menus::webxdc_menu::create_webxdc_window_menu,
    settings::get_content_protection,
    state::{
        menu_manager::MenuManger,
        webxdc_instances::{WebxdcInstance, WebxdcInstancesState},
    },
    util::truncate_text,
    webxdc::data_storage::{
        delete_webxdc_data_for_account, delete_webxdc_data_for_instance, set_data_store,
    },
    DeltaChatAppState,
};

use super::error::Error;

#[tauri::command]
pub(crate) async fn on_webxdc_message_changed<'a>(
    app: AppHandle,
    deltachat_state: State<'a, DeltaChatAppState>,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((window_label, instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            let dc_accounts = deltachat_state.deltachat.read().await;
            let account = dc_accounts
                .get_account(account_id)
                .ok_or(Error::AccountNotFound(account_id))?;
            // we need to load a new snapshot as the document title is part of the message snapshot
            let webxdc_info = Message::load_from_db(&account, instance.message.get_id())
                .await
                .map_err(|err| {
                    error!("on_webxdc_message_changed: Message::load_from_db {err:?}");
                    Error::WebxdcInstanceNotFound(account_id, instance.message.get_id().to_u32())
                })?
                .get_webxdc_info(&account)
                .await
                .map_err(|err| Error::DeltaChat(err))?;
            let chat_name = Chat::load_from_db(&account, instance.message.get_chat_id())
                .await
                .map_err(|err| Error::DeltaChat(err))?
                .name;
            window.set_title(&make_title(&webxdc_info, &chat_name))?;
        }
    }

    Ok(())
}

#[tauri::command]
pub(crate) async fn on_webxdc_message_deleted<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((window_label, _)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            window.destroy()?;
        }
    }

    delete_webxdc_data_for_instance(&app, account_id, instance_id).await
}

#[tauri::command]
pub(crate) async fn delete_webxdc_account_data<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
) -> Result<(), Error> {
    for window_label in webxdc_instances
        .get_all_webxdc_windows_for_account_id(account_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            window.destroy()?;
        }
    }
    delete_webxdc_data_for_account(&app, account_id).await
}

#[tauri::command]
pub(crate) async fn on_webxdc_status_update<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
) -> Result<(), Error> {
    if let Some((window_label, _instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            info!("TODO: handle on_webxdc_status_update handler {account_id} {instance_id}");
        }
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn on_webxdc_realtime_data<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    account_id: u32,
    instance_id: u32,
    payload: Vec<u8>,
) -> Result<(), Error> {
    if let Some((window_label, _instance)) = webxdc_instances
        .get_webxdc_for_instance(account_id, instance_id)
        .await
    {
        if let Some(window) = app.get_window(&window_label) {
            info!(
            "TODO: handle on_webxdc_status_update handler {account_id} {instance_id} {payload:?}"
        );
        }
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn close_all_webxdc_instances<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
) -> Result<(), Error> {
    let results = webxdc_instances
        .get_all_webxdc_window_labels()
        .await
        .into_iter()
        .map(|window_label| app.get_window(&window_label).map(|window| window.destroy()));

    let mut last_error_result = Ok(());
    for result in results {
        if let Some(Err(err)) = result {
            error!("wee {err:?}");
            last_error_result = Err(err);
        }
    }
    last_error_result?;
    Ok(())
}

const DEFAULT_WINDOW_WIDTH: f64 = 375.;
const DEFAULT_WINDOW_HEIGHT: f64 = 667.;

#[tauri::command]
pub(crate) async fn open_webxdc<'a>(
    app: AppHandle,
    webxdc_instances: State<'a, WebxdcInstancesState>,
    deltachat_state: State<'a, DeltaChatAppState>,
    menu_manager: State<'_, MenuManger>,
    account_id: u32,
    message_id: u32,
    href: String,
) -> Result<(), Error> {
    let window_id = format!("webxdc:{account_id}:{message_id}");
    trace!("open webxdc '{window_id}': href: {href}");

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if let Some(window) = app.get_window(&window_id) {
            // window already exists focus it - android and iOS don't have have the function
            // and those platforms also don't have multiple windows
            window.show()?;
            return Ok(());
        }
    }

    let dc_accounts = deltachat_state.deltachat.read().await;
    let account = dc_accounts
        .get_account(account_id)
        .ok_or(Error::AccountNotFound(account_id))?;
    let webxdc_message = Message::load_from_db(&account, MsgId::new(message_id))
        .await
        .map_err(|err| {
            error!("failed to load webxdc message: {err:?}");
            Error::WebxdcInstanceNotFound(account_id, message_id)
        })?;
    let webxdc_info = webxdc_message
        .get_webxdc_info(&account)
        .await
        .map_err(|err| Error::DeltaChat(err))?;
    let chat_name = Chat::load_from_db(&account, webxdc_message.get_chat_id())
        .await
        .map_err(|err| Error::DeltaChat(err))?
        .name;

    // add to a state so we can access account id and msg faster without parsing window id
    webxdc_instances
        .add(
            &window_id,
            WebxdcInstance {
                account_id,
                message: webxdc_message.clone(),
            },
        )
        .await;

    // Contruct window
    let mut url = {
        #[cfg(not(any(target_os = "windows", target_os = "android")))]
        {
            Url::from_str("webxdc://dummy.host/index.html")?
        }
        #[cfg(any(target_os = "windows", target_os = "android"))]
        {
            Url::from_str("http://webxdc.localhost/index.html")?
        }
    };

    // TODO test href support
    if let Some(href) = webxdc_message.get_webxdc_href() {
        let url_with_href = Url::from_str(&format!("http://webxdc.localhost/{href}"))?;
        url.set_path(url_with_href.path());
        url.set_fragment(url_with_href.fragment());
        url.set_query(url_with_href.fragment());
    };

    let mut window_builder = WebviewWindowBuilder::new(&app, &window_id, WebviewUrl::External(url))
        .inner_size(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
        .on_navigation(move |url| url.scheme() == "webxdc");

    window_builder = set_data_store(&app, window_builder, account_id, message_id).await?;

    let window = window_builder.build()?;

    let window_arc = Arc::new(window.clone());

    window.on_window_event(move |event| {
        if let WindowEvent::Destroyed = event {
            //TODO test if this fires when account is deleted
            warn!("webxdc window destroyed {account_id} {message_id}");

            // remove from "running instances"-state
            let webxdc_instances = window_arc.state::<WebxdcInstancesState>();
            block_on(webxdc_instances.remove(&window_id));
        }
    });

    // window.set_icon(icon) - IDEA

    window.set_title(&make_title(&webxdc_info, &chat_name))?;

    // content protection
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        if get_content_protection(&app) {
            window.set_content_protected(true)?;
        }
    }

    let icon = {
        let webxdc_info = webxdc_message
            .get_webxdc_info(&account)
            .await
            .map_err(|err| Error::DeltaChat(err))?;
        let blob: Vec<u8> = webxdc_message
            .get_webxdc_blob(&account, &webxdc_info.icon)
            .await
            .map_err(|err| Error::DeltaChat(err))?;

        // IDEA also support jpg, at the moment only png is supported
        let image = Image::from_bytes(&blob);
        if let Err(err) = &image {
            error!("failed to read webxdc icon as png image: {err}")
        }
        image.ok()
    };

    let window_clone = window.clone();
    menu_manager
        .register_window(
            &app,
            &window,
            Box::new(move |app| create_webxdc_window_menu(app, &window_clone, icon.clone())),
        )
        .await
        .map_err(|err| Error::MenuCreation(err.to_string()))?;

    Ok(())
}

fn make_title(webxdc_info: &WebxdcInfo, chat_name: &str) -> String {
    let document = if !webxdc_info.document.is_empty() {
        format!("{} - ", truncate_text(&webxdc_info.document, 32))
    } else {
        "".to_string()
    };
    let webxdc_name = truncate_text(&webxdc_info.name, 42);
    format!("{document}{webxdc_name} – {chat_name}")
}
