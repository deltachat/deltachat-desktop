import { T } from '@deltachat/jsonrpc-client'
import React, { useEffect, useMemo, useState } from 'react'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { runtime } from '../../runtime'
import { Avatar } from '../Avatar'
import classNames from 'classnames'
import debounce from 'debounce'
import { getLogger } from '../../../shared/logger'
import { useSettingsStore } from '../../stores/settings'

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
  // const [syncAllAccounts, setSyncAllAccounts] = useState<boolean | null>(null)

  const refresh = useMemo(
    () => async () => {
      const accounts = await BackendRemote.rpc.getAllAccounts()
      setAccounts(accounts)
      const desktopSettings = await runtime.getDesktopSettings()
      // setSyncAllAccounts(desktopSettings.syncAllAccounts)
      // see if the sidebar should be visible
      setVisibility(accounts.length > 1 && !desktopSettings.hideAccountsSidebar)
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [selectedAccountId, refresh])

  // const toggleSyncAllAccounts = (newValue: boolean) => {
  //   runtime.setDesktopSetting('syncAllAccounts', true).then(refresh)
  // }

  const [hasMouseOver, setMouseOver] = useState<boolean>(false)

  if (!isVisible) {
    return null
  }

  // TODO
  // - [X] basic css allignment of sidebar
  // - [X] show / hide when appropriate
  // - [X] show all accounts
  // - [X] hightligh selected account
  // - [X] unread badge for accounts

  // - [ ] Fix chat menu (3dot)
  // - [ ] fix gallery
  // - [ ] fix map
  // - [X] main screen needs to be fully rerendered (currently chtlist bugs around because it keeps prior state)

  // - [X] fake unread badge with disconnected sign for not selected accounts when sync all is deactivated
  // - [ ] option to mute account if not active (grey badge if any, if no unread then show mute icon in badge)
  // - [ ] save property inside of the specified account "ui.desktop.muted-if-in-bg"
  // - [ ] check when creating a notification if account is muted
  // - [ ] show notifications for other accounts also when window is in foreground

  // - [ ] make sure app works fine when bar is shown and when bar is hidden

  return (
    <div
      className={classNames('account-list-sidebar', {
        hideScrollbarThumb: !hasMouseOver,
      })}
      onMouseEnter={setMouseOver.bind(null, true)}
      onMouseLeave={setMouseOver.bind(null, false)}
    >
      {accounts.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelectAccount={onSelectAccount}
        />
      ))}
      <button className='add-button' onClick={onAddAccount}>
        +
      </button>
    </div>
  )
}

const log = getLogger('AccountsSidebar/AccountItem')

function AccountItem({
  account,
  isSelected,
  onSelectAccount,
}: {
  account: T.Account
  isSelected: boolean
  onSelectAccount: (accountId: number) => Promise<void>
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  useEffect(() => {
    const update = debounce(() => {
      BackendRemote.rpc
        .getFreshMsgs(account.id)
        .then(u => setUnreadCount(u?.length || 0))
        .catch(log.error)
    }, 200)
    update()
    const cleanup = [
      onDCEvent(account.id, 'IncomingMsg', update),
      onDCEvent(account.id, 'MsgsNoticed', update),
    ]
    return () => cleanup.forEach(off => off())
  }, [account.id])

  const [settings] = useSettingsStore()

  const bgSyncDisabled =
    settings?.desktopSettings.syncAllAccounts === false && !isSelected

  return (
    <div
      className={classNames('account', {
        active: isSelected,
      })}
      onClick={() => onSelectAccount(account.id)}
    >
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

      <div className='account-badge'>
        {!bgSyncDisabled && unreadCount > 0 && (
          <div className='fresh-message-counter'>{unreadCount}</div>
        )}
        {bgSyncDisabled && (
          <div
            className='bg-sync-disabled'
            title='Background Sync Disabled, Account is only synced when selected'
          >
            ⏻
          </div>
        )}
      </div>
    </div>
  )
}
