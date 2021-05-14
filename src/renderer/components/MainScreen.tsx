import React, { useState, useContext, useRef } from 'react'
import {
  ScreenContext,
  SettingsContext,
  useTranslationFunction,
} from '../contexts'

import Gallery from './Gallery'
import Menu from './Menu'
import ChatList from './chat/ChatList'
import MessageListAndComposer from './message/MessageListAndComposer'
import SearchInput from './SearchInput'
import { useChatStore } from '../stores/chat'
import {
  openEditGroupDialog,
  openViewProfileDialog,
} from './helpers/ChatMethods'

import {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Position,
  Popover,
  Button,
} from '@blueprintjs/core'
import { getLastSelectedChatId } from '../ipc'
import { useKeyBindingAction, KeybindAction } from '../keybindings'
import { Avatar } from './Avatar'
import OfflineToast from './OfflineToast'
import { C } from 'deltachat-node/dist/constants'
import MapComponent from './map/MapComponent'
import MessageListProfile from './dialogs/MessageListProfile'

enum View {
  MessageList,
  Media,
  Map,
}

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [view, setView] = useState(View.MessageList)
  const [showArchivedChats, setShowArchivedChats] = useState(null)
  // Small hack/misuse of keyBindingAction to setShowArchivedChats from other components (especially
  // ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setShowArchivedChats(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setShowArchivedChats(false)
  )

  const screenContext = useContext(ScreenContext)
  const [selectedChat, chatStoreDispatch] = useChatStore()

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return setShowArchivedChats(true)
    // avoid double clicks
    if (chatId === selectedChat.id) return

    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    setView(View.MessageList)
  }
  const searchChats = (queryStr: string) => setQueryStr(queryStr)
  const handleSearchChange = (event: { target: { value: '' } }) =>
    searchChats(event.target.value)
  const onTitleClick = () => {
    if (!selectedChat) return

    if (selectedChat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
      screenContext.openDialog(MessageListProfile, {
        chat: selectedChat,
      })
    } else if (selectedChat.isGroup) {
      openEditGroupDialog(screenContext, selectedChat)
    } else {
      openViewProfileDialog(screenContext, selectedChat.contacts[0].id)
    }
  }

  const [isFirstLoad, setFirstLoad] = useState(true)
  if (isFirstLoad) {
    setFirstLoad(false)
    const lastChatId = getLastSelectedChatId()
    if (lastChatId) {
      chatStoreDispatch({ type: 'SELECT_CHAT', payload: lastChatId })
    }
  }

  const tx = useTranslationFunction()

  const menu = <Menu selectedChat={selectedChat} />
  let MessageListView
  if (selectedChat.id !== null) {
    switch (view) {
      case View.Media:
        MessageListView = <Gallery chat={selectedChat} />
        break
      case View.Map:
        MessageListView = <MapComponent selectedChat={selectedChat} />
        break
      case View.MessageList:
      default:
        MessageListView = <MessageListAndComposer chat={selectedChat} />
    }
  } else {
    MessageListView = (
      <div className='no-chat-selected-screen'>
        <h2>{tx('no_chat_selected_suggestion_desktop')}</h2>
      </div>
    )
  }

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
  })

  // StandardJS won't let me use '&& { } || { }', so the following code
  // compares with showArchivedChats twice.
  return (
    <div className='main-screen'>
      <div className='navbar-wrapper'>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
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
            {selectedChat && selectedChat.id && (
              <NavbarHeading
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
                onClick={onTitleClick}
              >
                {selectedChat && (
                  <Avatar
                    displayName={selectedChat.name}
                    color={selectedChat.color}
                    isVerified={selectedChat.isProtected}
                    avatarPath={selectedChat.profileImage}
                    small
                  />
                )}
                <div style={{ marginLeft: '7px' }}>
                  <div className='navbar-chat-name'>
                    {selectedChat.name}
                    {selectedChat.ephemeralTimer !== 0 && (
                      <div
                        className={'disapearing-messages-icon'}
                        aria-label={tx('a11y_disappearing_messages_activated')}
                      />
                    )}
                  </div>
                  <div className='navbar-chat-subtile'>
                    {selectedChat.subtitle}
                  </div>
                </div>
              </NavbarHeading>
            )}
            {selectedChat && selectedChat.id && (
              <span className='views'>
                <Button
                  onClick={() => setView(View.MessageList)}
                  minimal
                  large
                  active={view === View.MessageList}
                  // aria-selected={!view}
                  icon={'chat'}
                  aria-label={tx('chat')}
                />
                <Button
                  onClick={() => setView(View.Media)}
                  minimal
                  large
                  active={view === View.Media}
                  // aria-selected={view}
                  icon={'media'}
                  aria-label={tx('media')}
                />
                <SettingsContext.Consumer>
                  {({ desktopSettings }) =>
                    desktopSettings.enableOnDemandLocationStreaming && (
                      <Button
                        minimal
                        large
                        icon='map'
                        onClick={() => setView(View.Map)}
                        active={view === View.Map}
                        aria-label={tx('tab_map')}
                      />
                    )
                  }
                </SettingsContext.Consumer>
              </span>
            )}
            <span
              style={{
                marginLeft: selectedChat && selectedChat.id ? 0 : 'auto',
              }}
            >
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button
                  className='icon-rotated'
                  minimal
                  icon='more'
                  id='main-menu-button'
                  aria-label={tx('main_menu')}
                />
              </Popover>
            </span>
          </NavbarGroup>
        </Navbar>
      </div>
      <div>
        <ChatList
          queryStr={queryStr}
          showArchivedChats={showArchivedChats}
          onChatClick={onChatClick}
          selectedChatId={selectedChat ? selectedChat.id : null}
        />
        {MessageListView}
      </div>
      <OfflineToast />
    </div>
  )
}
