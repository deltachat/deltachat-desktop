import { T } from '@deltachat/jsonrpc-client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BackendRemote } from '../../../backend-com'
import { AccountItem } from './AccountItem'

import styles from './styles.module.scss'
import { AccountHoverInfo } from './AccountHoverInfo'
import { debounce } from 'debounce'
import { runtime } from '../../../runtime'

export function AccountListSidebar({
  selectedAccountId,
  onAddAccount,
  onSelectAccount,
  openAccountDeletionScreen,
}: {
  selectedAccountId: number | undefined
  onAddAccount: () => Promise<number>
  onSelectAccount: (accountId: number) => Promise<void>
  openAccountDeletionScreen: (accountId: number) => Promise<void>
}) {
  const [accounts, setAccounts] = useState<T.Account[]>([])

  const selectAccount = async (accountId: number) => {
    if (selectedAccountId === accountId) {
      return
    }

    await onSelectAccount(accountId)
  }

  const [syncAllAccounts, setSyncAllAccounts] = useState(true)

  const refresh = useMemo(
    () => async () => {
      const accounts = await BackendRemote.rpc.getAllAccounts()
      setAccounts(accounts)
      const desktopSettings = await runtime.getDesktopSettings()
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [selectedAccountId, refresh])

  const [accountForHoverInfo, internalSetAccountForHoverInfo] =
    useState<T.Account | null>(null)

  const updateAccountForHoverInfo = (
    actingAccount: T.Account,
    select: boolean
  ) => {
    internalSetAccountForHoverInfo(oldAccount => {
      if (actingAccount === oldAccount && select === false) {
        // only deselect if it is really deselecting the current one
        return null
      }
      if (select) return actingAccount
      return null
    })
  }

  const hoverInfo = useRef<HTMLDivElement | null>(null)

  const updateHoverInfoPosition = useCallback(() => {
    if (hoverInfo.current && accountForHoverInfo) {
      const elem = document.querySelector(
        `div[x-account-sidebar-account-id="${accountForHoverInfo.id}"]`
      )
      if (elem) {
        const rect = elem.getBoundingClientRect()
        hoverInfo.current.style.top = `${rect.top}px`
        hoverInfo.current.style.left = `${rect.right + 15}px`
      }
    }
  }, [accountForHoverInfo])

  useEffect(() => {
    updateHoverInfoPosition()
  }, [accountForHoverInfo, updateHoverInfoPosition])

  useEffect(() => {
    window.__updateAccountListSidebar = debounce(() => {
      refresh()
    }, 200)
  }, [refresh])

  return (
    <div
      className={styles.accountListSidebar}
      onScroll={updateHoverInfoPosition}
    >
      {accounts.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelectAccount={selectAccount}
          openAccountDeletionScreen={openAccountDeletionScreen}
          updateAccountForHoverInfo={updateAccountForHoverInfo}
          syncAllAccounts={syncAllAccounts}
        />
      ))}
      <button className={styles.addButton} onClick={onAddAccount}>
        +
      </button>
      <div className={styles.AccountHoverInfoContainer} ref={hoverInfo}>
        {accountForHoverInfo && (
          <AccountHoverInfo
            account={accountForHoverInfo}
            isSelected={selectedAccountId === accountForHoverInfo.id}
          />
        )}
      </div>
    </div>
  )
}
