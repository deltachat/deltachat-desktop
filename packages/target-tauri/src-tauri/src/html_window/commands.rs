use serde::Serialize;
use tauri::{
    async_runtime::block_on,
    menu::{CheckMenuItem, Menu},
    AppHandle, Manager,
};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_store::StoreExt;

use crate::{
    settings::{
        StoreExtBoolExt, CONFIG_FILE, HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY, HTML_EMAIL_WARNING_DEFAULT,
        HTML_EMAIL_WARNING_KEY,
    },
    HtmlEmailInstancesState, TranslationState,
};

use super::error::Error;

async fn set_load_remote_content(webview: &tauri::Webview, new_state: bool) -> Result<(), Error> {
    let instance_state = webview.state::<HtmlEmailInstancesState>();
    let instance = instance_state
        .get(webview.window().label())
        .await
        .ok_or(Error::WindowNotFoundInState)?;

    if instance.blocked_by_proxy {
        return Err(Error::BlockedByProxy);
    }

    instance_state
        .set_network_allow_state(webview.window().label(), new_state)
        .await;

    // reload header & html email webviews to apply changes
    for webview in webview.window().webviews() {
        if webview.label().ends_with("-mail") {
            webview.reload()?;
        }
    }
    Ok(())
}

#[tauri::command]
pub(crate) async fn html_email_set_load_remote_content(
    app: tauri::AppHandle,
    webview: tauri::Webview,
    load_remote_content: bool,
) -> Result<(), Error> {
    let tl = app.state::<TranslationState>();

    let warning = app
        .store(CONFIG_FILE)?
        .get_bool_or(HTML_EMAIL_WARNING_KEY, HTML_EMAIL_WARNING_DEFAULT);

    if warning && load_remote_content {
        let (tx, rx) = tokio::sync::oneshot::channel::<bool>();

        app.dialog()
            .message(tl.sync_translate("load_remote_content_ask"))
            .parent(&webview.window())
            .buttons(tauri_plugin_dialog::MessageDialogButtons::OkCancel)
            .show(|answer| tx.send(answer).unwrap());
        if !rx.await? {
            return Err(Error::UserCanceled);
        }
    }

    set_load_remote_content(&webview, load_remote_content).await
}

#[tauri::command]
pub(crate) fn html_email_open_menu(
    app: tauri::AppHandle,
    webview: tauri::Webview,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
) -> Result<(), Error> {
    let tx = app.state::<TranslationState>();

    let desktop_settings = app.store(CONFIG_FILE)?;
    let always_load = desktop_settings.get_bool_or(
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY,
        HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_DEFAULT,
    );
    let warning = desktop_settings.get_bool_or(HTML_EMAIL_WARNING_KEY, HTML_EMAIL_WARNING_DEFAULT);

    let instance_state = block_on(html_instances_state.get(webview.window().label()))
        .ok_or(Error::WindowNotFoundInState)?;

    let always_load_remote_images = CheckMenuItem::new(
        &app,
        tx.sync_translate("always_load_remote_images"),
        true,
        always_load,
        None::<&str>,
    )?;
    let show_warning = CheckMenuItem::new(
        &app,
        tx.sync_translate("show_warning"),
        true,
        warning,
        None::<&str>,
    )?;

    let menu = if instance_state.is_contact_request {
        Menu::with_items(&app, &[&show_warning])
    } else {
        Menu::with_items(&app, &[&always_load_remote_images, &show_warning])
    }?;

    // treefit: I haven't found an easy way to get the title bar offset,
    // so now we just spawn it at mouse position
    webview.window().popup_menu(&menu)?;
    webview.window().on_menu_event(move |window, event| {
        // IDEA: better error handling
        let desktop_settings = window.store(CONFIG_FILE).expect("config file not found");
        if event.id() == always_load_remote_images.id() {
            let new_always_load = !always_load;
            desktop_settings.set(HTML_EMAIL_ALWAYS_ALLOW_REMOTE_CONTENT_KEY, new_always_load);
            block_on(set_load_remote_content(&webview, new_always_load)).unwrap();

            // TODO: implement reload in tauri
            webview.eval("location.reload()").unwrap();
        }
        if event.id() == show_warning.id() {
            desktop_settings.set(HTML_EMAIL_WARNING_KEY, !warning);
        }
    });
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct HtmlEmailInfo {
    subject: String,
    sender: String, // this is called "from" in electron edition
    receive_time: String,
    toggle_network: bool,
    network_button_label_text: String,
    blocked_by_proxy: bool,
}

#[tauri::command]
pub(crate) fn get_html_window_info(
    app: AppHandle,
    webview: tauri::Webview,
    html_instances_state: tauri::State<HtmlEmailInstancesState>,
) -> Result<HtmlEmailInfo, Error> {
    let tx = app.state::<TranslationState>();

    let label = webview.window().label().to_owned();
    // IDEA: can we make this function async without getting an error on html_instances_state
    let instance =
        block_on(html_instances_state.get(&label)).ok_or(Error::WindowNotFoundInState)?;

    let network_button_label_text = if instance.blocked_by_proxy {
        tx.sync_translate("load_remote_content_blocked_by_proxy")
    } else {
        tx.sync_translate("load_remote_content")
    };

    Ok(HtmlEmailInfo {
        subject: instance.subject,
        sender: instance.sender,
        receive_time: instance.receive_time,
        toggle_network: instance.network_allow_state,
        network_button_label_text,
        blocked_by_proxy: instance.blocked_by_proxy,
    })
}
