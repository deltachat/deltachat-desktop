# deltachat-desktop

**Desktop Application for [delta.chat](https://delta.chat)**

[![Build Status](https://travis-ci.org/deltachat/deltachat-desktop.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-desktop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<center><img src="screenshot.png"/></center>

**If you are upgrading:** please see [`UPGRADING.md`](UPGRADING.md).

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
- [Configuration and Databases](#configuration-and-databases)
- [Troubleshooting](#troubleshooting)
- [How to Contribute](#how-to-contribute)
- [License](#license)

</details>

## Install

### From Source

Get the code:

```
$ git clone https://github.com/deltachat/deltachat-desktop.git
$ cd deltachat-desktop
```

Install dependencies:

```
$ npm install
```

Build the app (only needed if the code has changed or if the app has never been built before):

```
$ npm run build
```

Start the application:

```
$ npm start
```

## Configuration and Databases

The configuration files and database are stored at [application-config's default filepaths](https://www.npmjs.com/package/application-config#config-location).

Each database is a sqlite file that represents the account for a given email address.

## Troubleshooting

This module builds on top of `deltachat-core`, which in turn has external dependencies. Instructions below assumes a Linux system (e.g. Ubuntu 18.10).

If you get errors when running `npm install`, they might be related to the _build_ dependencies `meson` and `ninja`.

If `meson` is missing:

```
sudo apt-get install python3-pip
sudo pip3 install meson
```

If `ninja` is missing:

```
sudo apt-get install ninja-build
```

You might also need the following system dependencies:

- `libssl-dev`
- `libsasl2-dev`
- `libsqlite3-dev`
- `zlib1g-dev`

To fix these issues do:

```
sudo apt-get install libssl-dev libsasl2-dev libsqlite3-dev zlib1g-dev
```

Then try running `npm install` again.

Please see [build instructions](https://github.com/deltachat/deltachat-core#building-your-own-libdeltachatso) for additional information.

## How to Contribute

### Code Structure

Some important folders and files:

```
├── bin                    # various helper scripts
├── build                  # files needed only at build time
├── conversations
│   ├── build
│   │   └── manifest.css   # css bundle built from stylesheets
│   └── stylesheets        # stylesheets pulled out from signal
├── images                 # image files used in conversations
├── index.js               # entry point for the main process
├── jenkins                # pipelines for building on Jenkins
├── _locales               # translation files in xml and json
├── src
│   ├── main               # javascript for the main process
│   └── renderer           # javascript for the renderer process
├── static
│   ├── bundle.js          # javascript bundle built by webpack
│   ├── fonts              # fonts
│   ├── main.css           # main css file
│   └── main.html          # main html file in renderer process
├── test
│   ├── integration        # integration tests
│   └── unit               # unit tests
├── .travis.yml            # build script for Travis
├── .tx                    # configuration for Transifex
└── webpack.config.js      # configuration for webpack
```

### Run the Code

While developing the following command will build the app and start `electron` in debug mode with http cache disabled:

```
$ npm run dev
```

It's also handy to run this watch command in a separate terminal

```
$ npm run watch
```

### Tests

Running `npm test` does the following:

- runs `standard` as code linter
- runs the unit tests

Running `npm run test-integaration` executes the integration tests.

The integration tests use `spectron` and `tape`. They click through the app, taking screenshots and comparing each one to a reference. Why screenshots?

- Ad-hoc checking makes the tests a lot more work to write
- Even diffing the whole HTML is not as thorough as screenshot diffing. For example, it wouldn't
  catch an bug where hitting ESC from a video doesn't correctly restore window size.
- Chrome's own integration tests use screenshot diffing iirc
- Small UI changes will break a few tests, but the fix is as easy as deleting the offending
  screenshots and running the tests, which will recreate them with the new look.
- The resulting Github PR will then show, pixel by pixel, the exact UI changes that were made! See
  <https://github.com/blog/817-behold-image-view-modes>

For MacOS, you'll need a Retina screen for the integration tests to pass. Your screen should have the same resolution as a 2016 12" Macbook.

For Windows, you'll need Windows 10 with a 1366x768 screen.

When running integration tests, keep the mouse on the edge of the screen and don't touch the mouse or keyboard while the tests are running.

### Translations

Install the [transifex-client](https://docs.transifex.com/client) and get added to the `Delta Chat App` project.

And periodically we can run the following command to get the new translation strings from translators:

```
tx pull --all
```

Note that this command updated `_locales/*.xml`. Run the following command to convert from xml to json:

```
npm run build-translations
```

When you need to modify language strings, this should be done in `_locales/en.xml`. Run the following command to sync with Transifex:

```
tx push --source
```

### Deploy Workflow

1. Create a draft release on github, e.g. `vX.Y.Z`
2. Change `version` field in `package.json` to `X.Y.Z`
3. Commit and push modified `package.json` (repeat until release is ready)
4. Once done, publish the release on github, which will create the tag

Also see <https://www.electron.build/configuration/publish>

## License

Licensed under the GPLv3, see [LICENSE](./LICENSE) file for details.

Copyright © 2018 `DeltaChat` contributors.
