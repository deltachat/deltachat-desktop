import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import debounce from 'debounce'

import {
  BackendRemote,
  onDCEvent,
  EffectfulBackendActions,
} from '../../backend-com'
import { avatarInitial } from '../Avatar'
import { getLogger } from '../../../../shared/logger'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useContextMenuWithActiveState } from '../ContextMenu'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import AccountNotificationStoreInstance from '../../stores/accountNotifications'
import Icon from '../Icon'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import { openMapWebxdc } from '../../system-integration/webxdc'

type Props = {
  account: T.Account
  isSelected: boolean
  onSelectAccount: (accountId: number) => Promise<void>
  openAccountDeletionScreen: (accountId: number) => Promise<void>
  updateAccountForHoverInfo: (actingAccount: T.Account, select: boolean) => void
  syncAllAccounts: boolean
  muted: boolean
}

const log = getLogger('AccountsSidebar/AccountItem')

export default function AccountItem({
  account,
  isSelected,
  onSelectAccount,
  updateAccountForHoverInfo,
  openAccountDeletionScreen,
  syncAllAccounts,
  muted,
}: Props) {
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
      // IncomingMsg doesn't listen for added device messages,
      // so we also listen to `ChatlistChanged` because it is a good indicator and not emitted too often
      // https://github.com/deltachat/deltachat-desktop/issues/4013
      onDCEvent(account.id, 'ChatlistChanged', update),

      onDCEvent(account.id, 'MsgsNoticed', update),
      // when muting or unmuting a chat
      onDCEvent(account.id, 'ChatModified', update),
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
          // NOTE(maxph): Gallery.tsx gets unmounted before receiving media data
          // and only partially updates chat header without changing chat view to Gallery, 
          // so here 50ms is a temprorary workaround for that
        }, 50)
      },
    },
    {
      label: tx('menu_global_map'),
      action: async () => {
        await onSelectAccount(account.id)
        openMapWebxdc(account.id)
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
        className={classNames(styles.accountBadgeIcon, styles.bgSyncDisabled)}
        aria-label='Background sync disabled'
      >
        ⏻
      </div>
    )
  } else if (unreadCount > 0) {
    badgeContent = (
      <div
        className={classNames(styles.accountBadgeIcon, {
          [styles.muted]: muted,
        })}
      >
        {unreadCount}
      </div>
    )
  }

  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!isSelected) {
      return
    }

    if (ref.current == null) {
      log.warn(
        'Could not scroll the selected account into view. Element:',
        ref.current
      )
      return
    }

    ref.current.scrollIntoView({
      // We mostly want this code for the initial render
      // and for when the user switches accounts by clicking a message
      // notification,
      // so let's not smooth-scroll here as this is not a "state change"
      // that needs to be shown to the user.
      behavior: 'instant',
      // "nearest" so as to not scroll if it's already in view.
      block: 'nearest',
      inline: 'nearest',
    })
    // `window.__screen` because we display the "settings" button
    // based on that, and whether it is displayed or not determines the
    // scrollHeight of the accounts list, so we want to make sure
    // to scroll after it gets displayed.
    // TODO refactor: maybe just use `ResizeObserver`,
    // as we do with messages list:
    // https://github.com/deltachat/deltachat-desktop/pull/4119
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, window.__screen])

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
      ref={ref}
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
          aria-label='Account notifications muted'
          className={styles.accountMutedIconShadow}
        >
          <Icon className={styles.accountMutedIcon} icon='audio-muted' />
        </div>
      )}
      <div className={classNames(styles.accountBadge)}>{badgeContent}</div>
    </div>
  )
}

// Marks all chats with fresh messages as noticed
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

  for (const chatId of uniqueChatIds) {
    await EffectfulBackendActions.marknoticedChat(accountId, chatId)
  }
}
