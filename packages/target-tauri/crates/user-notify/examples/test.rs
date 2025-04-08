use user_notify::NotificationBuilder;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    unsafe {
        #[cfg(target_os = "macos")]
        {
            match user_notify::mac_os::first_time_ask_for_notification_permission() {
                Err(err) => {
                    println!("failed to ask for notification permission: {err:?}");
                }
                Ok(rx) => {
                    if let Err(err) = rx.await {
                        println!("failed to ask for notification permission: {err:?}");
                    }
                }
            }
        }

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

        notification_builder = notification_builder
            .title("my title")
            .body("my body")
            .set_thread_id(&format!("thread-id"));

        notification_builder.show().await?;
    }
    Ok(())
}
