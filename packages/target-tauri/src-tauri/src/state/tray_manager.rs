use deltachat::config::Config;
use tauri::AppHandle;
use tauri::{image::Image, tray::TrayIcon, Manager, State};
use tokio::sync::RwLock;

use crate::{
    menus::tray_menu::create_tray_menu,
    tray::{build_tray_icon, is_tray_icon_active},
    DeltaChatAppState,
};

pub(crate) struct TrayManager {
    pub(crate) tray: RwLock<Option<TrayIcon>>,
}

impl TrayManager {
    pub fn new() -> Self {
        Self {
            tray: RwLock::new(None),
        }
    }

    /// apply whether to show or hide the tray icon
    pub async fn apply_wanted_active_state(&self, app: &AppHandle) -> anyhow::Result<()> {
        let wanted_state = is_tray_icon_active(app)?;
        let currently_active = { self.tray.read().await.is_some() };

        if cfg!(not(any(target_os = "windows", target_os = "macos"))) {
            // on linux removing is broken so we just hide it
            if !currently_active {
                let tray = build_tray_icon(app)?;
                let previous = self.tray.write().await.replace(tray);
                assert!(previous.is_none());
            }
            let tray = self.tray.read().await;
            assert!(tray.is_some());
            if let Some(tray) = tray.as_ref() {
                if wanted_state {
                    tray.set_visible(true)?;
                    self.update_badge(app).await?;
                } else {
                    tray.set_visible(false)?;
                }
            }
        } else if currently_active != wanted_state {
            if wanted_state {
                let tray = build_tray_icon(app)?;
                let previous = self.tray.write().await.replace(tray);
                assert!(previous.is_none());
                self.update_badge(app).await?;
            } else {
                let previous = self.tray.write().await.take();
                let Some(tray) = previous else { unreachable!() };

                tray.set_visible(false)?;
                let tray_option = app.remove_tray_by_id(tray.id());
                drop(tray_option);
            }
        }

        Ok(())
    }

    pub(crate) async fn update_menu(&self, app: &AppHandle) -> anyhow::Result<()> {
        let lock = self.tray.read().await;
        if let Some(tray) = lock.as_ref() {
            let new_menu = create_tray_menu(app)?;
            tray.set_menu(Some(new_menu))?;
        }

        Ok(())
    }

    async fn update_badge(&self, app: &AppHandle) -> anyhow::Result<()> {
        let counter = {
            let dc = app.state::<DeltaChatAppState>();
            log::debug!("update_badge: lock dc");
            let accounts = dc.deltachat.read().await;
            log::debug!("update_badge: locked dc");
            let mut counter = 0;
            for account_id in accounts.get_all() {
                let Some(account) = accounts.get_account(account_id) else {
                    log::warn!("could not read account");
                    continue;
                };
                let Ok(mute_state) = account.get_config(Config::IsMuted).await else {
                    continue;
                };
                if mute_state != Some("1".to_owned()) {
                    // account not muted
                    counter += account.get_fresh_msgs().await?.len();
                }
            }
            counter
        };

        log::debug!("update_badge: update_badge_counter icon");
        self.update_badge_counter(app, counter).await?;

        log::debug!("update_badge: completed");
        Ok(())
    }

    async fn update_badge_counter(&self, app: &AppHandle, counter: usize) -> anyhow::Result<()> {
        if cfg!(target_os = "macos")
        // || cfg!(feature = "flatpak")
        {
            return Ok(());
        }

        #[cfg(target_os = "windows")]
        let ending = "ico";
        #[cfg(not(target_os = "windows"))]
        let ending = "png";

        let lock = self.tray.read().await;
        let Some(tray) = lock.as_ref() else {
            return Ok(());
        };

        let image_name = match counter {
            0 => "deltachat",
            _ => "deltachat-unread",
        };
        let asset = format!("images/tray/{image_name}.{ending}");

        if let Some(icon) = app.asset_resolver().get(asset.clone()) {
            tray.set_icon(Some(Image::from_bytes(&icon.bytes)?))?;
        } else {
            log::error!("tray icon asset {asset} not found!")
        }
        Ok(())
    }
}

#[tauri::command]
pub async fn update_tray_icon_badge(
    app: AppHandle,
    tray_manager: State<'_, TrayManager>,
    counter: usize,
) -> Result<(), String> {
    log::debug!("update_tray_icon_badge");
    tray_manager
        .update_badge_counter(&app, counter)
        .await
        .map_err(|err| format!("{err:?}"))
}
