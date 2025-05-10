import styles from './styles.module.scss'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'

import Gallery from '../../Gallery'
import { useThreeDotMenu } from '../../ThreeDotMenu'
import ChatList from '../../chat/ChatList'
import { Avatar } from '../../Avatar'
import ConnectivityToast from '../../ConnectivityToast'
import MailingListProfile from '../../dialogs/MessageListProfile'
import SettingsStoreInstance, {
  useSettingsStore,
} from '../../../stores/settings'
import { Type } from '../../../backend-com'
import { InlineVerifiedIcon } from '../../VerifiedIcon'
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
import { ChatView } from '../../../contexts/ChatContext'
import { ScreenContext } from '../../../contexts/ScreenContext'

import type { T } from '@deltachat/jsonrpc-client'
import CreateChat from '../../dialogs/CreateChat'

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
  const {
    activeView,
    chatId,
    chatWithLinger,
    alternativeView,
    selectChat,
    unselectChat,
  } = useChat()
  const { smallScreenMode } = useContext(ScreenContext)

  // Small hack/misuse of keyBindingAction to setArchivedChatsSelected from
  // other components (especially ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setArchivedChatsSelected(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setArchivedChatsSelected(false)
  )

  const chatListShouldBeHidden =
    smallScreenMode && (chatId !== undefined || alternativeView !== null)
  const messageSectionShouldBeHidden =
    smallScreenMode && chatId === undefined && alternativeView === null

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

  useEffect(() => {
    // Make sure it uses new version of settings store instance
    SettingsStoreInstance.effect.load()
  }, [])

  const onClickThreeDotMenu = useThreeDotMenu(
    chatWithLinger,
    alternativeView === 'global-gallery' || activeView === ChatView.Media
      ? 'gallery'
      : 'chat'
  )
  const galleryRef = useRef<Gallery | null>(null)

  // @TODO: This could be refactored into a context which knows about the
  // gallery tab state
  const [threeDotMenuHidden, setthreeDotMenuHidden] = useState(false)
  const updatethreeDotMenuHidden = useCallback(() => {
    setthreeDotMenuHidden(
      (alternativeView === 'global-gallery' || activeView === ChatView.Media) &&
        !['images', 'video'].includes(
          galleryRef.current?.state.currentTab || ''
        )
    )
  }, [activeView, alternativeView])
  useEffect(() => {
    updatethreeDotMenuHidden()
  }, [alternativeView, galleryRef, updatethreeDotMenuHidden])

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
              >
                <Icon icon='arrow-left' className='backButtonIcon'></Icon>
              </Button>
            </span>
          )}
          <div
            className={styles.chatNavbarHeadingWrapper}
            data-tauri-drag-region
          >
            {alternativeView === 'global-gallery' && (
              <>
                <div className='navbar-heading' data-tauri-drag-region>
                  {tx('menu_all_media')}
                </div>
                <span className='views' data-tauri-drag-region />
              </>
            )}
            {chatWithLinger && <ChatHeading chat={chatWithLinger} />}
          </div>
          {chatWithLinger && <ChatNavButtons />}
          {(chatWithLinger || alternativeView === 'global-gallery') && (
            <span
              style={{
                marginLeft: 0,
                marginRight: '3px',
                ...(threeDotMenuHidden
                  ? { opacity: 0, pointerEvents: 'none' }
                  : {}),
              }}
              data-no-drag-region
              aria-disabled={threeDotMenuHidden}
            >
              <Button
                id='three-dot-menu-button'
                className='navbar-button'
                aria-label={tx('main_menu')}
                onClick={onClickThreeDotMenu}
              >
                <Icon coloring='navbar' icon='more' rotation={90} size={24} />
              </Button>
            </span>
          )}
        </nav>
        <MessageListView
          accountId={accountId}
          alternativeView={alternativeView}
          galleryRef={galleryRef}
          onUpdateGalleryView={updatethreeDotMenuHidden}
        />
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
    } else if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
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

    if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      openDialog(MailingListProfile, { chat })
    } else if (
      chat.chatType === C.DC_CHAT_TYPE_GROUP ||
      chat.chatType === C.DC_CHAT_TYPE_BROADCAST
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
            {chat.isProtected && <InlineVerifiedIcon />}
            {!chat.isEncrypted && (
              <div className='mail_icon' aria-label={tx('email_address')} />
            )}
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

function ChatNavButtons() {
  const tx = useTranslationFunction()
  const { activeView, setChatView, chatId } = useChat()
  const settingsStore = useSettingsStore()[0]

  return (
    <>
      <span
        role='tablist'
        aria-orientation='horizontal'
        className='views'
        data-no-drag-region
      >
        <Button
          role='tab'
          id='tab-message-list-view'
          onClick={() => setChatView(ChatView.MessageList)}
          active={activeView === ChatView.MessageList}
          aria-selected={activeView === ChatView.MessageList}
          // FYI there are 2 components that use this ID,
          // but they're not supposed to be rendered at the same time.
          aria-controls='message-list-and-composer'
          aria-label={tx('chat')}
          className='navbar-button'
        >
          <Icon coloring='navbar' icon='chats' size={18} />
        </Button>
        <Button
          role='tab'
          id='tab-media-view'
          onClick={() => setChatView(ChatView.Media)}
          active={activeView === ChatView.Media}
          aria-selected={activeView === ChatView.Media}
          aria-controls='media-view'
          aria-label={tx('media')}
          className='navbar-button'
        >
          <Icon coloring='navbar' icon='image' size={18} />
        </Button>
        {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
          // Yes, this is not marked as `role='tab'`.
          // I'm not sure if this is alright.
          <Button
            onClick={() => openMapWebxdc(selectedAccountId(), chatId)}
            aria-label={tx('tab_map')}
            className='navbar-button'
          >
            <Icon coloring='navbar' icon='map' size={18} />
          </Button>
        )}
      </span>
    </>
  )
}
