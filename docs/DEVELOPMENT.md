# Development

## Table of Contents

> table of contents is comming soon [TODO]

<details><summary>Click to expand</summary>

- [Quick Tipps](#quick-tipps)
- [How to Contribute](#how-to-contribute)
  - [Run the Code](#run-the-code)
  - [Tests](#tests)
    - [E2E testing](#tests-e2e)
  - [Translations](#translations)
    - [Add experimental language strings](#translations-experimental-strings)
  - [CI](#ci)
  - [Release Workflow](#release)
  - [Code Structure](#code-structure)
- [Tips for specific subjects](#specific-tipps)
  - [VS Code users](#vscode)
  - [URI Schemes on linux](#linux-uri-schemes)

</details>

## Quick Tipps <!-- TODO find a better name for this section --> <a id="quick-tipps"></a>

- We use `prettier` for code formatting,
  use `npm run fix-formatting` before commiting to format the code.
- if you work with scss make sure you read [docs/STYLES.md](./STYLES.md)

## How to Contribute <a id="how-to-contribute"></a>

### Run the Code <a id="run-the-code"></a>

While developing the following command will build the app and start `electron` in debug mode with http cache disabled:

```
$ npm run dev
```

It's also handy to develop in watchmode - your changes are compiled as soon as you make changes to the code. For this you need two terminal windows:

```sh
# Terminal 1
$ npm run watch
# Terminal 2
$ npm run start
```

After making your changes go in the deltachat/electron Dev-console and press `F5` to reload the frontend process.

> **Note:** this only applies to the frontend code in src/renderer. To build the main process you still need to use `npm run build` and then restart the deltachat-desktop process. (`npm run start`)

### Tests <a id="tests"></a>

Running `npm test` does the following:

- runs `prettier` to check the code formatting
- runs the unit tests
- checks for illegal use of console.log()

<!-- TODO write something about the integration tests -->

#### E2E testing <a id="tests-e2e"></a>

Run `npm run test-e2e` for end to end testing.
In E2E testing testcafe clicks through the app an simulates normal usage.

You need to provide a temp email account generation token via the enviroment variable `DCC_NEW_TMP_EMAIL`. (ask contributers on how to get one of these tokens)

### Translations <a id="translations"></a>

Install the [transifex-client](https://docs.transifex.com/client) and get added to the `Delta Chat App` project.

And periodically we can run the following command to get the new translation strings from translators:

```
npm run update-translations
```

When you need to modify language strings do it as pr on english language strings in the android repo. Or if it is in another language than english do it in Transifex.

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

### CI <a id="ci"></a>

For Continuous Integration we currently use Travis and Github Actions.

### Release Workflow <a id="release"></a>

> ⚠ Information on this section might be deprecated. [TODO update this section]

1. Create a draft release on github, e.g. `vX.Y.Z`.
2. Change `version` field in `package.json` to `X.Y.Z`.
3. Update, commit and push `static/chat.delta.desktopp.appdata.xml`
   with the new release information.
4. Regenerate `package-lock.json` using `npm install`, commit and push
   modified `package.json` and `package-lock.json` (repeat until
   release is ready).
5. Once done, publish the release on github, which will create the
   tag.
6. File an issue at
   <https://github.com/flathub/chat.delta.desktop/issues> to make a new
   release.

Also see <https://www.electron.build/configuration/publish>

### Code Structure <a id="code-structure"></a>

Some important folders and files:

```powershell
├── _locales/                 # translation files in xml and json
│   ├── _untranslated_en.json # can contain experimental language strings
│   └── languages.json        # central file which keeps the human readable language
├── .gihub/workflows          # source of our github actions
├── bin/                      # various helper scripts
│   └── build/                # Build scripts
├── build/                    # files needed for electron-builder
├── ci_scripts/               # scripts and dockerfiles used by the CI
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
│   ├── integration/          # integration tests
│   ├── testcafe/             # testcafe tests
│   └── unit/                 # unit tests
└── themes/                   # default themes
```

## Tips for specific subjects <a id="specific-tipps"></a>

### VS Code users <a id="vscode"></a>

Problem: Strange Typscript errors that are only visible in vscode but the project compiles normaly

Solution: Tell VS Code to use the workspace version of typescript intead af an buildt-in version [more info](https://code.visualstudio.com/docs/typescript/typescript-compiling#_why-do-i-get-different-errors-and-warnings-with-vs-code-than-when-i-compile-my-typescript-project)

### URI Schemes on linux <a id="linux-uri-schemes"></a>

can only be tested in builds that have a desktop file - simplest way is to install the appimage generated by `npx electron-builder --linux AppImage`. (Installing with AppImageLauncher)
