use std::{collections::HashMap, sync::Arc};

use log::error;
use tauri::{
    async_runtime::spawn, AppHandle, Manager, Runtime, WebviewWindow, Window, WindowEvent, Wry,
};
use tokio::sync::RwLock;

#[cfg(desktop)]
use tauri::menu::Menu;

use crate::TrayManager;

#[cfg(desktop)]
type GenerateMenuFn = Box<dyn Fn(&AppHandle) -> anyhow::Result<Menu<Wry>> + Send + Sync>;

pub(crate) trait WindowAbstraction<R: Runtime> {
    fn label(&self) -> &str;
    #[cfg(desktop)]
    fn set_menu(&self, menu: Menu<R>) -> tauri::Result<Option<Menu<R>>>;
    #[cfg(desktop)]
    fn remove_menu(&self) -> tauri::Result<Option<Menu<R>>>;
    fn on_window_event<F: Fn(&WindowEvent) + Send + 'static>(&self, f: F);
}

impl<R: Runtime> WindowAbstraction<R> for WebviewWindow<R> {
    fn label(&self) -> &str {
        self.label()
    }

    #[cfg(desktop)]
    fn set_menu(&self, menu: Menu<R>) -> tauri::Result<Option<Menu<R>>> {
        self.set_menu(menu)
    }

    #[cfg(desktop)]
    fn remove_menu(&self) -> tauri::Result<Option<Menu<R>>> {
        self.remove_menu()
    }

    fn on_window_event<F: Fn(&WindowEvent) + Send + 'static>(&self, f: F) {
        self.on_window_event(f);
    }
}

impl<R: Runtime> WindowAbstraction<R> for Window<R> {
    fn label(&self) -> &str {
        self.label()
    }

    #[cfg(desktop)]
    fn set_menu(&self, menu: Menu<R>) -> tauri::Result<Option<Menu<R>>> {
        self.set_menu(menu)
    }

    #[cfg(desktop)]
    fn remove_menu(&self) -> tauri::Result<Option<Menu<R>>> {
        self.remove_menu()
    }

    fn on_window_event<F: Fn(&WindowEvent) + Send + 'static>(&self, f: F) {
        self.on_window_event(f);
    }
}

#[derive(Clone)]
pub struct MenuManager {
    #[cfg(desktop)]
    // {[window_id]: callbackToUpdateMenu}
    inner: Arc<RwLock<HashMap<String, Arc<GenerateMenuFn>>>>,
}

impl MenuManager {
    pub(crate) fn new() -> Self {
        MenuManager {
            #[cfg(desktop)]
            inner: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[cfg(desktop)]
impl MenuManager {
    async fn remove(&self, id: &str) {
        let _ = self.inner.write().await.remove(id);
    }

    async fn add(&self, id: &str, data: Arc<GenerateMenuFn>) {
        let _ = self.inner.write().await.insert(id.to_owned(), data);
    }

    pub(crate) async fn get_menu_for_window(
        &self,
        app: &AppHandle,
        id: &str,
    ) -> anyhow::Result<Menu<Wry>> {
        use anyhow::Context;

        let inner = self.inner.read().await;
        let menu_generator = inner
            .get(id)
            .with_context(|| format!("menu generator for window {id} not found"))?;

        menu_generator(app)
    }

    pub(crate) async fn register_window(
        &self,
        app: &AppHandle,
        win: &impl WindowAbstraction<Wry>,
        menu_generator: GenerateMenuFn,
    ) -> anyhow::Result<()> {
        // register the callback to update
        let window_id = win.label();
        let menu_generator_arc = Arc::new(menu_generator);
        self.add(window_id, menu_generator_arc.clone()).await;

        // On non-macOS, respect the "hide menu bar" setting already at
        // window registration, so a secondary window opened while hiding is
        // enabled does not flash (or permanently show) a menu bar until the
        // next `update_all`.
        #[cfg(not(target_os = "macos"))]
        {
            if crate::settings::get_hide_menu_bar(app) {
                win.remove_menu()?;
            } else {
                let menu = menu_generator_arc(app)?;
                win.set_menu(menu)?;
            }
        }
        #[cfg(target_os = "macos")]
        {
            win.set_menu(menu_generator_arc(app)?)?;
        }

        #[cfg(target_os = "macos")]
        {
            let app_clone = app.clone();
            let self_clone = self.clone();
            let id_clone = window_id.to_owned();
            win.on_window_event(move |e| {
                if let tauri::WindowEvent::Focused(true) = e {
                    let app_clone = app_clone.clone();
                    let self_clone = self_clone.clone();
                    let id_clone = id_clone.to_owned();
                    spawn(async move {
                        let menu = match self_clone.get_menu_for_window(&app_clone, &id_clone).await
                        {
                            Ok(menu) => menu,
                            Err(err) => {
                                error!("creating menu failed {err}");
                                return;
                            }
                        };
                        if let Err(err) = app_clone.set_menu(menu) {
                            error!("setting menu failed {err}")
                        }
                    });
                }
            });
            // window was just opened so change menu to it
            app.set_menu(menu_generator_arc(app)?)?;
        }

        let self_clone = self.clone();
        let id_clone = window_id.to_owned();
        // register window event to unregister
        win.on_window_event(move |e| {
            if let tauri::WindowEvent::Destroyed = e {
                let self_clone = self_clone.clone();
                let id_clone = id_clone.to_owned();
                spawn(async move { self_clone.remove(&id_clone).await });
            }
        });

        Ok(())
    }

    pub fn update_all(&self, app: &AppHandle) {
        let cloned_self = self.clone();
        let app = app.clone();
        spawn(async move {
            if let Err(err) = cloned_self.inner_update_all(&app).await {
                error!("error while updating all menus: {err:?}");
            }
            if let Err(err) = app.state::<TrayManager>().update_menu(&app).await {
                error!("error while updating tray menu: {err:?}");
            }
        });
    }

    async fn inner_update_all(&self, app: &AppHandle) -> anyhow::Result<()> {
        // call all the callbacks
        #[cfg(not(target_os = "macos"))]
        {
            // Respect the "hide menu bar" setting: when it is enabled, removing
            // the menu (instead of setting it) keeps windows consistent and
            // prevents `set_menu` from undoing a `remove_menu` that was just
            // performed by `apply_hide_menu_bar` / `toggle_hide_menu_bar`.
            let hide = crate::settings::get_hide_menu_bar(app);
            for (label, menu_builder) in self.inner.read().await.iter() {
                let Some(win) = app.get_window(label).or(app.get_window(label)) else {
                    error!("window {label} not found");
                    continue;
                };

                let result = if hide {
                    win.remove_menu().map(|_| ()).map_err(|err| err.into())
                } else {
                    menu_builder(app)
                        .and_then(|menu| win.set_menu(menu).map(|_| ()).map_err(|err| err.into()))
                };
                if let Err(err) = result {
                    error!("failed to update menu for window {label}: {err}");
                }
            }
        }

        // but on macOS only set the global menu for the focused window
        #[cfg(target_os = "macos")]
        {
            use anyhow::Context;

            let win = app
                .get_focused_window()
                .or(app.get_window("main"))
                .context("could not get focused, nor main window")?;

            app.set_menu(self.get_menu_for_window(app, win.label()).await?)?;
        }

        Ok(())
    }
}
