import { T } from '@deltachat/jsonrpc-client'
import React, { useEffect, useMemo, useState } from 'react'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { Avatar } from '../Avatar'
import classNames from 'classnames'
import debounce from 'debounce'
import { getLogger } from '../../../shared/logger'
import { useSettingsStore } from '../../stores/settings'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useContextMenuWithActiveState } from '../ContextMenu'
import { ActionEmitter, KeybindAction } from '../../keybindings'

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

  // TODO
  // - [X] basic css allignment of sidebar
  // - [X] show / hide when appropriate
  // - [X] show all accounts
  // - [X] hightligh selected account
  // - [X] unread badge for accounts

  // - [ ] Fix chat menu (3dot)
  // - [X] fix gallery
  // - [X] fix map
  // - [X] main screen needs to be fully rerendered (currently chtlist bugs around because it keeps prior state)

  // - [X] fake unread badge with disconnected sign for not selected accounts when sync all is deactivated
  // - [ ] option to mute account if not active (grey badge if any, if no unread then show mute icon in badge)
  // - [ ] save property inside of the specified account "ui.desktop.muted-if-in-bg"
  // - [ ] check when creating a notification if account is muted
  // - [ ] show notifications for other accounts also when window is in foreground

  return (
    <div className='account-list-sidebar'>
      {accounts.map(account => (
        <AccountItem
          key={account.id}
          account={account}
          isSelected={selectedAccountId === account.id}
          onSelectAccount={selectAccount}
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
  const tx = useTranslationFunction()

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

  const { onContextMenu, isContextMenuActive } = useContextMenuWithActiveState([
    !bgSyncDisabled &&
      unreadCount > 0 && {
        label: tx('mark_all_as_read'),
        action: () => {
          markAccountAsRead(account.id)
        },
      },
    {
      label: tx('menu_all_media'),
      action: async () => {
        await onSelectAccount(account.id)
        // set Timeout forces it to be run after react update
        setTimeout(() => {
          ActionEmitter.emitAction(KeybindAction.GlobalGallery_Open)
        }, 0)
      },
    },
    {
      label: tx('menu_settings'),
      action: async () => {
        await onSelectAccount(account.id)
        // set Timeout forces it to be run after react update
        setTimeout(() => {
          ActionEmitter.emitAction(KeybindAction.Settings_Open)
        }, 0)
      },
    },
    false && {
      label: tx('delete_account'),
      action: async () => {
        // TODO
      },
    },
  ])

  return (
    <div
      className={classNames('account', {
        active: isSelected,
        'context-menu-active': isContextMenuActive,
      })}
      onClick={() => onSelectAccount(account.id)}
      onContextMenu={onContextMenu}
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

      <div className='tooltip'></div>
    </div>
  )
}

// marks all chats with fresh messages as noticed
async function markAccountAsRead(accountId: number) {
  const msgs = await BackendRemote.rpc.getFreshMsgs(accountId)
  const messages = await BackendRemote.rpc.getMessages(accountId, msgs)

  const uniqueChatIds = new Set<number>()
  for (const key in messages) {
    if (Object.prototype.hasOwnProperty.call(messages, key)) {
      const message = messages[key]
      if (message.kind === 'message') {
        uniqueChatIds.add(message.chatId)
      }
    }
  }

  await Promise.all(
    [...uniqueChatIds].map(chatId =>
      BackendRemote.rpc.marknoticedChat(accountId, chatId)
    )
  )
}
