import styles from './styles.module.scss'
import React, { useCallback, useContext, useId } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import MessageListAndComposer from '../message/MessageListAndComposer'
import NoChatSelected from '../NoChatSelected'
import useChat from '../../hooks/chat/useChat'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { Avatar } from '../Avatar'
import MailingListProfile from '../dialogs/MailingListProfile'
import { useSettingsStore } from '../../stores/settings'
import { BackendRemote } from '../../backend-com'
import Button from '../Button'
import Icon, { IconButton } from '../Icon'
import useDialog from '../../hooks/dialog/useDialog'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../ScreenController'
import { openMapWebxdc } from '../../system-integration/webxdc'
import { ScreenContext } from '../../contexts/ScreenContext'
import MediaView from '../dialogs/MediaView'
import { openWebxdc } from '../message/messageFunctions'

import type { T } from '@deltachat/jsonrpc-client'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { useRpcFetch } from '../../hooks/useFetch'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { useChatContextMenu } from '../chat/ChatContextMenu'
import useContextMenu from '../../hooks/useContextMenu'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import useMessage from '../../hooks/chat/useMessage'
import classNames from 'classnames'

const log = getLogger('ChatView')

export function ChatView({
  accountId,
  lastUsedApps,
  className,
}: {
  accountId: number | undefined
  lastUsedApps: T.Message[]
  className?: string
}) {
  const tx = useTranslationFunction()
  const { chatWithLinger, unselectChat } = useChat()
  const { smallScreenMode } = useContext(ScreenContext)

  return (
    <section
      role='region'
      aria-labelledby='chat-section-heading'
      className={classNames(className, styles.chatAndNavbar)}
    >
      <nav className={styles.chatNavbar} data-tauri-drag-region>
        {smallScreenMode && (
          <span data-no-drag-region>
            <Button
              aria-label={tx('back')}
              onClick={() => unselectChat()}
              className='backButton'
              styling='borderless'
            >
              <Icon icon='arrow-left' className='backButtonIcon'></Icon>
            </Button>
          </span>
        )}
        <div className={styles.chatNavbarHeadingWrapper} data-tauri-drag-region>
          {chatWithLinger && <ChatHeading chat={chatWithLinger} />}
        </div>
        {chatWithLinger && (
          <ChatNavButtons chat={chatWithLinger} lastUsedApps={lastUsedApps} />
        )}
      </nav>
      <MessageListView accountId={accountId} />
    </section>
  )
}

function MessageListView({
  accountId,
}: {
  accountId?: number
}): React.JSX.Element {
  const { chatWithLinger } = useChat()

  if (chatWithLinger && accountId) {
    return (
      <RecoverableCrashScreen reset_on_change_key={chatWithLinger.id}>
        <MessageListAndComposer
          // Note that `key` has not always been here.
          // Some downstream components still try to support variable `chatId`.
          // To name a few:
          // - `hasChatChanged` in `MessageList`.
          // - `useHasChanged2(chatId)` in `Composer`.
          //
          // However, most of that code is about resetting some state,
          // so it probably can be removed.
          // We do not and should actually rely on any kind of cross-chat state.
          key={`${accountId}_${chatWithLinger.id}`}
          accountId={accountId}
          chat={chatWithLinger}
        />
      </RecoverableCrashScreen>
    )
  }

  return <NoChatSelected />
}

/**
 * @param chat
 * @param firstContact The fist contact of chat and null if not loaded */
function chatSubtitle(chat: T.FullChat, firstContact: T.Contact | null) {
  const tx = window.static_translate
  if (chat.id && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
    if (chat.chatType === 'Group') {
      if (chat.contactIds.length > 1 || chat.selfInGroup) {
        return tx('n_members', [String(chat.contactIds.length)], {
          quantity: chat.contactIds.length,
        })
      } else {
        return '…'
      }
    } else if (chat.chatType === 'Single' && firstContact?.isBot) {
      return tx('bot')
    } else if (chat.chatType === 'Mailinglist') {
      if (chat.mailingListAddress) {
        return `${tx('mailing_list')} – ${chat.mailingListAddress}`
      } else {
        return tx('mailing_list')
      }
    } else if (chat.chatType === 'InBroadcast') {
      return tx('channel')
    } else if (chat.chatType === 'OutBroadcast') {
      return tx('n_recipients', [String(chat.contactIds.length)], {
        quantity: chat.contactIds.length,
      })
    } else if (chat.contactIds.length >= 1) {
      if (chat.isSelfTalk) {
        return tx('chat_self_talk_subtitle')
      } else if (chat.isDeviceChat) {
        return tx('device_talk_subtitle')
      }
      if (chat.isEncrypted) {
        return null
      } else {
        return firstContact != null ? firstContact.address : tx('loading')
      }
    }
  }
  return 'ErrTitle'
}

