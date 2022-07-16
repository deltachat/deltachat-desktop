export function getHelpMenu() {
  /* ignore-console-log */
  console.info(`
    Options:

    Flag
    --                              indicates the end of DeltaChat options
    -h, --help                      Print DeltaChat command line options (currently set).
    --minimized                     Start deltachat in minimized mode with trayicon (trayicon will be activated
                                    for this session regardless whether it's disabled)
    --multiple-instances            [Possible unstable] allows you do open multiple deltachat instances*
    -v, --version                   Prints DeltaChat version.
    
    Development Options
    --translation-watch             enable auto-reload for _locales/_untranslated_en.json
    --dev-mode"                     opens electron devtools and activates --log-debug & --log-to-console"
    
    Theme
    --theme <theme-id>              set a specific theme (see THEMES.md)
    --theme-watch                   enable auto-reload for the active theme
    
    Logging
    --log-debug                     Log debug messages
    --log-to-console                Output the log to stdout / Chrome dev console
    --machine-readable-stack        Enable JSON stack trace
    --no-color                      Disable colors in the output of main process

    For more info on logging see LOGGING.md.
    *--multiple-instances  is possible unstable - to avoid risks don't open the same account in multiple windows at a time
    `)
}
