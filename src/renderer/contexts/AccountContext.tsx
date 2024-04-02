import React, { useCallback, useState } from 'react'

import SettingsStoreInstance from '../stores/settings'
import { BackendRemote, EffectfulBackendActions } from '../backend-com'
import { runtime } from '../runtime'
import { updateDeviceChats } from '../deviceMessages'

import type { PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

type AddAccount = () => Promise<number>

type SelectAccount = (accountId: number) => Promise<void>

type UnselectAccount = () => Promise<void>

type DeleteAccount = (accountId: number) => Promise<void>

export type AccountValue = {
  account?: T.Account
  accountId?: number
  addAccount: AddAccount
  selectAccount: SelectAccount
  unselectAccount: UnselectAccount
  deleteAccount: DeleteAccount
}

export const AccountContext = React.createContext<AccountValue | null>(null)

export const AccountProvider = ({ children }: PropsWithChildren<{}>) => {
  const [accountId, setAccountId] = useState<number | undefined>()
  const [account, setAccount] = useState<T.Account | undefined>()

  const unselectAccount = useCallback<UnselectAccount>(async () => {
    if (accountId === undefined) {
      return
    }

    SettingsStoreInstance.effect.clear()

    if (!(await runtime.getDesktopSettings()).syncAllAccounts) {
      await BackendRemote.rpc.stopIo(accountId)
      // does not work if previous account will be disabled, so better close it
      runtime.closeAllWebxdcInstances()
    }

    runtime.setDesktopSetting('lastAccount', undefined)
    ;(window.__selectedAccountId as any) = undefined

    setAccountId(undefined)
    setAccount(undefined)
  }, [accountId])

  const selectAccount = useCallback<SelectAccount>(
    async (nextAccountId: number) => {
      if (nextAccountId !== accountId) {
        await unselectAccount()
      }

      setAccountId(nextAccountId)

      // @TODO: In the future we want to remove storing this value in the global
      // `window` scope and use this context instead
      ;(window.__selectedAccountId as number) = nextAccountId

      const nextAccount = await BackendRemote.rpc.getAccountInfo(nextAccountId)
      setAccount(nextAccount)

      if (nextAccount.kind === 'Configured') {
        // @TODO
        // this.changeScreen(Screens.Main)
        updateDeviceChats(nextAccountId)
      } else {
        // @TODO
        // this.changeScreen(Screens.Welcome)
      }

      await BackendRemote.rpc.startIo(nextAccountId)
      runtime.setDesktopSetting('lastAccount', nextAccountId)
    },
    [accountId, unselectAccount]
  )

  const addAccount = useCallback<AddAccount>(async () => {
    const newAccountId = await BackendRemote.rpc.addAccount()
    updateDeviceChats(newAccountId, true) // skip changelog
    await selectAccount(newAccountId)
    return newAccountId
  }, [selectAccount])

  const deleteAccount = useCallback<DeleteAccount>(
    async (removeAccountId: number) => {
      await unselectAccount()
      await EffectfulBackendActions.removeAccount(removeAccountId)
      // @TODO
      // this.changeScreen(Screens.NoAccountSelected)
    },
    [unselectAccount]
  )

  const value: AccountValue = {
    account,
    accountId,
    addAccount,
    selectAccount,
    unselectAccount,
    deleteAccount,
  }

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  )
}