function ChatHeading({ chat }: { chat: T.FullChat }) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const openViewGroupDialog = useOpenViewGroupDialog()
  const openViewProfileDialog = useOpenViewProfileDialog()
  const accountId = selectedAccountId()

  const firstContactId: number | undefined = chat.contactIds[0]
  const firstChatContact = useRpcFetch(
    BackendRemote.rpc.getContact,
    firstContactId ? [accountId, firstContactId] : null
  )

  const onTitleClick = () => {
    if (!chat) {
      return
    }

    if (chat.chatType === 'InBroadcast' || chat.chatType === 'Mailinglist') {
      openDialog(MailingListProfile, {
        chat: chat as T.FullChat & { chatType: 'InBroadcast' | 'Mailinglist' },
        accountId,
      })
    } else if (chat.chatType === 'Group' || chat.chatType === 'OutBroadcast') {
      openViewGroupDialog(
        chat as T.FullChat & { chatType: 'Group' | 'OutBroadcast' }
      )
    } else {
      if (chat.contactIds && chat.contactIds[0]) {
        openViewProfileDialog(accountId, chat.contactIds[0])
      }
    }
  }

  let buttonLabel: string
  switch (chat.chatType) {
    case 'Single': {
      buttonLabel = tx('menu_view_profile')
      break
    }
    case 'Group': {
      // If you're no longer a member, editing the group is not possible,
      // but we don't have a better string.
      buttonLabel = tx('menu_edit_group')
      break
    }
    case 'OutBroadcast': {
      buttonLabel = tx('edit_channel')
      break
    }
    case 'InBroadcast': {
      // We don't have a more appropriate one
      buttonLabel = tx('menu_view_profile')
      break
    }
    case 'Mailinglist': {
      // We don't have a more appropriate one
      buttonLabel = tx('menu_view_profile')
      break
    }
    default: {
      buttonLabel = tx('menu_view_profile')
      log.warn(`Unknown chatType ${chat.chatType}`)
    }
  }

  const subtitle = chatSubtitle(
    chat,
    firstChatContact?.result?.ok ? firstChatContact.result.value : null
  )

  return (
    <div className='navbar-heading' data-no-drag-region>
      <Avatar
        displayName={chat.name}
        color={chat.color}
        avatarPath={chat.profileImage || undefined}
        small
        wasSeenRecently={chat.wasSeenRecently}
        // Avatar is purely decorative here,
        // and is redundant accessibility-wise,
        // because we display the chat name below.
        aria-hidden={true}
      />
      <div style={{ marginInlineStart: '7px', overflow: 'hidden' }}>
        <div className='navbar-chat-name'>
          <h2 id='chat-section-heading' className='truncated'>
            {chat.name}
            <span className='visually-hidden'>
              <br />
              {tx('chat')}
            </span>
          </h2>
          <div className='chat_property_icons'>
            {chat.ephemeralTimer !== 0 && (
              <div
                className={'disapearing-messages-icon'}
                aria-label={tx('a11y_disappearing_messages_activated')}
              />
            )}
          </div>
        </div>
        {subtitle && subtitle.length && (
          <div className='navbar-chat-subtitle'>{subtitle}</div>
        )}
      </div>
      <button
        type='button'
        onClick={onTitleClick}
        aria-label={buttonLabel}
        data-testid='chat-info-button'
        className='navbar-heading-chat-info-button'
      ></button>
    </div>
  )
}

