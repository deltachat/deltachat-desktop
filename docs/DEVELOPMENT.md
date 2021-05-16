# Development

## Table of Contents

> table of contents is coming soon [TODO]

<details><summary>Click to expand</summary>

- [Quick Tips](#quick-tipps)
- [How to Contribute](#how-to-contribute)
  - [Run the Code](#run-the-code)
  - [Code Style](#code-style)
    - [Linting](#linting)
    - [Code Formatting](#code-formatting)
  - [Tests](#tests)
    - [E2E testing](#tests-e2e)
  - [Translations](#translations)
    - [Add experimental language strings](#translations-experimental-strings)
  - [CI](#ci)
  - [Packaging](#packaging)
  - [Release Workflow](#release)
  - [Code Structure](#code-structure)
- [Tips for specific subjects](#specific-tipps)
  - [VS Code users](#vscode)
  - [URI Schemes on linux](#linux-uri-schemes)

</details>

## Quick Tips <!-- TODO find a better name for this section --> <a id="quick-tipps"></a>

- We use `prettier` for code formatting,
  use `npm run fix-formatting` before committing to format the code.
- if you work with scss make sure you read [docs/STYLES.md](./STYLES.md)

## How to Contribute <a id="how-to-contribute"></a>

### Run the Code <a id="run-the-code"></a>

While developing the following command will build the app and start `electron` in debug mode with http cache disabled:

```
$ npm run dev
```

It's also handy to develop in watch mode - your changes are compiled as soon as you make changes to the code. For this you need two terminal windows:

```sh
# Terminal 1
$ npm run watch
# Terminal 2
$ npm run start
```

After making your changes go in the deltachat/electron Dev-console and press `F5` to reload the frontend process.

> **Note:** this only applies to the frontend code in src/renderer. To build the main process you still need to use `npm run build` and then restart the deltachat-desktop process. (`npm run start`)

### Code Style <a id="code-style"></a>

#### Linting <a id="linting"></a>

We use [eslint](https://eslint.org) with typescript rules to catch common bad-practices.

Commands:

```sh
# Run to test
npm run lint
# fix autofixable problems and fix formatting
npm run lint:fix-format
```

Ignore a line:

```js
// eslint-disable-next-line
var unused_var = 'This line would normally trigger some linting errors'
```

When using vscode run the `npm: lint` task -> that makes vscode display the found problems.

We setup the linting using this guide: https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md

#### Code Formatting <a id="code-formatting"></a>

We use [prettier.io](https://prettier.io/) for formatting with some rules that were inspired by [standardjs](https://standardjs.com/).

Commands:

```sh
# check formatting
npm run check-formatting
# fix formatting
npm run fix-formatting
```

### Tests <a id="tests"></a>

Running `npm test` does the following:

- runs `eslint`
- runs `prettier` to check the code formatting
- runs the unit tests
- checks for illegal use of console.log()

#### E2E testing <a id="tests-e2e"></a>

Run `npm run test-e2e` for end to end testing.
In E2E testing testcafe clicks through the app an simulates normal usage.

You need to provide a temp email account generation token via the environment variable `DCC_NEW_TMP_EMAIL`. (ask contributors on how to get one of these tokens)

### Translations <a id="translations"></a>

Install the [transifex-client](https://docs.transifex.com/client) and get added to the `Delta Chat App` project.

And periodically we can run the following command to get the new translation strings from translators:

```
npm run update-translations
```

When you need to modify language strings do it as pr on English language strings in the android repo. Or if it is in another language than English do it in Transifex.

See "Add experimental language strings" for instructions on how to add new language strings.

#### Add experimental language strings <a id="translations-experimental-strings"></a>

> ⚠ Information on this section might be deprecated. [TODO update this section]

Sometimes you need to add new language strings, but don't want to push them to
transifex immediately because it's unsure if the string will be adjusted in the
short future or it's unclear if the pr will even get merged or you simply don't
have push rights to the transifex language repo. To still be able to implement
new language strings, you can add them to the `_locales/_untranslated_en.json`
file. You can also overload every other language string if you need to.
The syntax is the exact same as for all other `_locales/*.json` files.

Example:
`{"foobar_desktop": {"message": "This is a test"}}`

> **Tipp:** run with `--translation-watch` (included in `npm start`) to start in translation
> watch mode - which watches the experimental language strings and hot reloads them into dc-desktop on save

#### Use localized strings in code

There are two methods to use localized strings:

1. Static usage over `window.static_translate`
2. Dynamic usage over `i18nContext`, where the component that uses this method is automatically rerendered when the user changes the language.

##### Thumb-rule:

- in functions like message functions use static_translate
- in dialog it's generally ok to use static_translate
- in functional components use the hook/context
- in classes render functions use `<i18nContext.Consumer>{tx=>( )}</i18nContext.Consumer>`
- if you are unsure use static_translate.

##### Usage:

for the usage please look at existing code, the types and the doc comments.
<br>Generally you just need to know that the `<i18nContext.Consumer>`, `useTranslationFunction()` and `window.static_translate` are the same functions.

### CI <a id="ci"></a>

For Continuous Integration we currently use Travis and Github Actions.

### Packaging <a id="packaging"></a>

Build in production mode (development tools disabled and minified frontend code)

```sh
NODE_ENV=production npm run build
```

(for building on windows you need another command to set the environment variable)

#### 1. Generate Electron-Builder Configuration

Generate the `electron-builder.json5` file with `npm run pack:generate_config`.

Possible options for `npm run pack:generate_config`:

| Environment var | Effect                          |
| --------------- | ------------------------------- |
| `NO_ASAR=true`  | Disable asar, used for flatpack |

#### 2. Run Electron-Builder

If you haven't done so run `npm run build` now.

Start electron builder:
| Command | Description |
|--------------------|------------------------------------------------|
| `npm run pack:win` | Build for windows (`nsis` & `portable` target) |
| `npm run pack:mac` | Build for MacOS (`dmg` & `mas` target) |
| `npm run pack:linux` | Build for Linux (`AppImage` & `deb` target) |
| `npm run pack:linux:dir` | Build for Linux, but just the folder, no package. This is used for Flatpak. |

For more info look at the `scripts` section in `package.json`.

The commands for windows10 appx and the App Store package for mac are currently not in the scripts section. They are useless for most people anyway, as they require special paid developer accounts or signing certificates.

### Release Workflow <a id="release"></a>

see [RELEASE_WORKFLOW.md](RELEASE_WORKFLOW.md)

### Code Structure <a id="code-structure"></a>

Some important folders and files:

```powershell
├── _locales/                 # translation files in xml and json
│   ├── _untranslated_en.json # can contain experimental language strings
│   └── languages.json        # central file which defines the visible languages and their native names for the users to choose
├── .gihub/workflows          # source of our github actions
├── bin/                      # various helper scripts
│   └── build/                # Build scripts
├── build/                    # files needed for electron-builder
├── docs/                     # documentation
├── images/                   # image files like icons or backgrounds
├── index.js                  # entry point for the main process
├── README_ASSETS/            # Images used in the readme file and documentation
├── scss/                     # styelsheets which need preprocessing
├── src/
│   ├── main/                 # typescript for the main process
│   ├── renderer/             # typescript for the renderer process
│   └── shared/               # typescript that is shared between both processes
├── static/
│   ├── fonts/                # fonts
│   ├── help/                 # the in-app help
│   └── main.html             # main html file in renderer process
├── test/
│   ├── testcafe/             # testcafe tests
│   └── unit/                 # unit tests
└── themes/                   # default themes
```

## Tips for specific subjects <a id="specific-tipps"></a>

### VS Code users <a id="vscode"></a>

Problem: Strange Typescript errors that are only visible in vscode but the project compiles normally

Solution: Tell VS Code to use the workspace version of typescript instead of an built-in version [more info](https://code.visualstudio.com/docs/typescript/typescript-compiling#_why-do-i-get-different-errors-and-warnings-with-vs-code-than-when-i-compile-my-typescript-project)

### URI Schemes on linux <a id="linux-uri-schemes"></a>

Can only be tested in builds that have a desktop file - simplest way is to install the appimage generated by `npx electron-builder --linux AppImage`. (Installing with AppImageLauncher)

### Useful Links:

docs about macOS sandbox permissions:
https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW1
https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/AppSandboxTemporaryExceptionEntitlements.html#//apple_ref/doc/uid/TP40011195-CH5-SW1
