import { DesktopSettingsType } from './shared-types.js'

export function getDefaultState(): DesktopSettingsType {
  /**
   * Persisted state. Must be JSON.
   */
  return {
    bounds: {},
    HTMLEmailWindowBounds: undefined,
    enterKeySends: false,
    notifications: true,
    showNotificationContent: true,
    locale: null, // if this is null, the system chooses the system language that electron reports
    credentials: undefined,
    lastAccount: undefined,
    enableAVCallsV2: false,
    enableBroadcastLists: false,
    enableOnDemandLocationStreaming: false,
    chatViewBgImg: undefined,
    lastChats: {},
    zoomFactor: undefined,
    activeTheme: 'system',
    minimizeToTray: true,
    syncAllAccounts: true,
    lastSaveDialogLocation: undefined,
    enableWebxdcDevTools: false,
    HTMLEmailAskForRemoteLoadingConfirmation: true,
    HTMLEmailAlwaysLoadRemoteContent: false,
    galleryImageKeepAspectRatio: false,
    useSystemUIFont: false,
    contentProtectionEnabled: false,
    isMentionsEnabled: true,
    inChatSoundsVolume: 0.5,
    autostart: true,
  }
}
