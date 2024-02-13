import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import debounce from 'debounce'

import { BackendRemote, onDCEvent } from '../../backend-com'
import { avatarInitial } from '../Avatar'
import { getLogger } from '../../../shared/logger'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useContextMenuWithActiveState } from '../ContextMenu'
import { ActionEmitter, KeybindAction } from '../../keybindings'

import styles from './styles.module.scss'
import type { T } from '@deltachat/jsonrpc-client'
import AccountNotificationStoreInstance from '../../stores/accountNotifications'

const log = getLogger('AccountsSidebar/AccountItem')
export default function AccountItem({
  account,
  isSelected,
  onSelectAccount,
  updateAccountForHoverInfo,
  openAccountDeletionScreen,
  syncAllAccounts,
  muted,
}: {
  account: T.Account
  isSelected: boolean
  onSelectAccount: (accountId: number) => Promise<void>
  openAccountDeletionScreen: (accountId: number) => Promise<void>
  updateAccountForHoverInfo: (actingAccount: T.Account, select: boolean) => void
  syncAllAccounts: boolean
  muted: boolean
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

  const bgSyncDisabled = syncAllAccounts === false && !isSelected

  const { onContextMenu, isContextMenuActive } = useContextMenuWithActiveState([
    !bgSyncDisabled &&
      unreadCount > 0 && {
        label: tx('mark_all_as_read'),
        action: () => {
          markAccountAsRead(account.id)
        },
      },
    muted
      ? {
          label: tx('menu_unmute'),
          action: () => {
            AccountNotificationStoreInstance.effect.setMuted(account.id, false)
          },
        }
      : {
          label: tx('menu_mute'),
          action: () => {
            AccountNotificationStoreInstance.effect.setMuted(account.id, true)
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
    {
      label: tx('delete_account'),
      action: openAccountDeletionScreen.bind(null, account.id),
    },
  ])

  let badgeContent

  if (bgSyncDisabled) {
    badgeContent = (
      <div
        className={styles.bgSyncDisabled}
        aria-label='Background sync disabled'
      >
        ⏻
      </div>
    )
  } else if (unreadCount > 0) {
    badgeContent = (
      <div
        className={classNames(styles.freshMessageCounter, {
          [styles.accountBadgeMuted]: muted,
        })}
      >
        {unreadCount}
      </div>
    )
  }

  return (
    <div
      className={classNames(styles.account, {
        [styles.active]: isSelected,
        [styles['context-menu-active']]: isContextMenuActive,
      })}
      onClick={() => onSelectAccount(account.id)}
      onContextMenu={onContextMenu}
      onMouseEnter={() => updateAccountForHoverInfo(account, true)}
      onMouseLeave={() => updateAccountForHoverInfo(account, false)}
      x-account-sidebar-account-id={account.id}
    >
      {account.kind == 'Configured' ? (
        <div className={styles.avatar}>
          {' '}
          {account.profileImage ? (
            <img
              className={styles.content}
              src={'file://' + account.profileImage}
            />
          ) : (
            <div
              className={styles.content}
              style={{ backgroundColor: account.color }}
            >
              {avatarInitial(
                account.displayName || '',
                account.addr || undefined
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.avatar}>
          <div className={styles.content}>?</div>
        </div>
      )}
      {muted && (
        <div
          className={classNames(styles.accountMuted, {
            [styles.accountBadgeMuted]: muted,
          })}
          aria-label='Account Notifications Muted'
        >
          <div className={styles.accountMutedIcon} />
        </div>
      )}
      <div className={classNames(styles.accountBadge)}>{badgeContent}</div>
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
