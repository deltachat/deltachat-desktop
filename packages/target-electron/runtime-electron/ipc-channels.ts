/**
 * whitelists of channels the renderer may call via `invoke`,
 * `send` etc. these lists should restrict an untrusted renderer
 * to call arbitrary ipc channels that aren't meant for it
 */
export const INVOKE_CHANNELS = Object.freeze([
  'app.copyFileToInternalTmpDir',
  'app.deleteSticker',
  'app.removeTempFile',
  'app.setBadgeCountAndTrayIconIndicator',
  'app.writeTempFile',
  'app.writeTempFileFromBase64',
  'askForMediaAccess',
  'checkMediaAccess',
  'close-all-webxdc',
  'delete_webxdc_account_data',
  'electron.clipboard.readImage',
  'electron.clipboard.readText',
  'electron.clipboard.writeImage',
  'electron.clipboard.writeText',
  'electron.shell.openExternal',
  'electron.shell.openPath',
  'fileChooser',
  'get-autostart-state',
  'get-desktop-settings',
  'getLocaleData',
  'notifications.clear',
  'notifications.clearAccount',
  'notifications.clearAll',
  'notifications.show',
  'open-maps-webxdc',
  'open-webxdc',
  'openIncomingVideoCallWindow',
  'openMessageHTML',
  'read-current-log',
  'restart_app',
  'saveBackgroundImage',
  'saveFile',
  'set-desktop-setting',
  'setLocale',
  'startOutgoingVideoCall',
  'themes.getActiveTheme',
  'themes.getAvailableThemes',
  'webxdc:instance-deleted',
  'webxdc:message-changed',
  'webxdc:realtime-data',
  'webxdc:status-update',
] as const)
export type InvokeChannel = (typeof INVOKE_CHANNELS)[number]

export const SEND_CHANNELS = Object.freeze([
  'frontendReady',
  'handleLogMessage',
  'help',
  'ipcReady',
  'json-rpc-request',
  'ondragstart',
  'reload-main-window',
] as const)
export type SendChannel = (typeof SEND_CHANNELS)[number]

/**
 * TODO: ideally we should get rid of all of these and move
 * them to the initialize function
 */
export const SEND_SYNC_CHANNELS = Object.freeze([
  'app-get-path',
  'get-config-path',
  'get-log-path',
  'get-rc-config',
  'get-runtime-info',
] as const)
export type SendSyncChannel = (typeof SEND_SYNC_CHANNELS)[number]

/** channels the renderer may subscribe to via `on` */
export const RECEIVE_CHANNELS = Object.freeze([
  'chooseLanguage',
  'clickOnNotification',
  'json-rpc-message',
  'onResumeFromSleep',
  'open-url',
  'showAboutDialog',
  'showHelpDialog',
  'showKeybindingsDialog',
  'showSettingsDialog',
  'theme-update',
  'webxdc.sendToChat',
] as const)
export type ReceiveChannel = (typeof RECEIVE_CHANNELS)[number]
