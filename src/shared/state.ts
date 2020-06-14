import { AppState } from './shared-types'

export function getDefaultState(): AppState {
  return {
    /**
     * Temporary state.
     */
    logins: [],
    deltachat: {
      configuring: false,
      credentials: { addr: null },
      ready: false,
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
      credentials: null,
      enableOnDemandLocationStreaming: false,
      chatViewBgImg: undefined,
      lastChats: {},
      zoomFactor: 1,
      activeTheme: 'system',
    },
  }
}
