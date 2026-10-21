import { appName } from '@deltachat-desktop/shared/constants.js'

export function getHelpMenu() {
  // eslint-disable-next-line no-console
  console.info(`Options:

Flag
-h, --help                      Print ${appName} command line options (currently set).
--minimized                     Start ${appName} in minimized mode with trayicon (trayicon will be activated
                                for this session regardless whether it's disabled)
--pipewire-camera               (Linux) Access the camera through PipeWire / xdg-desktop-portal.
                                Needed on systems where the camera is not usable otherwise
-v, --version                   Prints ${appName} version.

Development Options
--translation-watch             enable auto-reload for _locales/_untranslated_en.json
--dev-mode                      opens electron devtools and activates --log-debug & --log-to-console
--allow-custom-rpc-server-path  use the deltachat-rpc-server from DELTA_CHAT_RPC_SERVER or from PATH
                                instead of the prebuild shipped with the app

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
