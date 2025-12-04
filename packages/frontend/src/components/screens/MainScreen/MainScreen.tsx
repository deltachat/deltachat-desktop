import styles from './styles.module.scss'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { useThreeDotMenu } from '../../ThreeDotMenu'
import ChatList from '../../chat/ChatList'
import { Avatar } from '../../Avatar'
import ConnectivityToast from '../../ConnectivityToast'
import MailingListProfile from '../../dialogs/MailingListProfile'
import SettingsStoreInstance, {
  useSettingsStore,
} from '../../../stores/settings'
import { BackendRemote, onDCEvent, Type } from '../../../backend-com'
import Button from '../../Button'
import Icon from '../../Icon'
import SearchInput from '../../SearchInput'
import MessageListView from '../../MessageListView'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useKeyBindingAction from '../../../hooks/useKeyBindingAction'
import useOpenViewGroupDialog from '../../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../../hooks/dialog/useOpenViewProfileDialog'
import useSelectLastChat from '../../../hooks/chat/useSelectLastChat'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { KeybindAction } from '../../../keybindings'
import { selectedAccountId } from '../../../ScreenController'
import { openMapWebxdc } from '../../../system-integration/webxdc'
import { ScreenContext } from '../../../contexts/ScreenContext'
import MediaView from '../../dialogs/MediaView'
import { openWebxdc } from '../../message/messageFunctions'
import { useWebxdcMessageSentListener } from '../../../hooks/useWebxdcMessageSent'

import type { T } from '@deltachat/jsonrpc-client'
import CreateChat from '../../dialogs/CreateChat'
import { runtime } from '@deltachat-desktop/runtime-interface'
import asyncThrottle from '@jcoreio/async-throttle'
import { useFetch, useRpcFetch } from '../../../hooks/useFetch'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('MainScreen')

type Props = {
  accountId?: number
}

