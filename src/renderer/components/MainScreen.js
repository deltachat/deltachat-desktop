import React, { useState, useRef, useEffect, useContext } from 'react'
import { callDcMethod } from '../ipc'
import styled from 'styled-components'
import ScreenContext from '../contexts/ScreenContext'

import Media from './Media'
import Menu from './Menu'
import ChatList from './chat/ChatList'
import MessageListAndComposer from './message/MessageListAndComposer'
import SearchInput from './SearchInput'
import SettingsContext from '../contexts/SettingsContext'

import NavbarWrapper from './NavbarWrapper'

import chatStore from '../stores/chat'

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
`
const NavbarGroupSubtitle = styled.div`
  font-size: small;
  font-weight: 100;
  color: ${props => props.theme.navBarGroupSubtitle};
`

const Welcome = styled.div`
  width: 70%;
  float: right;
  height: calc(100vh - 50px);
  margin-top: 50px;
  text-align: center;
`

export default function MainScreen() {
  const [queryStr, setQueryStr] = useState('')
  const [media, setMedia] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showArchivedChats, setShowArchivedChats] = useState(null)
  const { openDialog } = useContext(ScreenContext)

  const chatClicked = useRef(0)

  const onChatUpdate = chat => setSelectedChat(chat)
  const onChatClick = chatId => {
    if (chatId === chatClicked.current) {
      // avoid double clicks
      return
    }
    chatClicked.current = chatId
    callDcMethod('chatList.selectChat', [chatId])
    setTimeout(() => { chatClicked.current = 0 }, 500)
  }
  const searchChats = queryStr => setQueryStr(queryStr)
  const handleSearchChange = event => searchChats(event.target.value)
  const onMapIconClick = () => openDialog('MapDialog', { selectedChat })

  useEffect(() => {
    chatStore.subscribe(onChatUpdate)
    return () => { chatStore.unsubscribe(onChatUpdate) }
  }, [selectedChat])

 const tx = window.translate

 const menu = <ScreenContext.Consumer>{(screenContext) =>
   <Menu
     selectedChat={selectedChat}
     showArchivedChats={setShowArchivedChats}
   />}
 </ScreenContext.Consumer>

  const MessageListView = selectedChat
    ? selectedChat.id
      ? media ? <Media
        chat={selectedChat}
      />
        : (<MessageListAndComposer
          chat={selectedChat}
        />)
      : (
        <Welcome>
          <h3>{tx('no_chat_selected_suggestion_desktop')}</h3>
          <img src={'../images/image-80.svg'} className='welcome-image' />
        </Welcome>
      )
    : (
      <Welcome>
        <h1>{tx('welcome_desktop')}</h1>
        <p>{tx('no_chat_selected_suggestion_desktop')}</p>
        <img src={'../images/image-80.svg'} className='welcome-image' />
      </Welcome>
    )

 return (
   <div>
     <NavbarWrapper>
       <Navbar fixedToTop>
         <NavbarGroup align={Alignment.LEFT}>
           <SearchInput
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
             <NavbarGroupName>{selectedChat ? selectedChat.name : ''}</NavbarGroupName>
             <NavbarGroupSubtitle>{selectedChat ? selectedChat.subtitle : ''}</NavbarGroupSubtitle>
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
