export function getHelpMenu() {
    console.log("\n\n", "Options:", "\n\n\n",
    "Flag","\n\n",
    "-", "\t\t\t\t", "script read from stdin","\n",
    "--", "\t\t\t\t","indicate the end of DeltaChat options", "\n",
    "-h, --help", "\t\t\t", "Print DeltaChat command line options (currently set).", "\n",
    "--minimized","\t\t\t","Start deltachat in minimized mode with trayicon (trayicon will be activated","\n", 
    "\t\t\t\t", "for this session regardless whether it's disabled)","\n",
    "--multiple-instances", "\t\t","[Possible unstable] allows you do open multiple deltachat instances*", "\n",
    "-v, --version", "\t\t\t", "Prints DeltaChat version.", "\n\n",
    "Development Options", "\n\n",
    "--translation-watch", "\t\t", "enable auto-reload for _locales/_untranslated_en.json", "\n",
    "--dev-mode", "\t\t\t", "opens electron devtools and activates --log-debug & --log-to-console", "\n\n",
    "Theme", "\n\n",
    "--theme <theme-id>", "\t\t", "set a specific theme (see THEMES.md)", "\n",
    "--theme-watch", "\t\t\t", "enable auto-reload for the active theme", "\n\n",
    "Logging", "\n\n",
    "--log-debug", "\t\t\t", "Log debug messages", "\n",
    "--log-to-console", "\t\t", "Output the log to stdout / Chrome dev console", "\n",
    "--machine-readable-stack", "\t", "Enable JSON stack trace", "\n",
    "--no-color", "\t\t\t", "Disable colors in the output of main process", "\n\n\n",
    "For more info on logging see LOGGING.md.", "\n\n",
    "*--multiple-instances  is possible unstable - to avoid risks don't open the same account in multiple windows at a time"
    );

}

