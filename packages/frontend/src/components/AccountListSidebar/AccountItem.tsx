import React, { useEffect, useLayoutEffect, useRef } from 'react'
import classNames from 'classnames'
import { throttle } from '@deltachat-desktop/shared/util'

import {
  BackendRemote,
  onDCEvent,
  EffectfulBackendActions,
} from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { getLogger } from '../../../../shared/logger'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useContextMenuWithActiveState } from '../ContextMenu'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import AccountNotificationStoreInstance from '../../stores/accountNotifications'
import Icon from '../Icon'

import styles from './styles.module.scss'

import { C, type T } from '@deltachat/jsonrpc-client'
import { openMapWebxdc } from '../../system-integration/webxdc'
import useDialog from '../../hooks/dialog/useDialog'
import { EditPrivateTagDialog } from './EditPrivateTagDialog'
import { useRovingTabindex } from '../../contexts/RovingTabindex'
import { useRpcFetch } from '../../hooks/useFetch'

type Props = {
  accountId: number
  isSelected: boolean
  onSelectAccount: (accountId: number) => Promise<void>
  openAccountDeletionScreen: (accountId: number) => Promise<void>
  updateAccountForHoverInfo: (actingAccount: T.Account, select: boolean) => void
  syncAllAccounts: boolean
  muted: boolean
}

const log = getLogger('AccountsSidebar/AccountItem')

