# CLI Options

Options:
| Flag | Effect |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--minimized` | Start deltachat in minimized mode with trayicon (trayicon will be activated for this session regardless whether it's disabled) |
| **Development Options** | |
| `--translation-watch` | enable auto-reload for `_locales/_untranslated_en.json`, when that file changes the current language is reloaded |
| `--devmode` | opens electron devtools and activates `--log-debug` & `--log-to-console` |
| `--allow-unsafe-core-replacement` | allow changing core with `DELTA_CHAT_RPC_SERVER` and looking for it in `PATH` instead of forcing the use of the prebuilds |
| **Theme** | |
| `--theme <themeid>` | set a specific theme (see [THEMES.md](./THEMES.md)) |
| `--theme-watch` | enable auto-reload for the active theme |
| **Logging** | |
| `--log-debug` | Log debug messages |
| `--log-to-console` | Output the log to stdout / Chrome dev console |
| `--machine-readable-stacktrace` | Enable JSON stack trace |
| `--no-color` | Disable colors in the output of main process |

For more info on logging see [LOGGING.md](./LOGGING.md).

## Env vars

useful env vars you can set:
| Variable (sometimes with value) | Effect |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_OPTIONS=--enable-source-maps` | Make stacktraces in errors useful by enabling source map support in the main process |
| `DC_TEST_DIR=<dir>` | specify an alternative data directory |
| `DELTACHAT_LOCALE_DIR=<path>` | allows to specify an alternative translation data directory in development, the intended purpose is to be used together with `--translation-watch` [^1] |

Most env vars can be set in .env files. Look fo a env.example in the related package for more info.

[^1]: Someone could develop a gui tool for users to live-edit translations in released versions of deltachat desktop with these two options. Like directly see in the app how your translation looks without needing a dev environment to build desktop.
