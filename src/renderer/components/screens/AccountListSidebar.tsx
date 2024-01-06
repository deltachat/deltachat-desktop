import { T } from '@deltachat/jsonrpc-client'
import React, { useEffect, useMemo, useState } from 'react'
import { BackendRemote } from '../../backend-com'
import { runtime } from '../../runtime'
import { Avatar } from '../Avatar'

export function AccountListSidebar({
  selectedAccountId,
  onAddAccount,
  onSelectAccount,
}: {
  selectedAccountId: number | undefined
  onAddAccount: () => Promise<number>
  onSelectAccount: (accountId: number) => Promise<void>
}) {
  const [isVisible, setVisibility] = useState(false)
  const [accounts, setAccounts] = useState<T.Account[]>([])
  const [syncAllAccounts, setSyncAllAccounts] = useState<boolean | null>(null)

  const refresh = useMemo(
    () => async () => {
      const accounts = await BackendRemote.rpc.getAllAccounts()
      setAccounts(accounts)
      const desktopSettings = await runtime.getDesktopSettings()
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
      // see if the sidebar should be visible
      setVisibility(accounts.length > 1 && !desktopSettings.hideAccountsSidebar)
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [selectedAccountId, refresh])

  const toggleSyncAllAccounts = (newValue: boolean) => {
    runtime.setDesktopSetting('syncAllAccounts', true).then(refresh)
  }

  if (!isVisible) {
    return null
  }

  // TODO
  // - [X] basic css allignment of sidebar
  // - [X] show / hide when appropriate
  // - [ ] show all accounts
  // - [ ] hightligh selected account
  // - [ ] unread badge for accounts

  // - [ ] Fix chat menu (3dot)
  // - [ ] fix gallery
  // - [ ] fix map
  // - [ ] main screen needs to be fully rerendered (currently chtlist bugs around because it keeps prior state)

  // - [ ] fake unread badge with disconnected sign for not selected accounts when sync all is deactivated
  // - [ ] option to mute account if not active (grey badge if any, if no unread then show bute icon in badge)
  // - [ ] save property inside of the specified account "ui.desktop.muted-if-in-bg"
  // - [ ] check when creating a notification if account is muted
  // - [ ] show notifications for other accounts also when window is in foreground

  // - [ ] make sure app works fine when bar is shown and when bar is hidden

  return (
    <div className='account-list-sidebar'>
      Hi
      {selectedAccountId}
      {accounts.map(account => (
        <div className='account' onClick={() => onSelectAccount(account.id)}>
          {account.kind == 'Configured' ? (
            <Avatar
              {...{
                avatarPath: account.profileImage || undefined,
                color: account.color,
                displayName: account.displayName || '',
                addr: account.addr || undefined,
              }}
            />
          ) : (
            <Avatar displayName={'?'} addr={'?'} />
          )}
        </div>
      ))}
      <button onClick={onAddAccount}>+</button>
    </div>
  )
}
