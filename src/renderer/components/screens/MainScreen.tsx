import React, { useState, useContext, useRef, useEffect } from 'react'
import { ScreenContext, useTranslationFunction } from '../../contexts'

import Gallery from '../Gallery'
import { useThreeDotMenu } from '../ThreeDotMenu'
import ChatList from '../chat/ChatList'
import MessageListAndComposer, {
  getBackgroundImageStyle,
} from '../message/MessageListAndComposer'
import SearchInput from '../SearchInput'
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

import {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
  Icon,
} from '@blueprintjs/core'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import { Avatar } from '../Avatar'
import ConnectivityToast from '../ConnectivityToast'
import { C } from '@deltachat/jsonrpc-client'
import MapComponent from '../map/MapComponent'
import MailingListProfile from '../dialogs/MessageListProfile'
import { getLogger } from '../../../shared/logger'
import { RecoverableCrashScreen } from './RecoverableCrashScreen'
import Sidebar, { SidebarState } from '../Sidebar'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { Type } from '../../backend-com'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import { SettingsProfileDialog } from '../dialogs/Settings-Profile'

const log = getLogger('renderer/main-screen')

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [queryChatId, setQueryChatId] = useState<null | number>(null)
  const [sidebarState, setSidebarState] = useState<SidebarState>('init')
  const [showArchivedChats, setShowArchivedChats] = useState(false)
  // Small hack/misuse of keyBindingAction to setShowArchivedChats from other components (especially
  // ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setShowArchivedChats(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setShowArchivedChats(false)
  )

  const screenContext = useContext(ScreenContext)
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
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return setShowArchivedChats(true)

    selectChat(chatId)
  }
  const searchChats = (queryStr: string, chatId: number | null = null) => {
    setQueryStr(queryStr)
    setQueryChatId(chatId)
  }
  const handleSearchChange = (event: { target: { value: string } }) => {
    setQueryStr(event.target.value)
  }
  const onTitleClick = () => {
    if (!selectedChat.chat) return

    if (selectedChat.chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      screenContext.openDialog(MailingListProfile, {
        chat: selectedChat.chat,
      })
    } else if (
      selectedChat.chat.chatType === C.DC_CHAT_TYPE_GROUP ||
      selectedChat.chat.chatType === C.DC_CHAT_TYPE_BROADCAST
    ) {
      openViewGroupDialog(screenContext, selectedChat.chat)
    } else {
      if (selectedChat.chat.contactIds && selectedChat.chat.contactIds[0]) {
        openViewProfileDialog(screenContext, selectedChat.chat.contactIds[0])
      }
    }
  }

  window.__chatlistSetSearch = searchChats

  const isFirstLoad = useRef(true)
  if (isFirstLoad.current) {
    isFirstLoad.current = false
    SettingsStoreInstance.effect.load().then(() => {
      const lastChatId = SettingsStoreInstance.getState()?.settings[
        'ui.lastchatid'
      ]
      if (lastChatId) {
        selectChat(Number(lastChatId))
      }
    })
  }

  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  useEffect(() => {
    SettingsStoreInstance.effect.load().then(() => {
      // make sure it uses new version of settings store instance
      const settingsStore = SettingsStoreInstance.state
      if (settingsStore && window.__askForName) {
        window.__askForName = false
        screenContext.openDialog(SettingsProfileDialog, {
          settingsStore,
          title: 'Account setup',
          confirmLabel: tx('ok'),
          cancelLabel: tx('later'),
          firstSetup: true,
        })
      }
    })
  }, [screenContext, tx])

  const searchRef = useRef<HTMLInputElement>(null)

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    if (!searchRef.current) {
      return
    }
    searchRef.current.value = ''
    searchChats('')
    setQueryChatId(null)
  })
  const onClickThreeDotMenu = useThreeDotMenu(selectedChat.chat)

  if (!selectedChat) {
    log.error('selectedChat is undefined')
    return null
  }

  let MessageListView
  if (selectedChat.chat !== null) {
    switch (selectedChat.activeView) {
      case ChatView.Media:
        MessageListView = <Gallery chatId={selectedChat.chat.id} />
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
    MessageListView = <Gallery chatId={'all'} />
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

  // StandardJS won't let me use '&& { } || { }', so the following code
  // compares with showArchivedChats twice.
  return (
    <div className='main-screen'>
      <div className='navbar-wrapper'>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <div
              className='sidebar-icon'
              onClick={() => setSidebarState('visible')}
              id='hamburger-menu-button'
            >
              <Icon icon='menu' aria-label={tx('main_menu')} iconSize={20} />
            </div>
            {queryStr.length === 0 && showArchivedChats && (
              <>
                <div className='archived-chats-title'>
                  {tx('chat_archived_chats_title')}
                </div>
                <Button
                  className={[
                    Classes.MINIMAL,
                    'icon-rotated',
                    'archived-chats-return-button',
                  ].join(' ')}
                  icon='undo'
                  onClick={() => setShowArchivedChats(false)}
                  aria-label={tx('back')}
                />
              </>
            )}
            {(showArchivedChats && queryStr.length === 0) || (
              <SearchInput
                id='chat-list-search'
                onChange={handleSearchChange}
                value={queryStr}
                className='icon-rotated'
                inputRef={searchRef}
              />
            )}
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            {alternativeView === 'global-gallery' && (
              <NavbarHeading
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
                onClick={onTitleClick}
              >
                {tx('menu_all_media')}
              </NavbarHeading>
            )}
            {selectedChat.chat && (
              <NavbarHeading
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
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
                    {selectedChat.chat.name}
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
                <span className='views'>
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
                <span
                  style={{
                    marginLeft: 0,
                    marginRight: '3px',
                  }}
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
              </>
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
        {MessageListView}
      </div>
      <Sidebar sidebarState={sidebarState} setSidebarState={setSidebarState} />
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
      return chat.contacts[0].address
    }
  }
  return 'ErrTitle'
}
