import React, { useState, useContext, useRef } from 'react'
import { ScreenContext, SettingsContext } from '../contexts'

import Media from './Media'
import Menu from './Menu'
import ChatList from './chat/ChatList'
import MessageListAndComposer from './message/MessageListAndComposer'
import SearchInput from './SearchInput'
import { useChatStore } from '../stores/chat'
import {
  openEditGroupDialog,
  openMapDialog,
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

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [media, setMedia] = useState(false)
  const [showArchivedChats, setShowArchivedChats] = useState(null)
  const screenContext = useContext(ScreenContext)
  const [selectedChat, chatStoreDispatch] = useChatStore()

  const onChatClick = (chatId: number) => {
    // avoid double clicks
    if (chatId === selectedChat.id) return

    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    setMedia(false)
  }
  const searchChats = (queryStr: string) => setQueryStr(queryStr)
  const handleSearchChange = (event: { target: { value: '' } }) =>
    searchChats(event.target.value)
  const onMapIconClick = () => openMapDialog(screenContext, selectedChat)
  const onTitleClick = () => {
    if (!selectedChat) return

    if (selectedChat.isGroup) {
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

  const tx = window.translate

  const menu = <Menu selectedChat={selectedChat} />
  const MessageListView = selectedChat.id ? (
    media ? (
      <Media chat={selectedChat} />
    ) : (
      <MessageListAndComposer chat={selectedChat} />
    )
  ) : (
    <div className='no-chat-selected-screen'>
      <h2>{tx('no_chat_selected_suggestion_desktop')}</h2>
    </div>
  )

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
            {showArchivedChats && (
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
            {showArchivedChats || (
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
                }}
                onClick={onTitleClick}
              >
                {selectedChat && (
                  <Avatar
                    displayName={selectedChat.name}
                    color={selectedChat.color}
                    isVerified={selectedChat.isVerified}
                    avatarPath={selectedChat.profileImage}
                    small
                  />
                )}
                <div style={{ marginLeft: '7px' }}>
                  <div className='navbar-chat-name'>{selectedChat.name}</div>
                  <div className='navbar-chat-subtile'>
                    {selectedChat.subtitle}
                  </div>
                </div>
              </NavbarHeading>
            )}
            {selectedChat && selectedChat.id && (
              <span className='views'>
                <Button
                  onClick={() => setMedia(false)}
                  minimal
                  large
                  active={!media}
                  // aria-selected={!media}
                  icon={'chat'}
                  aria-label={tx('chat')}
                />
                <Button
                  onClick={() => setMedia(true)}
                  minimal
                  large
                  active={media}
                  // aria-selected={media}
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
                        style={{ marginLeft: 0 }}
                        onClick={onMapIconClick}
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
          onShowArchivedChats={() => setShowArchivedChats(true)}
          onChatClick={onChatClick}
          selectedChatId={selectedChat ? selectedChat.id : null}
        />
        {MessageListView}
      </div>
      <OfflineToast />
    </div>
  )
}
