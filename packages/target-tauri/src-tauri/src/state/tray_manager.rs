use tauri::tray::TrayIcon;
use tokio::sync::RwLock;

use anyhow::{Context, Ok};
use tauri::AppHandle;

use crate::{
    menus::tray_menu::create_tray_menu,
    tray::{build_tray_icon, is_tray_icon_active},
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

        if currently_active != wanted_state {
            if wanted_state {
                let tray = build_tray_icon(app)?;
                let previous = self.tray.write().await.replace(tray);
                assert!(previous.is_none())
            } else {
                let previous = self.tray.write().await.take();
                if let Some(tray) = previous {
                    tray.set_visible(false)?;
                    let tray_option = app.remove_tray_by_id(tray.id());
                    drop(tray_option);
                } else {
                    unreachable!()
                }
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
}