export default function MainScreen({ accountId }: Props) {
  // Automatically select last known chat when account changed
  useSelectLastChat(accountId)

  const tx = useTranslationFunction()

  const [queryStr, setQueryStr] = useState('')
  const [queryChatId, setQueryChatId] = useState<null | number>(null)
  const [archivedChatsSelected, setArchivedChatsSelected] = useState(false)
  const { chatId, chatWithLinger, selectChat, unselectChat } = useChat()
  const { smallScreenMode } = useContext(ScreenContext)

  // Small hack/misuse of keyBindingAction to setArchivedChatsSelected from
  // other components (especially ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setArchivedChatsSelected(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setArchivedChatsSelected(false)
  )

  const chatListShouldBeHidden = smallScreenMode && chatId !== undefined
  const messageSectionShouldBeHidden = smallScreenMode && chatId === undefined

  const onBackButton = () => {
    unselectChat()
  }

  const onChatClick = useCallback(
    (chatId: number) => {
      if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
        setArchivedChatsSelected(true)
        return
      }

      accountId && selectChat(accountId, chatId)
    },
    [accountId, selectChat]
  )

  const searchChats = useCallback(
    (queryStr: string, chatId: number | null = null) => {
      if (smallScreenMode) {
        unselectChat()
      }
      setQueryStr(queryStr)
      setQueryChatId(chatId)
    },
    [smallScreenMode, unselectChat]
  )

  const handleSearchChange = (event: { target: { value: string } }) => {
    setQueryStr(event.target.value)
  }

  const handleSearchClear = useCallback(() => {
    if (!searchRef.current) {
      return
    }

    searchRef.current.value = ''
    searchChats('')
    setQueryChatId(null)

    // If we've searched a non-archive chat while being in archive mode
    // previously we want to get back to normal mode after cancelling
    if (!chatWithLinger?.archived && archivedChatsSelected) {
      setArchivedChatsSelected(false)
    }
  }, [archivedChatsSelected, chatWithLinger?.archived, searchChats])

  useEffect(() => {
    window.__chatlistSetSearch = searchChats
  }, [searchChats])

  const searchRef = useRef<HTMLInputElement>(null)

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_SearchInChat, () => {
    // Also see `search_in_chat` item in ThreeDotMenu.tsx
    searchRef.current?.focus()
    if (chatId == undefined) {
      return
    }
    // Yes, preserve the search string. This might be nice.
    searchChats(queryStr, chatId)
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    handleSearchClear()
  })

  const { openDialog } = useDialog()
  useKeyBindingAction(KeybindAction.NewChat_Open, () => {
    // Same as `onCreateChat` in ChatList.
    openDialog(CreateChat)
  })

  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    openDialog(MediaView, {
      chatId: 'all',
    })
  })

  // Throttle in case the user switches chats very rapidly,
  // e.g. by holding down Ctrl + PageDown.
  //
  // TODO a debounce would probably be more appropriate here,
  // given that the operation is relatively expensive,
  // but I haven't looked for an `asyncDebounce` function.
  const throttledFetchLastUsedApps = useMemo(
    () =>
      asyncThrottle(
        async (accountId: number, chatId: number, smallScreenMode: boolean) => {
          const maxIcons = smallScreenMode ? 1 : 3
          const mediaIds = await BackendRemote.rpc.getChatMedia(
            accountId,
            chatId,
            'Webxdc',
            null,
            null
          )
          // mediaIds holds the ids of the last updated apps,
          // in reverse order
          mediaIds.reverse()
          const firstFew = mediaIds.slice(0, maxIcons)

          // TODO perf: if the current throttled fetch was canceled
          // before the next line got executed, we could bail here.
          const mediaLoadResult = await BackendRemote.rpc.getMessages(
            accountId,
            firstFew
          )
          const lastUpdatedApps = firstFew
            .map((id: number) => {
              if (mediaLoadResult[id]?.kind === 'message') {
                return mediaLoadResult[id]
              }
              return null
            })
            .filter(app => app !== null)

          return lastUpdatedApps
        },
        50
      ),
    []
  )
  const lastUsedAppsFetch = useFetch(
    throttledFetchLastUsedApps,
    accountId != undefined && chatId != undefined
      ? [accountId, chatId, smallScreenMode]
      : null
  )
  if (lastUsedAppsFetch?.result?.ok === false) {
    log.error('Failed to fetch last used apps', lastUsedAppsFetch.result.err)
  }

  // Listen for Webxdc messages being sent to the current chat
  useWebxdcMessageSentListener(accountId || 0, chatId || 0, () => {
    // Refresh Webxdc apps list when a Webxdc message is sent
    lastUsedAppsFetch?.refresh()
  })

  useEffect(() => {
    if (!accountId) {
      return
    }
    return onDCEvent(accountId, 'WebxdcInstanceDeleted', () => {
      lastUsedAppsFetch?.refresh()
    })
  }, [accountId, lastUsedAppsFetch])

  useEffect(() => {
    // Make sure it uses new version of settings store instance
    SettingsStoreInstance.effect.load()
  }, [])

  const isSearchActive = queryStr.length > 0 || queryChatId !== null
  const showArchivedChats = !isSearchActive && archivedChatsSelected

  const lastUsedApps =
    lastUsedAppsFetch?.result?.ok && lastUsedAppsFetch.result.value.length > 0
      ? lastUsedAppsFetch.result.value
      : []

  return (
    <div
      className={`main-screen ${smallScreenMode ? 'small-screen' : ''} ${
        !messageSectionShouldBeHidden ? 'chat-view-open' : ''
      }`}
    >
      <section
        className={styles.chatListAndHeader}
        role='region'
        // TODO a11y: reconsider whether it's OK to use the "Chats" label
        // even when we're searching for messages in one particular chat
        // (`queryChatId`), and even despite the fact
        // that search results, besides chats,
        // also include messages and contacts.
        // For the former, perhaps one could argue that `queryChatId`
        // is just a part of the search query.
        //
        // TODO a11y: perhaps `pref_` is not nice, we might need
        // a separate string.
        // The same goes for other occurrences of `tx('pref_chats')`.
        aria-label={tx('pref_chats')}
      >
        <section className={styles.chatListHeader} data-tauri-drag-region>
          {showArchivedChats && (
            <>
              <span data-no-drag-region>
                <Button
                  aria-label={tx('back')}
                  onClick={() => setArchivedChatsSelected(false)}
                  className='backButton'
                  styling='borderless'
                >
                  <Icon icon='arrow-left' className='backButtonIcon'></Icon>
                </Button>
              </span>
              <div className={styles.archivedChatsTitle}>
                {tx('chat_archived_chats_title')}
              </div>
            </>
          )}
          {!showArchivedChats && (
            <SearchInput
              id='chat-list-search'
              inputRef={searchRef}
              onChange={handleSearchChange}
              onClear={queryChatId ? () => handleSearchClear() : undefined}
              value={queryStr}
            />
          )}
        </section>
        <ChatList
          queryStr={queryStr}
          showArchivedChats={showArchivedChats}
          onChatClick={onChatClick}
          selectedChatId={chatId ?? null}
          queryChatId={queryChatId}
          onExitSearch={() => {
            setQueryStr('')
            setQueryChatId(null)
          }}
        />
      </section>
      <section
        role='region'
        aria-labelledby='chat-section-heading'
        className={styles.chatAndNavbar}
      >
        <nav className={styles.chatNavbar} data-tauri-drag-region>
          {smallScreenMode && (
            <span data-no-drag-region>
              <Button
                aria-label={tx('back')}
                onClick={onBackButton}
                className='backButton'
                styling='borderless'
              >
                <Icon icon='arrow-left' className='backButtonIcon'></Icon>
              </Button>
            </span>
          )}
          <div
            className={styles.chatNavbarHeadingWrapper}
            data-tauri-drag-region
          >
            {chatWithLinger && <ChatHeading chat={chatWithLinger} />}
          </div>
          {chatWithLinger && (
            <ChatNavButtons chat={chatWithLinger} lastUsedApps={lastUsedApps} />
          )}
        </nav>
        <MessageListView accountId={accountId} />
      </section>
      {!chatListShouldBeHidden && <ConnectivityToast />}
    </div>
  )
}

