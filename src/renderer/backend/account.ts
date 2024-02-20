import SettingsStoreInstance from '../stores/settings'
import { BackendRemote } from '../backend-com'
import { runtime } from '../runtime'

export async function unselectAccount(accountId: number) {
  const { syncAllAccounts } = await runtime.getDesktopSettings()

  // @TODO: Refactor this to atoms as well
  SettingsStoreInstance.effect.clear()

  if (!syncAllAccounts) {
    await BackendRemote.rpc.stopIo(accountId)
    runtime.closeAllWebxdcInstances()
  }

  runtime.setDesktopSetting('lastAccount', undefined)
}

export async function selectAccount(accountId: number) {
  await BackendRemote.rpc.startIo(accountId)
  runtime.setDesktopSetting('lastAccount', accountId)
}
