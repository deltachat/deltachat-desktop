# deltachat-desktop

**Desktop Application for [delta.chat](https://delta.chat)**

<center><img src="README_ASSETS/screenshot.png"/></center>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npm test](https://github.com/deltachat/deltachat-desktop/workflows/npm%20test/badge.svg)](https://github.com/deltachat/deltachat-desktop/actions?query=workflow%3A%22npm+test%22+branch%3Amaster)
[![Build Status](https://travis-ci.org/deltachat/deltachat-desktop.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-desktop)

**If you are upgrading:** please see [`UPGRADING.md`](UPGRADING.md).

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
  - [Linux](#linux)
    - [Flatpak](#flatpak)
    - [Arch Linux](#arch-linux)
  - [Mac OS](#mac)
  - [From Source](#source)
  - [Troubleshooting](#troubleshooting)
- [Configuration and Databases](#config-and-db)
- [How to Contribute](#how-to-contribute)
- [Logging](#logging)
- [License](#license)

</details>

## Install <a id="install"></a>

The application can be downloaded from <https://get.delta.chat>. Here you'll find prebuilt releases for all supported platforms. See below for platform specific instructions. If you run into any problems please consult the [Troubleshooting](#troubleshooting) section below.

### Linux <a id="linux"></a>

#### Flatpak <a id="flatpak"></a>

The primary distribution-independed way to install is to use the
flatpak build.
This is maintained in [it's own
repository](https://github.com/flathub/chat.delta.desktop), however a
pre-built binary can be downloaded and installed from
[flathub](https://flathub.org/apps/details/chat.delta.desktop) which
also has a setup guide for many Linux platforms.

#### Arch Linux <a id="arch-linux"></a>

> **WARNING: Currently the AUR package compiles from latest master. This can be more recent as the latest release, introduce new features but also new bugs.**

If you have a AUR helper like yay installed, you can install it by running `yay -S deltachat-desktop-git` and following the instruction in your terminal.

Otherwise you can still do it manually:

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

### Mac OS <a id="mac"></a>

Simply install the `.dmg` file as you do it with all other software on mac.

If you are getting an openssl error message at the first start up you need to install openssl.

```
$ brew install openssl
```

### From Source <a id="source"></a>

> ⚠ This is mostly for development purposes, this won't install/integrate deltachat into your system.
> So unless you know what you are doing, we recomment to stick to the methods above if possible.

```sh
# Get the code
$ git clone https://github.com/deltachat/deltachat-desktop.git
$ cd deltachat-desktop

# Install dependencies
$ npm install

# Build the app (only needed on the first time or if the code was changed)
$ npm run build

# Start the application:
$ npm start
```

### Troubleshooting <a id="troubleshooting"></a>

This module builds on top of `deltachat-core-rust`, which in turn has external dependencies. Instructions below assumes a Linux system (e.g. Ubuntu 18.10).

If you get errors when running `npm install`, they might be related to the _build_ dependency `rust`.

If `rust` or `cargo` is missing:
Follow the instruction on <https://rustup.rs/> to install rust and cargo.

Then try running `npm install` again.

If you still get errors look at the instructions in the deltchat-node and
deltachat-rust-core README files to set things up **or write an issue**.

## Configuration and Databases <a id="config-and-db"></a>

The configuration files and database are stored at [application-config's default filepaths](https://www.npmjs.com/package/application-config#config-location).

Each database is a sqlite file that represents the account for a given email address.

## How to Contribute <a id="how-to-contribute"></a>

Read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Logging <a id="logging"></a>

You can access the log folder and the current log file under the `View->Developer` menu:

<center><img src="README_ASSETS/devMenu.png"/></center>

Read [docs/LOGGING.md](docs/LOGGING.md) for an explaination about our logging system. (availible **options**, log **location** and information abour the used Log-**Format**)

## License <a id="license"></a>

Licensed under `GPL-3.0-or-later`, see [LICENSE](./LICENSE) file for details.

> Copyright © 2019 `DeltaChat` contributors.

> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.

> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
> GNU General Public License for more details.

> You should have received a copy of the GNU General Public License
> along with this program. If not, see <http://www.gnu.org/licenses/>.
