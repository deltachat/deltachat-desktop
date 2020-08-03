import { AppState } from './shared-types'

export function getDefaultState(): AppState {
  return {
    /**
     * Persisted state. Must be JSON.
     */
    saved: {
      bounds: {},
      enterKeySends: false,
      notifications: true,
      showNotificationContent: true,
      locale: null, // if this is null, the system chooses the system language electron reports
      credentials: undefined,
      lastAccount: undefined,
      enableOnDemandLocationStreaming: false,
      enableDisappearingMessages: false,
      chatViewBgImg: undefined,
      lastChats: {},
      zoomFactor: 1,
      activeTheme: 'system',
    },
    logins: [],
  }
}
