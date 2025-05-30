use std::{collections::HashMap, time::Duration};

use tokio::{signal::ctrl_c, spawn, time::sleep};
use user_notify::{NotificationCategory, NotificationCategoryAction, get_notification_manager};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    log::debug!("0");
    let manager = get_notification_manager("chat.delta.desktop.tauri".to_string(), None);

    let categories = vec![
        NotificationCategory {
            identifier: "my.app.123".to_string(),
            actions: vec![
                NotificationCategoryAction::Action {
                    identifier: "my.app.123.button1".to_string(),
                    title: "Hallo Welt".to_string(),
                },
                NotificationCategoryAction::Action {
                    identifier: "my.app.123.button2".to_string(),
                    title: "Button 2".to_string(),
                },
            ],
        },
        NotificationCategory {
            identifier: "my.app.123.textinput".to_string(),
            actions: vec![NotificationCategoryAction::TextInputAction {
                identifier: "my.app.123.button2".to_string(),
                title: "Reply".to_string(),
                input_button_title: "Send".to_string(),
                input_placeholder: "type your message here".to_string(),
            }],
        },
    ];
    manager.register(
        Box::new(|response| {
            log::info!("got notification response: {response:?}");
        }),
        categories,
    )?;

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
    let mut notification = user_notify::NotificationBuilder::new();
    log::debug!("3");

    notification = notification
        .title("my title2")
        .body("my body2")
        .set_thread_id(&format!("thread-id"));

    log::debug!("4");
    manager.send_notification(notification).await?;

    log::debug!("5");
    let mut info = HashMap::new();
    info.insert("hey".to_owned(), "hi".to_owned());

    let notification = user_notify::NotificationBuilder::new()
        .title("my title")
        .body("my body")
        .set_thread_id(&format!("thread-id"))
        .set_user_info(info)
        .set_category_id("my.app.123.textinput");

    let manager_clone = manager.clone();
    spawn(async move { manager_clone.send_notification(notification).await }).await??;

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
