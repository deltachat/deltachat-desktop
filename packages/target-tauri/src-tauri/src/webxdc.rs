use log::info;

#[tauri::command]
pub(crate) fn on_webxdc_message_changed(account_id:u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_message_changed handler {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_message_deleted(account_id:u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_message_deleted event handler: {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_status_update(account_id:u32, instance_id: u32) {
    info!("TODO: handle on_webxdc_status_update handler {account_id} {instance_id}")
}

#[tauri::command]
pub(crate) fn on_webxdc_realtime_data(account_id:u32, instance_id: u32, payload: Vec<u8>) {
    info!("TODO: handle on_webxdc_status_update handler {account_id} {instance_id} {payload:?}")
}

