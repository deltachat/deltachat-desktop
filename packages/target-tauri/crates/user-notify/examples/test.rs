use std::sync::Arc;

use tokio::{signal::ctrl_c, spawn};
use user_notify::{NotificationBuilder, NotificationManager, mac_os::NotificationManagerMacOS};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let manager = Arc::new(NotificationManagerMacOS::new());

    println!("1");
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
    println!("2");
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
    println!("3");

    notification_builder = notification_builder
        .title("my title2")
        .body("my body2")
        .set_thread_id(&format!("thread-id"));

    println!("4");
    notification_builder.show(manager.clone()).await?;

    println!("5");
    let notification_builder = user_notify::mac_os::NotificationBuilderMacOS::new()
        .title("my title")
        .body("my body")
        .set_thread_id(&format!("thread-id"));

    let manager_clone = manager.clone();
    spawn(async move { notification_builder.show(manager_clone).await }).await??;
    println!("6");
    let _ = ctrl_c().await;

    Ok(())
}
