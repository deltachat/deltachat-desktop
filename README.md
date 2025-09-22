[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Delta Chat Desktop <a id="deltachat-desktop"></a>

**Desktop Application for [delta.chat](https://delta.chat)**

<center><img src="README_ASSETS/desktop.png" style="min-height: 600px;" /></center>

## Editions

| [`Electron`](https://www.electronjs.org/) :electron:                                               | [`Tauri`](https://tauri.app/) <img src="README_ASSETS/TAURI_Glyph_Color.svg" width="16px" height="16px" style="vertical-align:middle" />                                                         | Browser 🦊🧭🏐                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="README_ASSETS/desktop.png" style="max-width:256px;min-hight:200px" />                    | <img src="README_ASSETS/desktop.png" style="max-width:256px" />                                                                                                                                  | <img src="README_ASSETS/browser-screenshot.png" style="max-width:256px;min-hight:200px" />                                                                                                    |
| The default application. Based on Electron. Currently deployed in appstore and used by most users. | **WIP** client using Tauri instead of Electron. <br /> Tauri is a modern alternative to Electron: Less disk usage, less ram usage and better performance rust backend.                           | Highly experimental version with a webserver component and web-ui in the browser. At the moment only meant for developers and automated testing.                                              |
| [Project Folder](./packages/target-electron) <br /> [Download Links](https://get.delta.chat)       | [Project Folder](./packages/target-tauri) <br /> [Fediverse Thread](https://fosstodon.org/@treefit/113578409177635057) <br /> [Delta Tauri - nlnet project](https://nlnet.nl/project/DeltaTauri) | [Project Folder](./packages/target-browser) <br /> [Fediverse Thread](https://fosstodon.org/@treefit/113116480883632874) <br /> [Blog Post](https://delta.chat/en/2025-05-22-browser-edition) |

## Documentation Links <a id="docs"></a>

### For Users

- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [CLI flags](./docs/CLI_FLAGS.md)
- [Keybindings](./docs/KEYBINDINGS.md)
- [How to make custom Themes](./docs/THEMES.md)

### For Developers

- [Contribution Guidelines](./CONTRIBUTING.md)
- [Logging](./docs/LOGGING.md)
- [Documentation for Developers](./docs/DEVELOPMENT.md)
- [Styling Guidelines](./docs/STYLES.md)
- [How to update core](./docs/UPDATE_CORE.md)
- [How to do end to end testing](./docs/E2E-TESTING.md)
- [How to do a release](./RELEASE.md)

## Table of Contents

<details><summary>Click to expand</summary>

- [Delta Chat Desktop ](#delta-chat-desktop-)
  - [Editions](#editions)
  - [Documentation Links ](#documentation-links-)
    - [For Users](#for-users)
    - [For Developers](#for-developers)
  - [Table of Contents](#table-of-contents)
  - [Install ](#install-)
    - [Linux ](#linux-)
      - [Flatpak ](#flatpak-)
      - [Arch Linux ](#arch-linux-)
    - [Mac OS ](#mac-os-)
      - [Homebrew](#homebrew)
      - [DMG](#dmg)
    - [Windows ](#windows-)
    - [From Source ](#from-source-)
    - [Troubleshooting ](#troubleshooting-)
  - [Configuration and Databases ](#configuration-and-databases-)
  - [How to Contribute ](#how-to-contribute-)
  - [Logging ](#logging-)
  - [License ](#license-)

</details>

## Install <a id="install"></a>

The application can be downloaded from **<https://get.delta.chat>**.
Here you'll find binary releases for all supported platforms.
See below for platform specific instructions. If you run into any
problems please consult the [`Troubleshooting`](#troubleshooting) section below.

[![Packaging status](https://repology.org/badge/vertical-allrepos/deltachat-desktop.svg)](https://repology.org/project/deltachat-desktop/versions)

### Linux <a id="linux"></a>

#### Flatpak <a id="flatpak"></a>

The primary distribution-independent way to install is to use the
flatpak build.
This is maintained in [its own
repository](https://github.com/flathub/chat.delta.desktop). However, a
pre-built binary can be downloaded and installed from
[`Flathub`](https://flathub.org/apps/details/chat.delta.desktop) which
also has a setup guide for many Linux platforms.

#### Arch Linux <a id="arch-linux"></a>

Run `pacman -S deltachat-desktop` to install Delta Chat Desktop on Arch Linux.

Alternatively, build `deltachat-desktop-git` package from Arch User Repository.

> **WARNING: Currently the AUR package compiles from latest master.
> This can be more recent as the latest release, introduce new features
> but also new bugs.**

If you have a AUR helper like yay or paru installed, you can install it
by running `yay -S deltachat-desktop-git` and following the instruction
in your terminal.

Otherwise you can still do it manually:

<details>
<summary>Show manual steps</summary>

```sh
# Download the latest snapshot of the PKGBUILD
wget https://aur.archlinux.org/cgit/aur.git/snapshot/deltachat-desktop-git.tar.gz

# extract the archive and rm the archive file afterwards
tar xzfv deltachat-desktop-git.tar.gz && rm deltachat-desktop-git.tar.gz

# cd into extracted folder
cd deltachat-desktop-git

# build package
makepkg -si

# install package (you need to replace <version> with whatever version makepkg built)
sudo pacman -U deltachat-desktop-git-<version>.tar.xz
```

</details>

### Mac OS <a id="mac"></a>

#### Homebrew

```
$ brew install --cask deltachat
```

#### DMG

Simply install the `.dmg` file as you do it with all other software on Mac.

### Windows <a id="windows"></a>

You can find the downloads for windows on <https://get.delta.chat>.
However, we recommend using the release from [Microsoft Store](https://www.microsoft.com/en-us/p/deltachat/9pjtxx7hn3pk?activetab=pivot:overviewtab),
because there you get automatic updates.

### From Source <a id="source"></a>

> ⚠ This is mostly for development purposes, this won't install/integrate deltachat into your system.
> So unless you know what you are doing, we recommend to stick to the methods above if possible.

```sh
# Get the code
$ git clone https://github.com/deltachat/deltachat-desktop.git
$ cd deltachat-desktop

# Install pnpm
$ npm i -g pnpm

# Install dependencies
$ pnpm install

# Build the app (only needed on the first time or if the code was changed)
$ pnpm -w build:electron

# Start the application:
$ pnpm -w start:electron
```

> `-w` means workspace root package, with this you don't need to have your current working directory at the repo-root to run those scripts.

For development with local `deltachat core` read [`docs/UPDATE_CORE.md`](docs/UPDATE_CORE.md).

### Troubleshooting <a id="troubleshooting"></a>

- This module builds on top of [`deltachat core`](https://github.com/chatmail/core),
  which in turn has external dependencies. The instructions below assume a Linux system (e.g. Ubuntu 18.10).
- Read the error, maybe it already tells you what you need to do. If not feel free to file an issue in this github repo.
- Make sure that your nodejs version is `22.0.0` or newer.
- If you still get errors look at the instructions in [`docs/UPDATE_CORE.md`](docs/UPDATE_CORE.md) to set things up or [write an issue](https://github.com/deltachat/deltachat-desktop/issues/new/choose).

## Configuration and Databases <a id="config-and-db"></a>

The configuration files and database are stored at [application-config's default file paths](https://www.npmjs.com/package/application-config#config-location).

Each database is a SQLite file that represents the account for a given email address.

## How to Contribute <a id="how-to-contribute"></a>

- Read [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- For translations see our transifex page: https://www.transifex.com/delta-chat/public/
- For other ways to contribute: https://delta.chat/en/contribute

## Logging <a id="logging"></a>

You can access the log folder and the current log file under the `View->Developer` menu:

<center><img src="README_ASSETS/devMenu.png"/></center>

For more details on how the logging system works, read [`docs/LOGGING.md`](docs/LOGGING.md).

## License <a id="license"></a>

Licensed under `GPL-3.0-or-later`, see [`LICENSE`](./LICENSE) file for details.

> Copyright © DeltaChat contributors.
>
> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.
>
> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
> GNU General Public License for more details.
>
> You should have received a copy of the GNU General Public License
> along with this program. If not, see <http://www.gnu.org/licenses/>.
