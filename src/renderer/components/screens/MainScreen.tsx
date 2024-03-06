import React, { useState, useRef, useEffect, useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
} from '@blueprintjs/core'

import Gallery from '../Gallery'
import { useThreeDotMenu } from '../ThreeDotMenu'
import ChatList from '../chat/ChatList'
import MessageListAndComposer, {
  getBackgroundImageStyle,
} from '../message/MessageListAndComposer'
import { ChatView } from '../../stores/chat'
import {
  openViewGroupDialog,
  openViewProfileDialog,
} from '../helpers/ChatMethods'
import { Avatar } from '../Avatar'
import ConnectivityToast from '../ConnectivityToast'
import MapComponent from '../map/MapComponent'
import MailingListProfile from '../dialogs/MessageListProfile'
import { RecoverableCrashScreen } from './RecoverableCrashScreen'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { Type } from '../../backend-com'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import SearchInput from '../SearchInput'
import EditProfileDialog from '../dialogs/EditProfileDialog'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import { KeybindAction } from '../../keybindings'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useChat from '../../hooks/useChat'
import { selectedAccountId } from '../../ScreenController'

type AlternativeView = 'global-gallery' | null

export default function MainScreen() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const [queryStr, setQueryStr] = useState('')
  const [queryChatId, setQueryChatId] = useState<null | number>(null)
  const [archivedChatsSelected, setArchivedChatsSelected] = useState(false)
  const {
    accountId,
    activeView,
    chatId,
    chat,
    selectChat,
    unselectChat,
    setChatView,
  } = useChat()

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

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
      setArchivedChatsSelected(true)
      return
    }

    selectChat(selectedAccountId(), chatId)
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
      openViewGroupDialog(openDialog, chat)
    } else {
      if (chat.contactIds && chat.contactIds[0]) {
        openViewProfileDialog(openDialog, chat.contactIds[0])
      }
    }
  }

  window.__chatlistSetSearch = searchChats

  const settingsStore = useSettingsStore()[0]

  useEffect(() => {
    SettingsStoreInstance.effect.load().then(() => {
      // Make sure it uses new version of settings store instance
      const settingsStore = SettingsStoreInstance.state

      // `askForName` flag is set when creating a new account via QR Code (for
      // example chatmail invite code with DCACCOUNT scheme)
      if (settingsStore && window.__askForName) {
        window.__askForName = false
        openDialog(EditProfileDialog, {
          settingsStore,
          firstSetup: true,
        })
      }
    })
  }, [openDialog, tx])

  const searchRef = useRef<HTMLInputElement>(null)

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    handleSearchClear()
  })

  const onClickThreeDotMenu = useThreeDotMenu(
    chat,
    alternativeView === 'global-gallery' || activeView === ChatView.Media
      ? 'gallery'
      : 'chat'
  )
  const galleryRef = useRef<Gallery | null>(null)

  const [threeDotMenuHidden, setthreeDotMenuHidden] = useState(false)

  const updatethreeDotMenuHidden = useCallback(() => {
    setthreeDotMenuHidden(
      activeView === ChatView.Map ||
        ((alternativeView === 'global-gallery' ||
          activeView === ChatView.Media) &&
          !['images', 'video'].includes(
            galleryRef.current?.state.currentTab || ''
          ))
    )
  }, [activeView, alternativeView])

  useEffect(() => {
    updatethreeDotMenuHidden()
  }, [alternativeView, galleryRef, updatethreeDotMenuHidden])

  let MessageListView
  if (chat && accountId) {
    switch (activeView) {
      case ChatView.Media:
        MessageListView = (
          <Gallery
            ref={galleryRef}
            chatId={chat.id}
            onUpdateView={updatethreeDotMenuHidden}
          />
        )
        break
      case ChatView.Map:
        MessageListView = <MapComponent selectedChat={chat} />
        break
      case ChatView.MessageList:
      default:
        MessageListView = (
          <RecoverableCrashScreen reset_on_change_key={chat.id}>
            <MessageListAndComposer accountId={accountId} chat={chat} />
          </RecoverableCrashScreen>
        )
    }
  } else if (alternativeView === 'global-gallery') {
    MessageListView = (
      <Gallery
        chatId={'all'}
        ref={galleryRef}
        onUpdateView={updatethreeDotMenuHidden}
      />
    )
  } else {
    const style: React.CSSProperties = settingsStore
      ? getBackgroundImageStyle(settingsStore.desktopSettings)
      : {}

    MessageListView = (
      <div className='message-list-and-composer' style={style}>
        <div
          className='message-list-and-composer__message-list'
          style={{ display: 'flex' }}
        >
          <div className='info-message big' style={{ alignSelf: 'center' }}>
            <div className='bubble'>
              {tx('no_chat_selected_suggestion_desktop')}
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                <Button
                  className={[
                    Classes.MINIMAL,
                    'icon-rotated',
                    'archived-chats-return-button',
                    'no-drag',
                  ].join(' ')}
                  icon='undo'
                  onClick={() => setArchivedChatsSelected(false)}
                  aria-label={tx('back')}
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
            {alternativeView === 'global-gallery' && (
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
            )}
            {chat && (
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
                          aria-label={tx(
                            'a11y_disappearing_messages_activated'
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <div className='navbar-chat-subtile'>
                    {chatSubtitle(chat)}
                  </div>
                </div>
              </NavbarHeading>
            )}
            {chat && (
              <>
                <span className='views no-drag'>
                  <Button
                    onClick={() => setChatView(ChatView.MessageList)}
                    minimal
                    large
                    active={activeView === ChatView.MessageList}
                    icon={'chat'}
                    aria-label={tx('chat')}
                  />
                  <Button
                    onClick={() => setChatView(ChatView.Media)}
                    minimal
                    large
                    active={activeView === ChatView.Media}
                    icon={'media'}
                    aria-label={tx('media')}
                  />
                  {settingsStore?.desktopSettings
                    .enableOnDemandLocationStreaming && (
                    <Button
                      minimal
                      large
                      icon='map'
                      onClick={() => setChatView(ChatView.Map)}
                      active={activeView === ChatView.Map}
                      aria-label={tx('tab_map')}
                    />
                  )}
                </span>
              </>
            )}
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
                  className='icon-rotated'
                  minimal
                  icon='more'
                  id='three-dot-menu-button'
                  aria-label={tx('main_menu')}
                  onClick={onClickThreeDotMenu}
                />
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
        {MessageListView}
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
