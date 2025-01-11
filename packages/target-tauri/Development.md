# Hints for developers

## Useful Links

- https://tauri.app
- https://tauri.app/start/
- https://docs.rs/tauri/2.2.0/tauri/
- list of all tauri permissions - https://github.com/tauri-apps/tauri/tree/dev/crates/tauri/permissions
- alternative documentation site - https://tauri.by.simon.hyll.nu/backend/uri-scheme-protocol/htmx/

## Update core

To update core and the other dependencies:

go into repo root then run

```
./bin/link_core/link_version.js <version>
```

(the version needs to be specified without `v` in the beginning)

example:

```
./bin/link_core/link_version.js 1.153.0
```

### update core manually if there is a dependency issue

Sometimes there are dependency conflicts, if there are you need to edit `packages/target-tauri/src-tauri/Cargo.toml` manually.

run `cargo update` in `packages/target-tauri/src-tauri`.


## Quirks

- When you edit runtime or frontend code you need to restart the "tauri dev" command, otherwise the changes might not be picked up.