function ChatNavButtons({
  chat,
  lastUsedApps,
}: {
  chat: T.FullChat
  lastUsedApps: T.Message[]
}) {
  const tx = useTranslationFunction()
  const { openMainViewContextMenu } = useChatContextMenu()
  const onClickThreeDotMenu = useCallback(
    (event: React.MouseEvent) => {
      openMainViewContextMenu(event, chat)
    },
    [openMainViewContextMenu, chat]
  )
  const chatId = chat.id
  const settingsStore = useSettingsStore()[0]
  const { openDialog } = useDialog()

  const openMediaViewDialog = useCallback(() => {
    openDialog(MediaView, {
      chatId,
    })
  }, [openDialog, chatId])

  return (
    <div className='views' data-no-drag-region>
      {lastUsedApps && lastUsedApps.length > 0 && (
        <AppIcons accountId={selectedAccountId()} apps={lastUsedApps} />
      )}
      <IconButton
        onClick={openMediaViewDialog}
        aria-label={tx('apps_and_media')}
        title={tx('apps_and_media')}
        className={styles.navbarButton}
        coloring='navbar'
        icon='apps'
        size={18}
      />
      {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
        <IconButton
          onClick={() => openMapWebxdc(selectedAccountId(), chatId)}
          aria-label={tx('tab_map')}
          className={styles.navbarButton}
          title={tx('tab_map')}
          coloring='navbar'
          icon='map'
          size={18}
        />
      )}
      {/* Calls are only implemented on Electron; Tauri and Browser
        runtimes do not implement `startOutgoingVideoCall`. */}
      {runtime.getRuntimeInfo().target === 'electron' &&
        chat.canSend &&
        chat.isEncrypted &&
        // Core only allows placing calls in chats of type "single"
        // (but not e.g. in groups consisting of 2 members).
        // https://github.com/chatmail/core/blob/738dc5ce197f589131479801db2fbd0fb0964599/src/calls.rs#L147
        chat.chatType === 'Single' &&
        chat.contactIds.some(id => id > C.DC_CONTACT_ID_LAST_SPECIAL) && (
          <CallButton chat={chat} />
        )}
      <IconButton
        id='three-dot-menu-button'
        className={styles.navbarButton}
        aria-label={tx('main_menu')}
        onClick={onClickThreeDotMenu}
        coloring='navbar'
        icon='more_vert'
        size={24}
      />
    </div>
  )
}

function AppIcon({ accountId, app }: { accountId: number; app: T.Message }) {
  const tx = useTranslationFunction()
  const { openContextMenu } = useContext(ContextMenuContext)
  const { jumpToMessage } = useMessage()
  const id = useId()

  const webxdcInfoFetch = useRpcFetch(BackendRemote.rpc.getWebxdcInfo, [
    accountId,
    app.id,
  ])
  if (webxdcInfoFetch.result?.ok === false) {
    log.error(
      'Failed to load webxdc info for app:',
      app.id,
      webxdcInfoFetch.result.err
    )
  }

  const appName = webxdcInfoFetch.loading
    ? tx('loading')
    : webxdcInfoFetch.result.ok
      ? // Same as in `WebxdcMessageContent`
        (webxdcInfoFetch.result.value.document
          ? webxdcInfoFetch.result.value.document + '\n'
          : '') + webxdcInfoFetch.result.value.name
      : 'Unknown App'

  return (
    <Button
      id={id}
      styling='borderless'
      key={app.id}
      className={styles.webxdcIconButton}
      title={appName}
      aria-label={appName}
      aria-busy={webxdcInfoFetch.loading}
      onClick={() => {
        openWebxdc(
          app,
          webxdcInfoFetch.result?.ok ? webxdcInfoFetch.result.value : undefined
        )
      }}
      onContextMenu={event => {
        openContextMenu({
          ...mouseEventToPosition(event),
          items: [
            {
              label: tx('show_in_chat'),
              action: () =>
                jumpToMessage({
                  accountId,
                  msgId: app.id,
                  msgChatId: app.chatId,
                  focus: true,
                  scrollIntoViewArg: { block: 'center' },
                }),
            },
          ],
          ariaAttrs: {
            'aria-labelledby': id,
          },
        })
      }}
      aria-haspopup='menu'
    >
      <img
        className={styles.webxdcIcon}
        src={runtime.getWebxdcIconURL(accountId, app.id)}
        alt={appName}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      />
    </Button>
  )
}

function AppIcons({
  accountId,
  apps,
}: {
  accountId: number | undefined
  apps: T.Message[]
}) {
  const tx = useTranslationFunction()

  if (!accountId || !apps || apps.length === 0) {
    return null
  }
  return (
    <section
      role='region'
      aria-label={tx('webxdc_apps')}
      className={styles.webxdcIcons}
      data-testid='last-used-apps'
      data-no-drag-region='true'
    >
      {apps.map(app => (
        <AppIcon key={app.id} accountId={accountId} app={app} />
      ))}
    </section>
  )
}

function CallButton({ chat }: { chat: T.FullChat }) {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const elId = useId()

  const onContextMenu = useContextMenu(
    [
      {
        label: tx('start_audio_call'),
        icon: 'phone',
        action: () => {
          runtime.startOutgoingVideoCall(accountId, chat.id, {
            startWithCameraEnabled: false,
          })
        },
      },
      {
        label: tx('start_video_call'),
        icon: 'camera',
        action: () => {
          runtime.startOutgoingVideoCall(accountId, chat.id, {
            startWithCameraEnabled: true,
          })
        },
      },
    ],
    { 'aria-labelledby': elId }
  )

  return (
    <IconButton
      id={elId}
      aria-label={tx('start_call')}
      title={tx('start_call')}
      className={styles.navbarButton}
      onClick={onContextMenu}
      coloring='navbar'
      icon='phone'
      size={18}
    />
  )
}
