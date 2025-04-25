use std::{collections::HashMap, sync::Arc, time::Duration};

use tokio::{signal::ctrl_c, spawn, time::sleep};
use user_notify::{
    NotificationBuilder, NotificationHandle, NotificationManager, mac_os::NotificationManagerMacOS,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    log::debug!("0");
    let manager = Arc::new(NotificationManagerMacOS::new());
    manager.register();

    log::debug!("1");
    #[cfg(target_os = "macos")]
    {
        let manager_clone = manager.clone();
        if let Err(err) = spawn(async move {
            manager_clone
                .first_time_ask_for_notification_permission()
                .await
        })
        .await
        {
            println!("failed to ask for notification permission: {err:?}");
        }
    }
    log::debug!("2");
    let mut notification_builder = {
        #[cfg(target_os = "macos")]
        {
            user_notify::mac_os::NotificationBuilderMacOS::new()
        }
        #[cfg(target_os = "windows")]
        {
            todo!();
        }
        #[cfg(any(
            target_os = "linux",
            target_os = "dragonfly",
            target_os = "freebsd",
            target_os = "openbsd",
            target_os = "netbsd"
        ))]
        {
            user_notify::xdg::NotificationBuilderXdg::new()
                .category_hint(user_notify::xdg::NotificationCategory::ImReceived)
                .appname("Delta Chat")
        }
    };
    log::debug!("3");

    notification_builder = notification_builder
        .title("my title2")
        .body("my body2")
        .set_thread_id(&format!("thread-id"));

    log::debug!("4");
    notification_builder.show(manager.clone()).await?;

    log::debug!("5");
    let mut info = HashMap::new();
    info.insert("hey".to_owned(), "hi".to_owned());

    let notification_builder = user_notify::mac_os::NotificationBuilderMacOS::new()
        .title("my title")
        .body("my body")
        .set_thread_id(&format!("thread-id"))
        .set_user_info(info);

    let manager_clone = manager.clone();
    spawn(async move { notification_builder.show(manager_clone).await }).await??;

    log::debug!("6");

    // sleep to be sure that the notifications are there when we test
    sleep(Duration::from_secs(2)).await;

    let active = manager.get_active_notifications().await?;
    log::debug!("{active:?}");
    assert!(
        active
            .iter()
            .find(|handle| handle.get_user_info().contains_key("hey"))
            .is_some()
    );

    let _ = ctrl_c().await;

    Ok(())
}
