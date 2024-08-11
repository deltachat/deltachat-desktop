/// this store is to keep track of what accounts are muted, basically for caching the core ui config key.
/// in the future it can also cache custom notifcations sounds

import { BackendRemote } from '../backend-com'
import { onReady } from '../onready'
import { Store, useStore } from './store'

/**
 * core ui config key to mute an account on desktop.
 *
 * `"1"` means muted, anything else is interpreted as not muted
 */
const UI_CONFIG_DESKTOP_MUTED = 'ui.desktop.muted'

interface AccountNotificationState {
  muted: boolean
}

interface AccountNotificationStoreState {
  accounts: {
    [accountId: number]: AccountNotificationState | undefined
  }
}

class AccountNotificationStore extends Store<AccountNotificationStoreState> {
  constructor() {
    super({ accounts: {} }, 'AccountNotificationStore')
  }

  reducer = {
    setAccounts: (newState: AccountNotificationStoreState['accounts']) => {
      this.setState(_state => {
        return { accounts: newState }
      }, 'set')
    },
  }

  effect = {
    loadSettings: async () => {
      const accounts = await BackendRemote.rpc.getAllAccountIds()
      const accountInfo = await Promise.all(
        accounts.map(async accountId => ({
          id: accountId,
          muted:
            (await BackendRemote.rpc.getConfig(
              accountId,
              UI_CONFIG_DESKTOP_MUTED
            )) === '1',
        }))
      )

      const accountsAdditionalConfig: AccountNotificationStoreState['accounts'] =
        {}
      for (const info of accountInfo) {
        accountsAdditionalConfig[info.id] = info
      }
      this.reducer.setAccounts(accountsAdditionalConfig)
    },
    setMuted: async (accountId: number, mute: boolean) => {
      await BackendRemote.rpc.setConfig(
        accountId,
        UI_CONFIG_DESKTOP_MUTED,
        mute ? '1' : '0'
      )
      this.effect.loadSettings()
    },
  }

  isAccountMuted(accountId: number): boolean {
    return this.state.accounts[accountId]?.muted || false
  }
}

const AccountNotificationStoreInstance = new AccountNotificationStore()
export const useAccountNotificationStore = () =>
  useStore(AccountNotificationStoreInstance)

export default AccountNotificationStoreInstance

onReady(() => {
  AccountNotificationStoreInstance.effect.loadSettings()
})
