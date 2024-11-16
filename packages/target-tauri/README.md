# Delta Chat Tauri

This template should help get you started developing with Tauri in vanilla HTML, CSS and Typescript.

This is part of the nlnet funded [Delta Tauri](https://nlnet.nl/project/DeltaTauri) project.

## Start

```
pnpm i
pnpm tauri dev
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