import { AppState } from './shared-types'

export function getDefaultState(): AppState {
  return {
    /**
     * Temporary state.
     */
    deltachat: {
      credentials: { addr: null },
    },
    /**
     * Persisted state. Must be JSON.
     */
    saved: {
      bounds: {},
      enterKeySends: false,
      notifications: true,
      showNotificationContent: true,
      locale: 'en',
      credentials: undefined,
      lastAccount: undefined,
      enableOnDemandLocationStreaming: false,
      chatViewBgImg: undefined,
      lastChats: {},
      zoomFactor: 1,
      activeTheme: 'system',
    },
    logins: [],
  }
}
