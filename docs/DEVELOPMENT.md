# Development

## Table of Contents

<details><summary>Click to expand</summary>

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

## How to Contribute <a id="how-to-contribute"></a>

### Run the Code <a id="run-the-code"></a>

While developing the following command will build the app and start `electron` in debug mode with http cache disabled:

```
$ npm run dev
```

It's also handy to develop in watch mode so that your changes to the code are immediately recompiled. For this you need two terminal windows:

```sh
# Terminal 1
$ npm run watch
# Terminal 2
$ npm run start
```

After making your changes, go in the deltachat/electron Dev-console and press `F5` to reload the frontend process.

> **Note:** this only applies to the frontend code in `src/renderer`. To build the main process you still need to use `npm run build` and then restart the deltachat-desktop process. (`npm run start`)

### Code Style <a id="code-style"></a>

We use a combination of [`ESLint`](https://eslint.org) and [`Prettier`](https://prettier.io/) to cover linting/formatting of different types of files.

- [`ESLint`](https://eslint.org) is used with [`TypeScript`](https://typescriptlang.org/) rules to catch common bad practices in all `.js`, `.ts` and `.tsx` files
- [`Prettier`](https://prettier.io/) with rules inspired by [`StandardJS`](https://standardjs.com/) to cover formatting in all `.scss`, `.js`, `.ts`, `.tsx`, `.json` and `.md` files

Commands:

```sh
# Check formatting and code problems
npm run lint
# Fix autofixable problems and fix formatting
npm run lint:fix
```

Ignore a line:

```js
// eslint-disable-next-line
const unused_var = 'This line would normally trigger some linting errors'
```

Running `npm run lint` when using VS Code will make VS Code display the found problems.

We set up the linting using this guide: https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md

If you work with SCSS make sure you read [docs/STYLES.md](./STYLES.md)

### Tests <a id="tests"></a>

Running `npm test` does the following:

- runs `ESLint` and `Prettier` to check the code formatting
- runs the unit tests
- checks for illegal use of `console.log()`

#### E2E testing <a id="tests-e2e"></a>

Run `npm run test-e2e` for end-to-end (E2E) testing. In E2E testing, [TestCafe](https://testcafe.io/) clicks through the app and simulates normal usage.

You need to provide a temporary email account generation token via the environment variable `DCC_NEW_TMP_EMAIL`. (ask contributors on how to get one of these tokens)

### Translations <a id="translations"></a>

Install the [transifex client](https://developers.transifex.com/docs/cli) and get added to the `Delta Chat App` project.

And periodically we can run the following command to get the new translation strings from translators:

```
npm run update-translations
```

When you need to modify language strings do it as a PR on English language strings in the Android repo. It is in a language other than English do it in Transifex.

See the [Add experimental language strings](#translations-experimental-strings) section for instructions on how to add new language strings.

#### Add experimental language strings <a id="translations-experimental-strings"></a>

> ⚠ Information on this section might be deprecated. [TODO update this section]

Sometimes you need to add new language strings, but don't want to push them to transifex immediately. Some potential reasons include:

- the strings may be adjusted in the near future
- the relevant PR may not get merged
- you don't have push rights to the transifex language repo

To still be able to implement new language strings, you can add them to the `_locales/_untranslated_en.json`
file. You can also overload every other language string if you need to.
The syntax is exactly the same as for all other `_locales/*.json` files.

Example:
`{"foobar_desktop": {"message": "This is a test"}}`

> **Tip:** run with the `--translation-watch` flag (included in `npm start`) to start in translation
> watch mode - which watches the experimental language strings and hot reloads them into dc-desktop on save

#### Use localized strings in code

There are two methods to use localized strings:

1. Static usage over `window.static_translate`
2. Dynamic usage over `i18nContext`, where the component that uses this method is automatically rerendered when the user changes the language.

##### Thumb-rule:

- in functions like message functions use `static_translate`
- in dialog it's generally ok to use `static_translate`
- in functional components use the hook/context
- in classes render functions use `<i18nContext.Consumer>{tx=>( )}</i18nContext.Consumer>`
- if you are unsure use `static_translate`.

##### Usage:

For the usage please look at existing code, the types and the doc comments.
<br>Generally you just need to know that the `<i18nContext.Consumer>`, `useTranslationFunction()` and `window.static_translate` are the same functions.

### CI <a id="ci"></a>

For Continuous Integration we currently use Travis and Github Actions.

### Packaging <a id="packaging"></a>

Build in production mode (development tools disabled and minified frontend code)

```sh
NODE_ENV=production npm run build
```

(for building on Windows you need another command to set the environment variable)

#### 1. Generate Electron-Builder Configuration

Generate the `electron-builder.json5` file with `npm run pack:generate_config`.

Possible options for `npm run pack:generate_config`:

| Environment var | Effect                          |
| --------------- | ------------------------------- |
| `NO_ASAR=true`  | Disable asar, used for flatpack |

#### 2. Run electron-builder

If you haven't done so run `npm run build` now.

Start electron-builder:

| Command                  | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `npm run pack:win`       | Build for Windows (`nsis` & `portable` target)                              |
| `npm run pack:mac`       | Build for macOS (`dmg` & `mas` target)                                      |
| `npm run pack:linux`     | Build for Linux (`AppImage` & `deb` target)                                 |
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
├── .gihub/workflows          # source of our Github Actions
├── bin/                      # various helper scripts
│   └── build/                # build scripts
├── build/                    # files needed for electron-builder
├── docs/                     # documentation
├── images/                   # image files like icons or backgrounds
├── index.js                  # entry point for the main process
├── README_ASSETS/            # images used in the readme file and documentation
├── scss/                     # stylesheets which need preprocessing
├── src/
│   ├── main/                 # TypeScript for the main process
│   ├── renderer/             # TypeScript for the renderer process
│   └── shared/               # TypeScript that is shared between both processes
├── static/
│   ├── fonts/                # fonts
│   ├── help/                 # the in-app help
│   └── main.html             # main html file in renderer process
├── test/
│   ├── testcafe/             # TestCafe tests
│   └── unit/                 # unit tests
└── themes/                   # default themes
```

## Tips for specific subjects <a id="specific-tipps"></a>

### VS Code users <a id="vscode"></a>

Problem: Strange TypeScript errors that are only visible in VS Code but the project compiles normally

Solution: Tell VS Code to use the workspace version of TypeScript instead of an built-in version [more info](https://code.visualstudio.com/docs/typescript/typescript-compiling#_why-do-i-get-different-errors-and-warnings-with-vs-code-than-when-i-compile-my-typescript-project)

### URI Schemes on linux <a id="linux-uri-schemes"></a>

Can only be tested in builds that have a desktop file. The simplest way to do this is to install the appimage generated by `npx electron-builder --linux AppImage`. (Installing with AppImageLauncher)

### Disable code signing on packaging for macOS

Sometimes you want to package the app for macOS for testing, but don't have the required certificates for signing it. You can set the following environment variable to skip code signing:

```
export CSC_IDENTITY_AUTO_DISCOVERY=false
```

### Useful Links:

Docs about macOS sandbox permissions:

- https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW1

- https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/AppSandboxTemporaryExceptionEntitlements.html#//apple_ref/doc/uid/TP40011195-CH5-SW1

### JSONRPC stuff:

If you want to debug how many jsonrpc calls were made you can run `exp.printCallCounterResult()` in the devConsole when you have debug logging enabled.
This can be useful if you want to test your debouncing logic or compare a branch against another branch, to see if your changes reduced overall jsonrpc calls.
