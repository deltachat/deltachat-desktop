# deltachat-desktop

> Desktop Application for delta.chat

[![Build Status](https://travis-ci.org/deltachat/deltachat-desktop.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-desktop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## How to Contribute

### Get the code

```
$ git clone https://github.com/deltachat/deltachat-desktop.git
$ cd deltachat-desktop
$ npm install
```

### Run the app

```
$ npm start
```

### Watch the code

Restart the app automatically every time code changes.

```
$ npm run watch
```

### Run linters

```
$ npm test
```

### Run integration tests

```
$ npm run test-integration
```

The integration tests use Spectron and Tape. They click through the app, taking screenshots and
comparing each one to a reference. Why screenshots?

* Ad-hoc checking makes the tests a lot more work to write
* Even diffing the whole HTML is not as thorough as screenshot diffing. For example, it wouldn't
  catch an bug where hitting ESC from a video doesn't correctly restore window size.
* Chrome's own integration tests use screenshot diffing iirc
* Small UI changes will break a few tests, but the fix is as easy as deleting the offending
  screenshots and running the tests, which will recreate them with the new look.
* The resulting Github PR will then show, pixel by pixel, the exact UI changes that were made! See
  https://github.com/blog/817-behold-image-view-modes

For MacOS, you'll need a Retina screen for the integration tests to pass. Your screen should have
the same resolution as a 2016 12" Macbook.

For Windows, you'll need Windows 10 with a 1366x768 screen.

When running integration tests, keep the mouse on the edge of the screen and don't touch the mouse
or keyboard while the tests are running.

### Update translations

Install the [transifex-client](https://docs.transifex.com/client) and get added to the Delta Chat Desktop project.

When you add new strings that need to be translated, run:

```
tx push --source
```

And periodically we can run the following command to get the new translation
strings from translators:

```
tx pull --all
```

### Deploy workflow

1. Create a draft release on github, e.g. `vX.Y.Z`
1. Change `version` field in `package.json` to `X.Y.Z`
1. Commit and push modified `package.json` (repeat until release is ready)
1. Once done, publish the release on github, which will create the tag

Also see https://www.electron.build/configuration/publish

## License

Licensed under the GPLv3, see [LICENSE](./LICENSE) file for details.

Copyright © 2018 Delta Chat contributors.
