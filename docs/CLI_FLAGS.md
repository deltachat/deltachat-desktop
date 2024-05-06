# CLI Options

Options:
| Flag | Effect |
|------|--------|
|`--minimized` | Start deltachat in minimized mode with trayicon (trayicon will be activated for this session regardless whether it's disabled) |
| `--multiple-instances` | [Possible unstable] allows you do open multiple deltachat instances\* |
| **Development Options** | |
| `--translation-watch` | enable auto-reload for `_locales/_untranslated_en.json` |
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

\*`--multiple-instances` is possible unstable - to avoid risks don't open the same account in multiple windows at a time and disable sync all,
also you can not manage accounts with this option enabled (no account adding or removing)
