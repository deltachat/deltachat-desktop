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
    enableAVCalls: false,
    enableBroadcastLists: false,
    enableChatAuditLog: false,
    enableOnDemandLocationStreaming: false,
    chatViewBgImg: undefined,
    lastChats: {},
    zoomFactor: 1,
    activeTheme: 'system',
    minimizeToTray: true,
    syncAllAccounts: true,
    lastSaveDialogLocation: undefined,
    experimentalEnableMarkdownInMessages: false,
    enableWebxdcDevTools: false,
    HTMLEmailAskForRemoteLoadingConfirmation: true,
    HTMLEmailAlwaysLoadRemoteContent: false,
    enableRelatedChats: false,
    galleryImageKeepAspectRatio: false,
    useSystemUIFont: false,
    contentProtectionEnabled: false,
    isMentionsEnabled: true,
    autostart: true,
  }
}
