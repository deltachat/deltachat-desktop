import { T } from '@deltachat/jsonrpc-client'
import React, { useEffect, useMemo, useState } from 'react'
import { BackendRemote } from '../../../backend-com'
import { AccountItem } from './AccountItem'

import styles from './styles.module.scss'

export function AccountListSidebar({
  selectedAccountId,
  onAddAccount,
  onSelectAccount,
}: {
  selectedAccountId: number | undefined
  onAddAccount: () => Promise<number>
  onSelectAccount: (accountId: number) => Promise<void>
}) {
  const [accounts, setAccounts] = useState<T.Account[]>([])

  const selectAccount = async (accountId: number) => {
    if (selectedAccountId === accountId) {
      return
    }

    await onSelectAccount(accountId)
  }

  const refresh = useMemo(
    () => async () => {
      const accounts = await BackendRemote.rpc.getAllAccounts()
      setAccounts(accounts)
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [selectedAccountId, refresh])

  return (
    <div className={styles.accountListSidebar}>
      {accounts.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelectAccount={selectAccount}
        />
      ))}
      <button className={styles.addButton} onClick={onAddAccount}>
        +
      </button>
    </div>
  )
}