export default function AccountItem({
  accountId,
  isSelected,
  onSelectAccount,
  updateAccountForHoverInfo,
  openAccountDeletionScreen,
  syncAllAccounts,
  muted,
}: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const accountFetch = useRpcFetch(BackendRemote.rpc.getAccountInfo, [
    accountId,
  ])
  if (accountFetch.result?.ok === false) {
    log.error('Failed to fetch account', accountFetch.result.err)
  }
  const account = accountFetch.lingeringResult?.ok
    ? accountFetch.lingeringResult.value
    : null

  const freshMsgsFetch = useRpcFetch(BackendRemote.rpc.getFreshMsgs, [
    accountId,
  ])
  if (freshMsgsFetch.result?.ok === false) {
    log.error('Failed to fetch unread count', freshMsgsFetch.result.err)
  }
  const unreadCount = freshMsgsFetch.lingeringResult?.ok
    ? freshMsgsFetch.lingeringResult.value.length
    : null

  useEffect(() => {
    const updateAccount = throttle(accountFetch.refresh, 200)
    const updateUnread = throttle(freshMsgsFetch.refresh, 200)

    const cleanup = [
      onDCEvent(accountId, 'AccountsItemChanged', updateAccount),

      // FYI we have 3 places where we watch the number of unread messages:
      // - App's badge counter
      // - Per-account badge counter in accounts list
      // - useUnreadCount
      // Make sure to update all the places if you update one of them.

      onDCEvent(accountId, 'IncomingMsg', updateUnread),
      // IncomingMsg doesn't listen for added device messages,
      // so we also listen to `ChatlistChanged` because it is a good indicator and not emitted too often
      // https://github.com/deltachat/deltachat-desktop/issues/4013
      onDCEvent(accountId, 'ChatlistChanged', updateUnread),

      onDCEvent(accountId, 'MsgsNoticed', updateUnread),
      // when muting or unmuting a chat
      onDCEvent(accountId, 'ChatModified', updateUnread),
    ]

    return () => cleanup.forEach(off => off())
  }, [accountId, accountFetch.refresh, freshMsgsFetch.refresh])

  const bgSyncDisabled = syncAllAccounts === false && !isSelected

  const { onContextMenu, isContextMenuActive } = useContextMenuWithActiveState(
    [
      muted
        ? {
            label: tx('menu_unmute'),
            action: () => {
              AccountNotificationStoreInstance.effect.setMuted(accountId, false)
            },
          }
        : {
            label: tx('menu_mute'),
            action: () => {
              AccountNotificationStoreInstance.effect.setMuted(accountId, true)
            },
          },
      {
        label: tx('mark_all_as_read'),
        action: () => {
          markAccountAsRead(accountId)
        },
      },
      {
        label: tx('menu_all_media'),
        action: async () => {
          await onSelectAccount(accountId)
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
        label: tx('menu_show_global_map'),
        action: async () => {
          await onSelectAccount(accountId)
          openMapWebxdc(accountId)
        },
      },
      { type: 'separator' },
      {
        label: tx('menu_settings'),
        action: async () => {
          await onSelectAccount(accountId)
          setTimeout(() => {
            // set Timeout forces it to be run after react update
            // without the small delay the app crashed randomly in the e2e tests
            ActionEmitter.emitAction(KeybindAction.Settings_Open)
          }, 100)
        },
        dataTestid: 'open-settings-menu-item',
      },
      {
        label: tx('profile_tag'),
        action: async () => {
          openDialog(EditPrivateTagDialog, {
            accountId,
            currentTag: await BackendRemote.rpc.getConfig(
              accountId,
              'private_tag'
            ),
          })
        },
      },
      { type: 'separator' },
      {
        label: tx('delete_account'),
        action: openAccountDeletionScreen.bind(null, accountId),
        dataTestid: 'delete-account-menu-item',
      },
    ],
    { 'aria-label': tx('accounts_list_item_menu_label') }
  )

  let badgeContent
  if (bgSyncDisabled) {
    badgeContent = (
      <div
        className={classNames(styles.accountBadgeIcon, styles.bgSyncDisabled)}
        aria-label={tx('background_sync_disabled_explaination')}
      >
        ⏻
      </div>
    )
  } else if (unreadCount != null && unreadCount > 0) {
    badgeContent = (
      <div
        className={classNames(styles.accountBadgeIcon, {
          [styles.muted]: muted,
        })}
        // Looking at the string key, this might be interprented that
        // it only applies to a single chat.
        // But it's good enough I guess.
        // Maybe we could also use `n_messages_in_m_chats` instead.
        aria-label={tx('chat_n_new_messages', String(unreadCount), {
          quantity: unreadCount,
        })}
      >
        {unreadCount}
      </div>
    )
  }

  const isSticky = unreadCount != null && unreadCount > 0

  const ref = useRef<HTMLButtonElement>(null)
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
    //
    // Also watching `isSticky` because the selected account might stop
    // being sticky when the user reads its messages,
    // and it would get out of view, so we'd want to get it back in view.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, isSticky, window.__screen])

  const rovingTabindex = useRovingTabindex(ref)
  // TODO `rovingTabindex.setAsActiveElement()` when the active account
  // gets switched, e.g. via clicking on a message notification
  // for a different account, and upon initial render.

  return (
    <div
      className={classNames(styles.accountWrapper, {
        [styles.isSticky]: isSticky,
      })}
    >
      <button
        type='button'
        className={classNames(styles.account, rovingTabindex.className, {
          [styles.active]: isSelected,
          [styles['context-menu-active']]: isContextMenuActive,
          [styles.isSticky]: isSticky,
          'unconfigured-account': account?.kind !== 'Configured',
        })}
        // TODO consider adding `role='tabpanel'` for the main area of the app.
        // Although screen readers might start to announce
        // the account name every time you focus something in the main area,
        // which might be too verbose.
        role='tab'
        aria-selected={isSelected}
        aria-busy={!account && accountFetch.loading}
        onClick={() => onSelectAccount(accountId)}
        onContextMenu={onContextMenu}
        aria-haspopup='menu'
        onMouseEnter={() => account && updateAccountForHoverInfo(account, true)}
        onMouseLeave={() =>
          account && updateAccountForHoverInfo(account, false)
        }
        x-account-sidebar-account-id={accountId}
        data-testid={`account-item-${accountId}`}
        ref={ref}
        tabIndex={rovingTabindex.tabIndex}
        onFocus={rovingTabindex.setAsActiveElement}
        onKeyDown={rovingTabindex.onKeydown}
      >
        {!account ? (
          <div className={styles.avatar}>
            <div className={styles.content}>
              {accountFetch.loading ? '⏳' : '⚠️'}
            </div>
          </div>
        ) : account.kind == 'Configured' ? (
          <div className={styles.avatar}>
            {' '}
            {account.profileImage ? (
              <img
                className={styles.content}
                src={runtime.transformBlobURL(account.profileImage)}
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
      </button>
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
  // Add archived chats to also mark them as read
  uniqueChatIds.add(C.DC_CHAT_ID_ARCHIVED_LINK)

  for (const chatId of uniqueChatIds) {
    await EffectfulBackendActions.marknoticedChat(accountId, chatId)
  }
}
