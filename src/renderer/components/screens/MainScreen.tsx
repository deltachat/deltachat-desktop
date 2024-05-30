import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
} from '@blueprintjs/core'

import Gallery from '../Gallery'
import { useThreeDotMenu } from '../ThreeDotMenu'
import ChatList from '../chat/ChatList'
import { Avatar } from '../Avatar'
import ConnectivityToast from '../ConnectivityToast'
import MailingListProfile from '../dialogs/MessageListProfile'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { Type } from '../../backend-com'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import Button from '../Button'
import Icon from '../Icon'
import SearchInput from '../SearchInput'
import MessageListView from '../MessageListView'
import useChat from '../../hooks/chat/useChat'
import useDialog from '../../hooks/dialog/useDialog'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import useOpenViewGroupDialog from '../../hooks/dialog/useOpenViewGroupDialog'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import useSelectLastChat from '../../hooks/chat/useSelectLastChat'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ChatView } from '../../contexts/ChatContext'
import { KeybindAction } from '../../keybindings'
import { selectedAccountId } from '../../ScreenController'
import { openMapWebxdc } from '../../system-integration/webxdc'

import type { T } from '@deltachat/jsonrpc-client'
import SearchInputButton from '../SearchInput/SearchInputButton'

export type AlternativeView = 'global-gallery' | null

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
  const { activeView, chatId, chat, selectChat, unselectChat } = useChat()

  // Small hack/misuse of keyBindingAction to setArchivedChatsSelected from
  // other components (especially ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setArchivedChatsSelected(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setArchivedChatsSelected(false)
  )

  const [alternativeView, setAlternativeView] = useState<AlternativeView>(null)
  useEffect(() => {
    if (chatId) {
      setAlternativeView(null)
    }
  }, [chatId])
  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    unselectChat()
    setAlternativeView('global-gallery')
  })
  useKeyBindingAction(KeybindAction.GlobalMap_Open, () => {
    unselectChat()
    openMapWebxdc()
  })

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
      setArchivedChatsSelected(true)
      return
    }

    accountId && selectChat(accountId, chatId)
  }

  const searchChats = (queryStr: string, chatId: number | null = null) => {
    setQueryStr(queryStr)
    setQueryChatId(chatId)
  }

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
    if (!chat?.archived && archivedChatsSelected) {
      setArchivedChatsSelected(false)
    }
  }, [archivedChatsSelected, chat?.archived])

  window.__chatlistSetSearch = searchChats

  const searchRef = useRef<HTMLInputElement>(null)

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    handleSearchClear()
  })

  useEffect(() => {
    // Make sure it uses new version of settings store instance
    SettingsStoreInstance.effect.load()
  }, [])

  const onClickThreeDotMenu = useThreeDotMenu(
    chat,
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
    <div className='main-screen'>
      <div className='navbar-wrapper'>
        <Navbar>
          <NavbarGroup align={Alignment.LEFT}>
            {showArchivedChats && (
              <>
                <div className='archived-chats-title no-drag'>
                  {tx('chat_archived_chats_title')}
                </div>
                {/* reusing SearchInputButton here so that the button has the same style as the qr code button */}
                <SearchInputButton
                  className='no-drag'
                  onClick={() => setArchivedChatsSelected(false)}
                  aria-label={tx('back')}
                  icon='undo'
                />
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
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            {alternativeView === 'global-gallery' && <GlobalGalleryHeading />}
            {chat && <ChatHeading chat={chat} />}
            {chat && <ChatNavButtons />}
            {(chat || alternativeView === 'global-gallery') && (
              <span
                style={{
                  marginLeft: 0,
                  marginRight: '3px',
                  ...(threeDotMenuHidden
                    ? { opacity: 0.4, pointerEvents: 'none' }
                    : {}),
                }}
                className='no-drag'
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
          </NavbarGroup>
        </Navbar>
      </div>
      <div>
        <ChatList
          queryStr={queryStr}
          showArchivedChats={showArchivedChats}
          onChatClick={onChatClick}
          selectedChatId={chat ? chat.id : null}
          queryChatId={queryChatId}
          onExitSearch={() => {
            setQueryStr('')
            setQueryChatId(null)
          }}
        />
        <MessageListView
          accountId={accountId}
          alternativeView={alternativeView}
          galleryRef={galleryRef}
          onUpdateGalleryView={updatethreeDotMenuHidden}
        />
      </div>
      <ConnectivityToast />
    </div>
  )
}

function chatSubtitle(chat: Type.FullChat) {
  const tx = window.static_translate
  if (chat.id && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
    if (chat.chatType === C.DC_CHAT_TYPE_GROUP) {
      return tx('n_members', [String(chat.contacts.length)], {
        quantity: chat.contacts.length,
      })
    } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      if (chat.mailingListAddress) {
        return `${tx('mailing_list')} – ${chat.mailingListAddress}`
      } else {
        return tx('mailing_list')
      }
    } else if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
      return tx('n_recipients', [String(chat.contacts.length)], {
        quantity: chat.contacts.length,
      })
    } else if (chat.contacts.length >= 1) {
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

function GlobalGalleryHeading() {
  const tx = useTranslationFunction()

  return (
    <>
      <NavbarHeading
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {tx('menu_all_media')}
      </NavbarHeading>
      <span className='views' />
    </>
  )
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

  return (
    <NavbarHeading
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
      className='no-drag'
      onClick={onTitleClick}
    >
      <Avatar
        displayName={chat.name}
        color={chat.color}
        avatarPath={chat.profileImage || undefined}
        small
        wasSeenRecently={chat.wasSeenRecently}
      />
      <div style={{ marginLeft: '7px', overflow: 'hidden' }}>
        <div className='navbar-chat-name'>
          <div className='truncated'>{chat.name}</div>
          <div className='chat_property_icons'>
            {chat.isProtected && <InlineVerifiedIcon />}
            {chat.ephemeralTimer !== 0 && (
              <div
                className={'disapearing-messages-icon'}
                aria-label={tx('a11y_disappearing_messages_activated')}
              />
            )}
          </div>
        </div>
        <div className='navbar-chat-subtile'>{chatSubtitle(chat)}</div>
      </div>
    </NavbarHeading>
  )
}

function ChatNavButtons() {
  const tx = useTranslationFunction()
  const { activeView, setChatView, chatId } = useChat()
  const settingsStore = useSettingsStore()[0]

  return (
    <>
      <span className='views no-drag'>
        <Button
          onClick={() => setChatView(ChatView.MessageList)}
          active={activeView === ChatView.MessageList}
          aria-label={tx('chat')}
          className='navbar-button'
        >
          <Icon coloring='navbar' icon='chats' size={18} />
        </Button>
        <Button
          onClick={() => setChatView(ChatView.Media)}
          active={activeView === ChatView.Media}
          aria-label={tx('media')}
          className='navbar-button'
        >
          <Icon coloring='navbar' icon='image' size={18} />
        </Button>
        {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
          <Button
            onClick={() => openMapWebxdc(chatId)}
            active={activeView === ChatView.Map}
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
