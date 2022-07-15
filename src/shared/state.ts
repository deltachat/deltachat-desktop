import { DesktopSettingsType } from './shared-types'

export function getDefaultState(): DesktopSettingsType {
  /**
   * Persisted state. Must be JSON.
   */
  return {
    bounds: {},
    enterKeySends: false,
    notifications: true,
    showNotificationContent: true,
    locale: null, // if this is null, the system chooses the system language electron reports
    credentials: undefined,
    lastAccount: undefined,
    enableAVCalls: false,
    enableBroadcastLists: false,
    enableChatAuditLog: false,
    enableOnDemandLocationStreaming: false,
    chatViewBgImg: undefined,
    /** deprecated isn't used anymore since the move to jsonrpc */
    lastChats: {},
    zoomFactor: 1,
    activeTheme: 'system',
    minimizeToTray: false,
    syncAllAccounts: true,
  }
}
