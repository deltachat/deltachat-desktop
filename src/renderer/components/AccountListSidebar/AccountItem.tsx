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
          <AudioMutedIcon />
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

const AudioMutedIcon = () => (
  <svg width='48' height='48' viewBox='0 0 48 48' version='1.1' id='svg1'>
    <defs id='defs1' />
    <path
      id='path23'
      d='m 41.863724,39.580825 -0.0059,0.0059 -3.435547,-3.457032 c -0.686732,0.816976 -1.443841,1.572333 -2.263671,2.25586 l 3.574218,3.59375 2.269532,-2.257813 z m -0.633255,-0.574966 -0.0059,0.0059 -3.435547,-3.457032 c -0.686732,0.816976 -1.443841,1.572333 -2.263671,2.25586 l 3.574218,3.59375 2.269532,-2.257813 z m -3.441407,-3.451172 c 0.0012,-0.0014 0.0027,-0.0025 0.0039,-0.0039 l -2.837891,-2.855469 c -0.0015,0.0018 -0.0025,0.004 -0.0039,0.0059 z m -2.83789,-2.853515 c 0.0015,-0.0018 0.0025,-0.004 0.0039,-0.0059 l -3.560547,-3.580078 c -0.0013,0.0019 -0.0026,0.0039 -0.0039,0.0059 z m -3.560547,-3.580078 c 0.0013,-0.0019 0.0026,-0.0039 0.0039,-0.0059 L 28,25.701172 v 0.0098 z M 24,21.6875 v -0.0098 l -6.818359,-6.859375 -0.0059,0.0059 z m -6.824219,-6.863281 0.0059,-0.0059 -8.4023441,-8.4492184 -0.00391,0.00391 z m 24.054688,24.18164 -0.0059,0.0059 -3.435547,-3.457032 c -0.686732,0.816976 -1.443841,1.572333 -2.263671,2.25586 l 3.574218,3.59375 2.269532,-2.257813 z m -3.441407,-3.451172 -2.83789,-2.853515 c -0.665874,0.835505 -1.422518,1.593936 -2.259766,2.257812 l 2.833985,2.851563 c 0.81983,-0.683527 1.576939,-1.438884 2.263671,-2.25586 z m -2.83789,-2.853515 -3.560547,-3.580078 c -0.612281,0.879653 -1.376547,1.645717 -2.255859,2.259765 l 3.55664,3.578125 c 0.837248,-0.663876 1.593892,-1.422307 2.259766,-2.257812 z M 31.390625,29.121094 28,25.710937 v 4.529297 l 1.134766,1.140625 c 0.879312,-0.614048 1.643578,-1.380112 2.255859,-2.259765 z M 28,25.710937 24,21.6875 v 4.529297 l 4,4.023437 z M 24,21.6875 17.175781,14.824219 14.917969,17.082031 24,26.216797 Z M 17.175781,14.824219 8.7753906,6.3730469 6.5097656,8.625 14.917969,17.082031 Z M 19.439453,12.560547 24,17.146484 V 8 Z M 28,21.169922 32.779297,25.978516 C 32.922771,25.341765 33,24.680192 33,24 33,20.470004 30.959997,17.419217 28,15.949219 Z m 8.683594,8.736328 2.966797,2.982422 C 41.144517,30.268254 42,27.235724 42,24 42,15.430009 36.009992,8.2809357 28,6.4609375 V 10.589844 C 33.779994,12.309842 38,17.660006 38,24 c 0,2.113123 -0.477303,4.110832 -1.316406,5.90625 z m 4.546875,9.099609 -3.4375,-3.455078 c -0.0012,0.0014 -0.0027,0.0025 -0.0039,0.0039 l 3.435547,3.457032 z M 28,25.710937 v -0.0098 l -4,-4.023438 v 0.0098 z M 14.917969,17.082031 14,18 H 6 v 12 h 8 L 24,40 V 26.216797 Z M 28,30.240234 v 1.820313 c 0.396393,-0.198196 0.774061,-0.427798 1.134766,-0.679688 z m 4.691406,4.71875 C 31.313179,36.051819 29.728298,36.895853 28,37.410156 v 4.128906 c 2.816369,-0.639924 5.381045,-1.940684 7.525391,-3.728515 z'
    />
  </svg>
)
