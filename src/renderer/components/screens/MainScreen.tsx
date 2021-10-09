import React, { useState, useContext, useRef } from 'react'
import {
  ScreenContext,
  SettingsContext,
  useTranslationFunction,
} from '../../contexts'

import Gallery from '../Gallery'
import Menu from '../Menu'
import ChatList from '../chat/ChatList'
import MessageListAndComposer, {
  getBackgroundImageStyle,
} from '../message/MessageListAndComposer'
import SearchInput from '../SearchInput'
import { useChatStore, ChatStoreState } from '../../stores/chat'
import {
  openViewGroupDialog,
  openViewProfileDialog,
} from '../helpers/ChatMethods'

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
import { getLastSelectedChatId } from '../../ipc'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import { Avatar } from '../Avatar'
import ConnectivityToast from '../ConnectivityToast'
import { C } from 'deltachat-node/dist/constants'
import MapComponent from '../map/MapComponent'
import MailingListProfile from '../dialogs/MessageListProfile'
import { FullChat } from '../../../shared/shared-types'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/main-screen')

enum View {
  MessageList,
  Media,
  Map,
}

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [view, setView] = useState(View.MessageList)
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
  const [selectedChat, chatStoreDispatch] = useChatStore()

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return setShowArchivedChats(true)
    // avoid double clicks
    if (chatId === selectedChat.id) return

    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    setView(View.MessageList)
  }
  const searchChats = (queryStr: string) => setQueryStr(queryStr)
  const handleSearchChange = (event: { target: { value: string } }) =>
    searchChats(event.target.value)
  const onTitleClick = () => {
    if (!selectedChat) return

    if (selectedChat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
      screenContext.openDialog(MailingListProfile, {
        chat: selectedChat as FullChat,
      })
    } else if (selectedChat.isGroup) {
      openViewGroupDialog(screenContext, selectedChat)
    } else {
      if (selectedChat.contactIds && selectedChat.contactIds[0]) {
        openViewProfileDialog(screenContext, selectedChat.contactIds[0])
      }
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

  if (!selectedChat) {
    log.error('selectedChat is undefined')
    return null
  }

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
    const style: React.CSSProperties = window.__desktopSettings
      ? getBackgroundImageStyle(window.__desktopSettings)
      : {}

    MessageListView = (
      <div className='message-list-and-composer' style={style}>
        <div
          className='message-list-and-composer__message-list'
          style={{ display: 'flex' }}
        >
          <div className='info-message big' style={{ alignSelf: 'center' }}>
            <p>{tx('no_chat_selected_suggestion_desktop')}</p>
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
                    avatarPath={selectedChat.profileImage || undefined}
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
                    {chatSubtitle(selectedChat)}
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
                    desktopSettings?.enableOnDemandLocationStreaming && (
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
      <ConnectivityToast />
    </div>
  )
}

function chatSubtitle(chat: ChatStoreState | FullChat) {
  const tx = window.static_translate
  if (chat.id && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
    if (chat.type === C.DC_CHAT_TYPE_GROUP) {
      return tx('n_members', [String(chat.contacts.length)], {
        quantity: chat.contacts.length,
      })
    } else if (chat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
      return tx('mailing_list')
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
