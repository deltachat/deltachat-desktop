import styles from './styles.module.scss'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
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
import { BackendRemote, Type } from '../../../backend-com'
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
  const [lastWebxdcApps, setLastWebxdcApps] = useState<T.Message[]>([])

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

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
      setArchivedChatsSelected(true)
      return
    }

    accountId && selectChat(accountId, chatId)
  }

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

  window.__chatlistSetSearch = searchChats

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

  // Shared function to fetch Webxdc media
  const fetchLastUsedApps = useCallback(async () => {
    const maxIcons = smallScreenMode ? 1 : 3
    if (!accountId || !chatId) {
      return
    }
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

    setLastWebxdcApps(lastUpdatedApps)
  }, [accountId, chatId, smallScreenMode])

  useEffect(() => {
    if (accountId && chatId) {
      fetchLastUsedApps()
    }
  }, [accountId, chatId, fetchLastUsedApps])

  // Listen for Webxdc messages being sent to the current chat
  useWebxdcMessageSentListener(accountId || 0, chatId || 0, () => {
    // Refresh Webxdc apps list when a Webxdc message is sent
    fetchLastUsedApps()
  })

  useEffect(() => {
    // Make sure it uses new version of settings store instance
    SettingsStoreInstance.effect.load()
  }, [])

  const onClickThreeDotMenu = useThreeDotMenu(chatWithLinger)
  const isSearchActive = queryStr.length > 0 || queryChatId !== null
  const showArchivedChats = !isSearchActive && archivedChatsSelected

  return (
    <div
      className={`main-screen ${smallScreenMode ? 'small-screen' : ''} ${
        !messageSectionShouldBeHidden ? 'chat-view-open' : ''
      }`}
    >
      <section className={styles.chatListAndNavbar}>
        <nav className={styles.chatListNavbar} data-tauri-drag-region>
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
              <div className={styles.archivedChatsTitle} data-no-drag-region>
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
        </nav>
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
      <section className={styles.chatAndNavbar}>
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
          {lastWebxdcApps.length > 0 && (
            <AppIcons accountId={accountId} apps={lastWebxdcApps} />
          )}
          {chatWithLinger && <ChatNavButtons chat={chatWithLinger} />}
          {chatWithLinger && (
            <span
              style={{
                marginLeft: 0,
                marginRight: '3px',
              }}
              data-no-drag-region
            >
              <Button
                id='three-dot-menu-button'
                className='navbar-button'
                aria-label={tx('main_menu')}
                onClick={onClickThreeDotMenu}
                styling='borderless'
              >
                <Icon coloring='navbar' icon='more' rotation={90} size={24} />
              </Button>
            </span>
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
    if (chat.chatType === C.DC_CHAT_TYPE_GROUP) {
      return tx('n_members', [String(chat.contactIds.length)], {
        quantity: chat.contactIds.length,
      })
    } else if (
      chat.chatType === C.DC_CHAT_TYPE_SINGLE &&
      chat.contacts[0]?.isBot
    ) {
      return tx('bot')
    } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      if (chat.mailingListAddress) {
        return `${tx('mailing_list')} – ${chat.mailingListAddress}`
      } else {
        return tx('mailing_list')
      }
    } else if (chat.chatType === C.DC_CHAT_TYPE_IN_BROADCAST) {
      return tx('channel')
    } else if (chat.chatType === C.DC_CHAT_TYPE_OUT_BROADCAST) {
      return tx('n_recipients', [String(chat.contactIds.length)], {
        quantity: chat.contactIds.length,
      })
    } else if (chat.contactIds.length >= 1) {
      if (chat.isSelfTalk) {
        return tx('chat_self_talk_subtitle')
      } else if (chat.isDeviceChat) {
        return tx('device_talk_subtitle')
      }
      if (chat.isProtected) {
        return null
      } else {
        return chat.contacts[0].address
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

  const onTitleClick = () => {
    if (!chat) {
      return
    }

    if (
      chat.chatType === C.DC_CHAT_TYPE_IN_BROADCAST ||
      chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST
    ) {
      openDialog(MailingListProfile, { chat })
    } else if (
      chat.chatType === C.DC_CHAT_TYPE_GROUP ||
      chat.chatType === C.DC_CHAT_TYPE_OUT_BROADCAST
    ) {
      openViewGroupDialog(chat)
    } else {
      if (chat.contactIds && chat.contactIds[0]) {
        openViewProfileDialog(accountId, chat.contactIds[0])
      }
    }
  }

  const subtitle = chatSubtitle(chat)

  return (
    <button
      className='navbar-heading navbar-heading--button'
      data-no-drag-region
      onClick={onTitleClick}
      data-testid='chat-info-button'
    >
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
      <div style={{ marginLeft: '7px', overflow: 'hidden' }}>
        <div className='navbar-chat-name'>
          <div className='truncated'>{chat.name}</div>
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
    </button>
  )
}

function ChatNavButtons({ chat }: { chat: T.FullChat }) {
  const tx = useTranslationFunction()
  const { chatId } = useChat()
  const settingsStore = useSettingsStore()[0]
  const { openDialog } = useDialog()

  const openMediaViewDialog = useCallback(() => {
    openDialog(MediaView, {
      chatId: chat.id,
    })
  }, [openDialog, chat])

  return (
    <>
      <span className='views' data-no-drag-region>
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
      </span>
    </>
  )
}

function AppIcon({ accountId, app }: { accountId: number; app: T.Message }) {
  const [webxdcInfo, setWebxdcInfo] = useState<T.WebxdcMessageInfo | null>(null)
  const [isLoadingWebxdcInfo, setIsLoadingWebxdcInfo] = useState(true)

  useEffect(() => {
    if (app.viewType === 'Webxdc') {
      setIsLoadingWebxdcInfo(true)
      BackendRemote.rpc
        .getWebxdcInfo(accountId, app.id)
        .then((info: T.WebxdcMessageInfo) => {
          setWebxdcInfo(info)
        })
        .catch((error: any) => {
          console.error('Failed to load webxdc info for app:', app.id, error)
          setWebxdcInfo(null)
        })
        .finally(() => {
          setIsLoadingWebxdcInfo(false)
        })
    }
  }, [accountId, app.id, app.viewType])

  const appName =
    webxdcInfo?.name || (isLoadingWebxdcInfo ? 'Loading...' : 'Unknown App')

  return (
    <Button
      styling='borderless'
      key={app.id}
      className={styles.webxdcIconButton}
      title={appName}
      aria-label={appName}
      onClick={() => {
        openWebxdc(app, webxdcInfo ?? undefined)
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
  if (!accountId || !apps || apps.length === 0) {
    return null
  }
  return (
    <div
      className={styles.webxdcIcons}
      data-testid='last-used-apps'
      data-no-drag-region='true'
    >
      {apps.map(app => (
        <AppIcon key={app.id} accountId={accountId} app={app} />
      ))}
    </div>
  )
}
