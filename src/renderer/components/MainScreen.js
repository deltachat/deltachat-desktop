import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import ScreenContext from '../contexts/ScreenContext'

import Media from './Media'
import Menu from './Menu'
import ChatList from './chat/ChatList'
import MessageListAndComposer from './message/MessageListAndComposer'
import SearchInput from './SearchInput'
import SettingsContext from '../contexts/SettingsContext'
import { useChatStore } from '../stores/chat'
import NavbarWrapper from './NavbarWrapper'
import { openEditGroupDialog, openMapDialog, openViewProfileDialog } from './helpers/ChatMethods'

import {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Position,
  Popover,
  Button
} from '@blueprintjs/core'

const NavbarGroupName = styled.div`
  font-size: medium;
  font-weight: bold;
  cursor: pointer;
`
const NavbarGroupSubtitle = styled.div`
  font-size: small;
  font-weight: 100;
  cursor: pointer;
  color: ${props => props.theme.navBarGroupSubtitle};
`

const Welcome = styled.div`
  width: 70%;
  float: right;
  height: calc(100vh - 50px);
  margin-top: 50px;
  text-align: center;
`

export default function MainScreen () {
  const [queryStr, setQueryStr] = useState('')
  const [media, setMedia] = useState(false)
  const [showArchivedChats, setShowArchivedChats] = useState(null)
  const screenContext = useContext(ScreenContext)
  const [selectedChat, chatStoreDispatch] = useChatStore()

  const onChatClick = chatId => {
    // avoid double clicks
    if (chatId === selectedChat.id) return

    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    setMedia(false)
  }
  const searchChats = queryStr => setQueryStr(queryStr)
  const handleSearchChange = event => searchChats(event.target.value)
  const onMapIconClick = () => openMapDialog(screenContext, selectedChat)
  const onTitleClick = () => {
    if (!selectedChat) return

    if (selectedChat.isGroup) {
      openEditGroupDialog(screenContext, selectedChat)
    } else {
      openViewProfileDialog(screenContext, selectedChat.contacts[0])
    }
  }

  const tx = window.translate

  const menu = <Menu
    selectedChat={selectedChat}
    showArchivedChats={showArchivedChats}
  />
  const MessageListView = selectedChat.id
    ? media ? <Media
      chat={selectedChat}
    />
      : (<MessageListAndComposer
        chat={selectedChat}
      />)
    : (
      <Welcome>
        <h1>{tx('welcome_desktop')}</h1>
        <h3>{tx('no_chat_selected_suggestion_desktop')}</h3>
        <img src={'../images/image-80.svg'} className='welcome-image' />
      </Welcome>
    )

  return (
    <div>
      <NavbarWrapper>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <SearchInput
              id='chat-list-search'
              onChange={handleSearchChange}
              value={queryStr}
              className='icon-rotated'
            />
            { showArchivedChats && (
              <Button
                className={[Classes.MINIMAL, 'icon-rotated']}
                icon='undo' onClick={() => setShowArchivedChats(false)}
                aria-label={tx('back')} />
            ) }
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <NavbarHeading>
              <NavbarGroupName onClick={onTitleClick}>{selectedChat ? selectedChat.name : ''}</NavbarGroupName>
              <NavbarGroupSubtitle onClick={onTitleClick}>{selectedChat ? selectedChat.subtitle : ''}</NavbarGroupSubtitle>
            </NavbarHeading>
            {selectedChat && selectedChat.id && <span className='views'>
              <Button
                onClick={() => setMedia(false)}
                minimal
                large
                active={!media}
                // aria-selected={!media}
                icon={'chat'}
                aria-label={tx('chat')} />
              <Button
                onClick={() => setMedia(true)}
                minimal
                large
                active={media}
                // aria-selected={media}
                icon={'media'}
                aria-label={tx('media')} />
              <SettingsContext.Consumer>
                {({ enableOnDemandLocationStreaming }) => (
                  enableOnDemandLocationStreaming &&
                  <Button
                    minimal
                    large
                    icon='map'
                    style={{ marginLeft: 0 }}
                    onClick={onMapIconClick} aria-label={tx('tab_map')} />
                )}
              </SettingsContext.Consumer>
            </span>}
            <span style={{ marginLeft: selectedChat && selectedChat.id ? 0 : 'auto' }}>
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className='icon-rotated' minimal icon='more' id='main-menu-button' aria-label={tx('main_menu')} />
              </Popover>
            </span>
          </NavbarGroup>
        </Navbar>
      </NavbarWrapper>
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
    </div>
  )
}
