use std::{
    future::Future,
    path::Path,
    time::{Duration, Instant},
};

use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::async_runtime::{block_on, channel, Receiver};

fn async_watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (tx, rx) = channel(1);

    let watcher = RecommendedWatcher::new(
        move |res| {
            block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        Config::default(),
    )?;

    Ok((watcher, rx))
}

pub async fn async_watch_debounced<P, F>(
    path: P,
    callback: Box<dyn Fn() -> F + Sync + Send>,
    delay: Duration,
) -> notify::Result<()>
where
    P: AsRef<Path>,
    F: Future<Output = ()>,
{
    let (mut watcher, mut rx) = async_watcher()?;

    // Add a path to be watched. All files and directories at that path and
    // below will be monitored for changes.
    watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;

    let mut last_action = Instant::now();

    while let Some(res) = rx.recv().await {
        match res {
            Err(e) => log::error!("watch error: {e:?}"),
            Ok(event) => {
                log::trace!("changed: {event:?}");
                if event.kind.is_create() || event.kind.is_modify() || event.kind.is_remove() {
                    let now = Instant::now();
                    if now.saturating_duration_since(last_action) < delay {
                        continue;
                    }
                    log::trace!("callback triggered");
                    callback().await;
                    last_action = now;
                }
            }
        }
    }

    Ok(())
}
