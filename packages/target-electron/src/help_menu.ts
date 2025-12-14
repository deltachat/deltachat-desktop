export function getHelpMenu() {
  // eslint-disable-next-line no-console
  console.info(`Options:

Flag
--                              indicates the end of DeltaChat options
-h, --help                      Print DeltaChat command line options (currently set).
--minimized                     Start deltachat in minimized mode with trayicon (trayicon will be activated
                                for this session regardless whether it's disabled)
-v, --version                   Prints DeltaChat version.

Development Options
--translation-watch             enable auto-reload for _locales/_untranslated_en.json
--dev-mode                      opens electron devtools and activates --log-debug & --log-to-console

Theme
--theme <theme-id>              set a specific theme (see THEMES.md)
--theme-watch                   enable auto-reload for the active theme

Logging
--log-debug                     Log debug messages
--log-to-console                Output the log to stdout / Chrome dev console
--machine-readable-stack        Enable JSON stack trace
--no-color                      Disable colors in the output of main process

For more info on logging see LOGGING.md.)`)
}
