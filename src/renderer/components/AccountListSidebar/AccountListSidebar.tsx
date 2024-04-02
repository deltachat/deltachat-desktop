import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debounce } from 'debounce'

import AccountHoverInfo from './AccountHoverInfo'
import AccountItem from './AccountItem'
import Icon from '../Icon'
import Settings from '../Settings'
import useAccount from '../../hooks/useAccount'
import useDialog from '../../hooks/useDialog'
import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { useAccountNotificationStore } from '../../stores/accountNotifications'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

export default function AccountListSidebar() {
  const { openDialog } = useDialog()
  const { accountId, addAccount, selectAccount } = useAccount()
  const [accounts, setAccounts] = useState<T.Account[]>([])
  const [{ accounts: noficationSettings }] = useAccountNotificationStore()

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
  }, [accountId, refresh])

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

  const openSettings = () => openDialog(Settings)

  return (
    <div className={styles.accountListSidebar}>
      {runtime.getRuntimeInfo().isMac && (
        <div className={styles.macOSTrafficLightBackground} />
      )}
      <div className={styles.accountList} onScroll={updateHoverInfoPosition}>
        {accounts.map(account => (
          <AccountItem
            key={account.id}
            account={account}
            isSelected={accountId === account.id}
            onSelectAccount={selectAccount}
            openAccountDeletionScreen={openAccountDeletionScreen}
            updateAccountForHoverInfo={updateAccountForHoverInfo}
            syncAllAccounts={syncAllAccounts}
            muted={noficationSettings[account.id]?.muted || false}
          />
        ))}
        <button className={styles.addButton} onClick={addAccount}>
          +
        </button>
      </div>
      <div className={styles.buttonsContainer}>
        <button className={styles.settingsButton} onClick={openSettings}>
          <Icon
            size={38}
            className={styles.settingsButtonIcon}
            icon={'settings'}
          />
        </button>
      </div>
      <div className={styles.accountHoverInfoContainer} ref={hoverInfo}>
        {accountForHoverInfo && (
          <AccountHoverInfo
            account={accountForHoverInfo}
            isSelected={accountId === accountForHoverInfo.id}
            muted={noficationSettings[accountForHoverInfo.id]?.muted || false}
          />
        )}
      </div>
    </div>
  )
}
