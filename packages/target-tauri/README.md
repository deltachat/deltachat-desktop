# Delta Chat Tauri

Delta Chat desktop with tauri as runtime instead of electron.

## Start

Requirements
- rust (install it via https://rustup.rs)
- nodejs (use your favorite node version manager like [fnm](https://github.com/Schniz/fnm)) and [pnpm](https://pnpm.io) package manager
- on linux you need a few system dependencies:
    - debian/ubuntu `sudo apt-get install -y libwebkit2gtk-4.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

```
pnpm i
pnpm tauri dev
```

## Check code

Check javascript (same command as the rest of the project):
```
pnpm -w check
```

Format rust code:
```
pnpm fmt
# or
cd src-tauri && cargo fmt
```

Lint rust code:
```
pnpm lint
# or
cd src-tauri && cargo clippy
```

## Generate the icon

```
pnpm tauri icon deltachat-tauri2.svg --ios-color #2c3e50
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Profiling startup time and get more information about tauri

You can use https://devtools.crabnebula.dev/ for that, for this you need to build with the `crabnebula_extras` feature:

```
pnpm tauri dev -f=crabnebula_extras
```

## Shorten compile times in development

- use [sccache](https://github.com/mozilla/sccache)
- (on linux) use [mold linker](https://github.com/rui314/mold)

# for users

## Log location

| platform | location                                |
| -------- | --------------------------------------- |
| linux    | ~/.config/chat.delta.desktop.tauri      |
| macOS    | ~/Library/Logs/chat.delta.desktop.tauri |
| windows  | %AppData%\chat.delta.desktop.tauri      |

## Data location

| platform | location                                               |
| -------- | ------------------------------------------------------ |
| linux    | ~/.config/chat.delta.desktop.tauri                     |
| macOS    | ~/Library/Application Support/chat.delta.desktop.tauri |
| windows  | %AppData%\chat.delta.desktop.tauri                     |


This is part of the nlnet funded [Delta Tauri](https://nlnet.nl/project/DeltaTauri) project.