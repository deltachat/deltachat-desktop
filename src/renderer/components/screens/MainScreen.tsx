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
import {
  useChatStore,
  ChatStoreStateWithChatSet,
  ChatView,
} from '../../stores/chat'
import {
  openViewGroupDialog,
  openViewProfileDialog,
  selectChat,
  setChatView,
  unselectChat,
} from '../helpers/ChatMethods'
import { Avatar } from '../Avatar'
import ConnectivityToast from '../ConnectivityToast'
import MapComponent from '../map/MapComponent'
import MailingListProfile from '../dialogs/MessageListProfile'
import { getLogger } from '../../../shared/logger'
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

const log = getLogger('renderer/main-screen')

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [queryChatId, setQueryChatId] = useState<null | number>(null)
  const [archivedChatsSelected, setArchivedChatsSelected] = useState(false)
  const [chatStoreReady, setChatStoreReady] = useState(false)

  // Small hack/misuse of keyBindingAction to setArchivedChatsSelected from
  // other components (especially ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setArchivedChatsSelected(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setArchivedChatsSelected(false)
  )

  const { openDialog } = useDialog()
  const selectedChat = useChatStore()

  const [alternativeView, setAlternativeView] = useState<
    null | 'global-gallery'
  >(null)
  useEffect(() => {
    if (selectedChat.chat?.id) {
      setAlternativeView(null)
    }
  }, [selectedChat.chat?.id])
  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    unselectChat()
    setAlternativeView('global-gallery')
  })

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
      return setArchivedChatsSelected(true)
    }

    selectChat(chatId)
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
    if (!selectedChat.chat?.archived && archivedChatsSelected) {
      setArchivedChatsSelected(false)
    }
  }, [archivedChatsSelected, selectedChat.chat?.archived])

  const onTitleClick = () => {
    if (!selectedChat.chat) return

    if (selectedChat.chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      openDialog(MailingListProfile, {
        chat: selectedChat.chat,
      })
    } else if (
      selectedChat.chat.chatType === C.DC_CHAT_TYPE_GROUP ||
      selectedChat.chat.chatType === C.DC_CHAT_TYPE_BROADCAST
    ) {
      openViewGroupDialog(openDialog, selectedChat.chat)
    } else {
      if (selectedChat.chat.contactIds && selectedChat.chat.contactIds[0]) {
        openViewProfileDialog(openDialog, selectedChat.chat.contactIds[0])
      }
    }
  }

  window.__chatlistSetSearch = searchChats

  const isFirstLoad = useRef(true)
  if (isFirstLoad.current) {
    isFirstLoad.current = false
    SettingsStoreInstance.effect.load().then(async () => {
      const lastChatId =
        SettingsStoreInstance.getState()?.settings['ui.lastchatid']
      if (lastChatId) {
        await selectChat(Number(lastChatId))
        setChatStoreReady(true)
      }
    })
  }

  const tx = useTranslationFunction()
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
    selectedChat.chat,
    alternativeView === 'global-gallery' ||
      selectedChat?.activeView === ChatView.Media
      ? 'gallery'
      : 'chat'
  )
  const galleryRef = useRef<Gallery | null>(null)

  const [threeDotMenuHidden, setthreeDotMenuHidden] = useState(false)

  const updatethreeDotMenuHidden = useCallback(() => {
    setthreeDotMenuHidden(
      selectedChat?.activeView === ChatView.Map ||
        ((alternativeView === 'global-gallery' ||
          selectedChat?.activeView === ChatView.Media) &&
          !['images', 'video'].includes(
            galleryRef.current?.state.currentTab || ''
          ))
    )
  }, [selectedChat, alternativeView, galleryRef])

  useEffect(() => {
    updatethreeDotMenuHidden()
  }, [
    selectedChat,
    selectedChat?.activeView,
    alternativeView,
    galleryRef,
    updatethreeDotMenuHidden,
  ])

  if (!selectedChat) {
    log.error('selectedChat is undefined')
    return null
  }

  let MessageListView
  if (selectedChat.chat !== null) {
    switch (selectedChat.activeView) {
      case ChatView.Media:
        MessageListView = (
          <Gallery
            ref={galleryRef}
            chatId={selectedChat.chat.id}
            onUpdateView={updatethreeDotMenuHidden}
          />
        )
        break
      case ChatView.Map:
        MessageListView = <MapComponent selectedChat={selectedChat.chat} />
        break
      case ChatView.MessageList:
      default:
        MessageListView = (
          <RecoverableCrashScreen reset_on_change_key={selectedChat.chat.id}>
            <MessageListAndComposer
              chatStore={selectedChat as ChatStoreStateWithChatSet}
            />
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
            {selectedChat.chat && (
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
                  displayName={selectedChat.chat.name}
                  color={selectedChat.chat.color}
                  avatarPath={selectedChat.chat.profileImage || undefined}
                  small
                  wasSeenRecently={selectedChat.chat.wasSeenRecently}
                />
                <div style={{ marginLeft: '7px', overflow: 'hidden' }}>
                  <div className='navbar-chat-name'>
                    <div className='truncated'>{selectedChat.chat.name}</div>
                    <div className='chat_property_icons'>
                      {selectedChat.chat.isProtected && <InlineVerifiedIcon />}
                      {selectedChat.chat.ephemeralTimer !== 0 && (
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
                    {chatSubtitle(selectedChat.chat)}
                  </div>
                </div>
              </NavbarHeading>
            )}
            {selectedChat.chat && (
              <>
                <span className='views no-drag'>
                  <Button
                    onClick={() => setChatView(ChatView.MessageList)}
                    minimal
                    large
                    active={selectedChat.activeView === ChatView.MessageList}
                    // aria-selected={!view}
                    icon={'chat'}
                    aria-label={tx('chat')}
                  />
                  <Button
                    onClick={() => setChatView(ChatView.Media)}
                    minimal
                    large
                    active={selectedChat.activeView === ChatView.Media}
                    // aria-selected={view}
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
                      active={selectedChat.activeView === ChatView.Map}
                      aria-label={tx('tab_map')}
                    />
                  )}
                </span>
              </>
            )}
            {(selectedChat.chat || alternativeView === 'global-gallery') && (
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
          selectedChatId={selectedChat.chat ? selectedChat.chat.id : null}
          queryChatId={queryChatId}
          onExitSearch={() => {
            setQueryStr('')
            setQueryChatId(null)
          }}
        />
        {chatStoreReady && MessageListView}
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