function chatSubtitle(chat: Type.FullChat) {
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
    } else if (chat.chatType === 'Single' && chat.contacts[0]?.isBot) {
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
      return chat.isEncrypted ? null : chat.contacts[0].address
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

  const onTitleClick = () => {
    if (!chat) {
      return
    }

    if (chat.chatType === 'InBroadcast' || chat.chatType === 'Mailinglist') {
      openDialog(MailingListProfile, {
        chat: chat as T.FullChat & { chatType: 'InBroadcast' | 'Mailinglist' },
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

  const subtitle = chatSubtitle(chat)

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
  const onClickThreeDotMenu = useThreeDotMenu(chat)
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
      <Button
        onClick={openMediaViewDialog}
        aria-label={tx('apps_and_media')}
        title={tx('apps_and_media')}
        className='navbar-button'
        styling='borderless'
      >
        <Icon coloring='navbar' icon='apps' size={18} />
      </Button>
      {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
        <Button
          onClick={() => openMapWebxdc(selectedAccountId(), chatId)}
          aria-label={tx('tab_map')}
          className='navbar-button'
          styling='borderless'
          title={tx('tab_map')}
        >
          <Icon coloring='navbar' icon='map' size={18} />
        </Button>
      )}
      {/* Note that the `enableAVCallsV2` setting itself is hidden
        on unsupported targets (Tauri, Browser). */}
      {settingsStore?.desktopSettings.enableAVCallsV2 &&
        chat.canSend &&
        chat.isEncrypted &&
        // Core only allows placing calls in chats of type "single"
        // (but not e.g. in groups consisting of 2 members).
        // https://github.com/chatmail/core/blob/738dc5ce197f589131479801db2fbd0fb0964599/src/calls.rs#L147
        chat.chatType === 'Single' &&
        chat.contactIds.some(id => id > C.DC_CONTACT_ID_LAST_SPECIAL) && (
          <Button
            aria-label={tx('start_call')}
            title={tx('start_call')}
            className='navbar-button'
            styling='borderless'
            onClick={() => {
              runtime.startOutgoingVideoCall(selectedAccountId(), chat.id)
            }}
          >
            <Icon coloring='navbar' icon='phone' size={18} />
          </Button>
        )}
      <Button
        id='three-dot-menu-button'
        className='navbar-button'
        aria-label={tx('main_menu')}
        onClick={onClickThreeDotMenu}
        styling='borderless'
      >
        <Icon coloring='navbar' icon='more' className='rotate90' size={24} />
      </Button>
    </div>
  )
}

function AppIcon({ accountId, app }: { accountId: number; app: T.Message }) {
  const tx = useTranslationFunction()

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
      ? webxdcInfoFetch.result.value.name
      : 'Unknown App'

  return (
    <Button
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
