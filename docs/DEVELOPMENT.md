# Development

## Table of Contents

<details><summary>Click to expand</summary>

- [Development](#development)
  - [Table of Contents](#table-of-contents)
  - [How to Contribute ](#how-to-contribute-)
    - [Run the Code ](#run-the-code-)
      - [Running multiple versions/instances locally](#running-multiple-versionsinstances-locally)
    - [Code Style ](#code-style-)
      - [Checking Code Style](#checking-code-style)
      - [Fixing Code Style](#fixing-code-style)
    - [CI github actions](#ci-github-actions)
    - [Tests ](#tests-)
      - [E2E testing ](#e2e-testing-)
    - [Translations ](#translations-)
      - [Add experimental language strings ](#add-experimental-language-strings-)
      - [Use localized strings in code](#use-localized-strings-in-code)
        - [Thumb-rule:](#thumb-rule)
        - [Usage:](#usage)
    - [CI ](#ci-)
    - [Packaging ](#packaging-)
      - [1. Generate Electron-Builder Configuration](#1-generate-electron-builder-configuration)
      - [2. Run electron-builder](#2-run-electron-builder)
    - [Release Workflow ](#release-workflow-)
    - [Code Structure ](#code-structure-)
  - [Tips for specific subjects ](#tips-for-specific-subjects-)
    - [VS Code users ](#vs-code-users-)
    - [URI Schemes on linux ](#uri-schemes-on-linux-)
    - [pnpm cli shell completion ](#pnpm-cli-shell-completion-)
    - [Disable code signing on packaging for macOS ](#disable-code-signing-on-packaging-for-macos-)
    - [Useful Links :](#useful-links-)
    - [JSONRPC debug tricks: ](#jsonrpc-debug-tricks-)

</details>

## How to Contribute <a id="how-to-contribute"></a>

### Run the Code <a id="run-the-code"></a>

While developing the following command will build the app and start `electron` in debug mode with http cache disabled:

```
$ pnpm dev
```

It's also handy to develop in watch mode so that your changes to the code are immediately recompiled. For this you need two terminal windows:

```sh
# Terminal 1
$ pnpm -w watch:electron
# Terminal 2
$ pnpm -w start:electron
```

After making your changes, go in the deltachat/electron Dev-console and press `F5` or `Cmd+R` to reload the frontend process.

> **Note:** this only applies to the frontend code in `src/renderer`. To build the main process you still need to use `pnpm -w build:electron` and then restart the deltachat-desktop process. (`pnpm -w start:electron`)

#### Running multiple versions/instances locally

Per default (at least on linux) the local build uses the default config & account dir that also your installed desktop app uses (except for flatpak/AppImage). That might result in an error message when building the local app "Only one instance allowed. Quitting"

You can define a different config dir by setting an env var DC_TEST_DIR in an .env file. See [.env.example](../packages/target-electron/.env.example)

Be aware that the order matters: if the installed app is running you can start another instance with a different config dir. But if a local instances is running you can't start the installed app.

### Code Style <a id="code-style"></a>

#### Checking Code Style

The primary command for checking any changes made to the code is:

```sh
pnpm -w check
```

This command in turn splits up into the following commands:

- `pnpm -w check:types` -> Runs `tsc` to make sure the `TypeScript` code is ok
- `pnpm -w check:lint` -> Runs [`eslint`](https://eslint.org) with [`TypeScript`](https://typescriptlang.org/) rules to check for common bad practices in all `.js`, `.ts` and `.tsx` files
- `pnpm -w check:format` -> Runs [`Prettier`](https://prettier.io/) with rules inspired by [`StandardJS`](https://standardjs.com/) to check formatting in all `.scss`, `.js`, `.ts`, `.tsx`, `.json` and `.md` files

Sometimes `eslint` complains on code lines that for whatever reason doesn't fit well with the project style. Lines like this can be ignored by using `// eslint-disable-next-line` on the line prior to the line you would like to ignore:

```js
// eslint-disable-next-line
const unused_var = 'This line would normally trigger some linting errors'
```

The configuration for eslint is documented here: https://eslint.org/docs/latest/use/configure/configuration-files

If you work with SCSS make sure you read [`docs/STYLES.md`](./STYLES.md)

Running `pnpm -w check:lint` when using VS Code will make VS Code display the found problems.

If you're unsure it's always safe to run `pnpm -w check` to check everything. If you know what you're doing you can run the lower level commands for a more fine grained check.

#### Fixing Code Style

If the code style check fails you can try to have it fixed for you. The primary command for doing this is:

```sh
pnpm -w fix
```

This command in turn splits up into the following commands:

- `pnpm -w fix:lint` -> Runs [`eslint`](https://eslint.org) to attempt fixing any issues in all `.js`, `.ts` and `.tsx` files
- `pnpm -w fix:format` -> Runs [`Prettier`](https://prettier.io/) to attempt fixing formatting in all `.scss`, `.js`, `.ts`, `.tsx`, `.json` and `.md` files

If you're unsure it's always safe to run `pnpm -w fix` to fix everything. If you know what you're doing you can run the lower level commands for a more fine grained fix.

### CI github actions

We have several [github actions](../.github/workflows/) configured to be executed for each PR. These include code validation, tests and preview builds which are downloadable from the artifacts.
Previews can be uploaded to https://download.delta.chat/desktop/preview/ by adding a line "#public-preview" to the PR description. This also works if the line is added later, since the upload step is triggered on "edit" also.

The code validation includes a check if the Changelog has a new entry for the PR. That can be skipped (if reasonable) by adding the keyword "#skip-changelog" in the description, ideally followed by a reason for skipping

### Tests <a id="tests"></a>

Running `pnpm -w test` runs the unit tests.

#### E2E testing <a id="tests-e2e"></a>

see [E2E-TESTING.md](./E2E-TESTING.md)

### Translations <a id="translations"></a>

Install the [transifex client](https://developers.transifex.com/docs/cli) and get added to the `Delta Chat App` project.

And periodically we can run the following command to get the new translation strings from translators:

```
pnpm -w translations:update
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

> **Tip:** run with the `--translation-watch` flag (included in `pnpm start`) to start in translation
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

For Continuous Integration we use GitHub Actions.

### Packaging <a id="packaging"></a>

Build in production mode (development tools disabled and minified frontend code)

```sh
NODE_ENV=production pnpm -w build

# the electron target also has a shortcut that should also work on windows
cd packages/target-electron
pnpm build4production
```

(for building on Windows you need another command to set the environment variable)

#### 1. Generate Electron-Builder Configuration

> First make sure you are in the `packages/target-electron` dirctory.

Generate the `electron-builder.json5` file with `pnpm pack:generate_config`.

Possible options for `pnpm pack:generate_config`:

| Environment var | Effect                          |
| --------------- | ------------------------------- |
| `NO_ASAR=true`  | Disable asar, used for flatpack |

#### 2. Run electron-builder

> note: on Windows you need to enable Developer Mode in System settings > For developers before packing

If you haven't done so run `pnpm build` now.

Then you need to run `pnpm pack:patch-node-modules` to patch `node_modules`. (**DON'T forget this step!**)
So that the `electron-builder` `afterPackHook` is able to find the rpc binaries.

Start electron-builder:

| Command               | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `pnpm pack:win`       | Build for Windows (`nsis` & `portable` target)                              |
| `pnpm pack:mac`       | Build for macOS (`dmg` & `mas` target)                                      |
| `pnpm pack:linux`     | Build for Linux (`AppImage` & `deb` target)                                 |
| `pnpm pack:linux:dir` | Build for Linux, but just the folder, no package. This is used for Flatpak. |

For more info look at the `scripts` section in `package.json`.

The commands for windows10 appx and the App Store package for mac are currently not in the scripts section. They are useless for most people anyway, as they require special paid developer accounts or signing certificates.

- `mas` - mac appstore build
- `appx` - windows appstore build, you can find info on how to build a self-signed appx in [`APPX_TESTING.md`](./APPX_TESTING.md).

> If you are building window on windows you might run into the file path limit of 260 characters.
> To avoid that, make a folder with a short name directly on your drive (like c.tmp).

### Release Workflow <a id="release"></a>

See [RELEASE.md](../RELEASE.md)

### Code Structure <a id="code-structure"></a>

Some important folders and files:

```ini
├── .gihub/workflows                        # source of our Github Actions
├── CHANGELOG.md                            # what changed
├── RELEASE.md                              # how to make a release
├── _locales                                # translations
│   ├── _languages.json                     # central file which defines the visible languages and their native names for the users to choose
│   ├── _untranslated_en.json               # new translation keys that are not yet upstreamed to the android-repo/transifex.
│   └── ...
├── bin                                     # executable scripts for various developer tasks
├── docs                                    # documentation
├── images                                  # images and icons
├── packages
│   ├── e2e-tests
│   │   ├── [data]                          # possible data dir created by e2e tests
│   │   ├── tests                           # e2e tests executed by playwright
│   ├── frontend                            # the frontend / UI
│   │   ├── bin                             # executable scripts specific to the frontend
│   │   ├── html-dist                       # [generated] output from building
│   │   ├── scss                            # global css stylesheets
│   │   ├── src                             # source code
│   │   ├── static                          # static files that are needed
│   │   └── themes                          # themes
│   ├── runtime
│   │   └── runtime.ts                      # runtime interface that abstracts over runtime, so frontend can run on electron, tauri and browser
│   ├── shared                              # code that is shared between the packages
│   │   ├── shared-types.d.ts               # shared types
│   │   ├── tests                           # tests
│   │   └── ts-compiled-for-tests           # [generated] compiled code for testing
│   ├── target-browser
│   │   ├── runtime-browser                 # runtime implementation for browsers
│   │   ├── static                          # additional pages for login & e2e tests
│   ├── target-electron
│   │   ├── bin                             # executable scripts specific to the electron target
│   │   ├── build                           # scripts and files needed for packaging
│   │   ├── bundle_out                      # [generated] compiled+bundled js code for electron main rocess
│   │   ├── dist                            # [generated] output from packaging
│   │   ├── electron-builder.json5          # [generated] config file for packaging with electron-builder
│   │   ├── html-dist                       # [generated] bundled frontend and static resources
│   │   ├── runtime-electron                # runtime implementation for electron
│   │   ├── src                             # source for electron main process js code
│   │   ├── static                          # static files that are needed
│   │   ├── stub.cjs                        # file that can be used for electron builder to skip signing
│   │   └── tests                           # tests, like a test for the account data migration function
│   └── target-tauri
├── static
│   ├── fonts                               # fonts
│   ├── help                                # help files in different languages, generated by bin/create-local-help.sh
│   └── xdcs                                # internal extension xdcs

```

## Tips for specific subjects <a id="specific-tipps"></a>

### VS Code users <a id="vscode"></a>

Problem: Strange TypeScript errors that are only visible in VS Code but the project compiles normally

Solution: Tell VS Code to use the workspace version of TypeScript instead of an built-in version [more info](https://code.visualstudio.com/docs/typescript/typescript-compiling#_why-do-i-get-different-errors-and-warnings-with-vs-code-than-when-i-compile-my-typescript-project)

### URI Schemes on linux <a id="linux-uri-schemes"></a>

Can only be tested in builds that have a desktop file. The simplest way to do this is to install the appimage generated by `pnpm electron-builder --linux AppImage`. (Installing with AppImageLauncher)

### pnpm cli shell completion <a id="pnpm-tab-completion"></a>

bash:

```bash
pnpm completion bash > ~/completion-for-pnpm.bash
echo 'source ~/completion-for-pnpm.bash' >> ~/.bashrc
```

zsh:

```bash
pnpm completion zsh > ~/completion-for-pnpm.zsh
echo 'source ~/completion-for-pnpm.zsh' >> ~/.zshrc
```

see also: <https://pnpm.io/completion>

### Disable code signing on packaging for macOS <a id="disable-mac-codesigning"></a>

Sometimes you want to package the app for macOS for testing, but don't have the required certificates for signing it. You can set the following environment variable to skip code signing:

```
export CSC_IDENTITY_AUTO_DISCOVERY=false
```

### Useful Links <a id="useful-links"></a>:

Docs about macOS sandbox permissions:

- https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW1

- https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/AppSandboxTemporaryExceptionEntitlements.html#//apple_ref/doc/uid/TP40011195-CH5-SW1

### JSONRPC debug tricks: <a id="jsonrpc-debug-tricks"></a>

If you want to debug how many jsonrpc calls were made you can run `exp.printCallCounterResult()` in the devConsole when you have debug logging enabled.
This can be useful if you want to test your debouncing logic or compare a branch against another branch, to see if your changes reduced overall jsonrpc calls.
