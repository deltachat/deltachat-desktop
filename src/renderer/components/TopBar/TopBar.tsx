import React, { useContext, useRef } from 'react'
import classNames from 'classnames'
import {
  Alignment,
  Classes,
  // Classes,
  Navbar,
  NavbarGroup,
  // NavbarHeading,
  Button,
} from '@blueprintjs/core'

import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { MainScreenContext } from '../MainScreen/contexts/MainScreenContext'
import { MenuButton } from '../MenuButton'
import { SearchContext } from '../../contexts/SearchContext'
import { SearchInput } from '../SearchInput'
import { useTranslationFunction } from '../../contexts'

import styles from './styles.module.scss'

export function TopBar() {
  const { showArchivedChats, setShowArchivedChats, setSidebarState } =
    useContext(MainScreenContext)

  const handleMenuClick = () => {
    setSidebarState('visible')
  }

  const handleHideArchivedChats = () => {
    setShowArchivedChats(false)
  }

  return (
    <Navbar className={styles.topBar} fixedToTop>
      <NavbarGroup align={Alignment.LEFT}>
        <MenuButton onClick={handleMenuClick} />
        {showArchivedChats ? (
          <ArchivedChatsTitle onHide={handleHideArchivedChats} />
        ) : (
          <SearchChat />
        )}
      </NavbarGroup>
    </Navbar>
  )
}

function SearchChat() {
  const { queryStr, searchChats } = useContext(SearchContext)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearchChange = (query: string) => {
    searchChats(query)
  }

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchInputRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    if (!searchInputRef.current) {
      return
    }
    searchInputRef.current.value = ''
    searchChats('')
  })

  return (
    <SearchInput
      id='chat-list-search'
      onChange={handleSearchChange}
      value={queryStr}
      inputRef={searchInputRef}
    />
  )
}

function ArchivedChatsTitle(props: { onHide: () => void }) {
  const tx = useTranslationFunction()

  return (
    <>
      <div className='archived-chats-title'>
        {tx('chat_archived_chats_title')}
      </div>
      <Button
        className={classNames(
          Classes.MINIMAL,
          'icon-rotated',
          'archived-chats-return-button'
        )}
        icon='undo'
        onClick={props.onHide}
        aria-label={tx('back')}
      />
    </>
  )
}

// function TopBarRight() {
//   const tx = useTranslationFunction()
//
//   return (
//     <NavbarGroup align={Alignment.RIGHT}>
//       {alternativeView === 'global-gallery' && (
//         <NavbarHeading
//           style={{
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             width: '100%',
//           }}
//           onClick={onTitleClick}
//         >
//           {tx('menu_all_media')}
//         </NavbarHeading>
//       )}
//       {selectedChat.chat && (
//         <NavbarHeading
//           style={{
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             width: '100%',
//           }}
//           onClick={onTitleClick}
//         >
//           <Avatar
//             displayName={selectedChat.chat.name}
//             color={selectedChat.chat.color}
//             avatarPath={selectedChat.chat.profileImage || undefined}
//             small
//             wasSeenRecently={selectedChat.chat.wasSeenRecently}
//           />
//           <div style={{ marginLeft: '7px', overflow: 'hidden' }}>
//             <div className='navbar-chat-name'>
//               <div className='truncated'>{selectedChat.chat.name}</div>
//               <div className='chat_property_icons'>
//                 {selectedChat.chat.isProtected && <InlineVerifiedIcon />}
//                 {selectedChat.chat.ephemeralTimer !== 0 && (
//                   <div
//                     className={'disapearing-messages-icon'}
//                     aria-label={tx('a11y_disappearing_messages_activated')}
//                   />
//                 )}
//               </div>
//             </div>
//             <div className='navbar-chat-subtile'>
//               {chatSubtitle(selectedChat.chat)}
//             </div>
//           </div>
//         </NavbarHeading>
//       )}
//       {selectedChat.chat && (
//         <>
//           <span className='views'>
//             <Button
//               onClick={() => setChatView(ChatView.MessageList)}
//               minimal
//               large
//               active={selectedChat.activeView === ChatView.MessageList}
//               icon={'chat'}
//               aria-label={tx('chat')}
//             />
//             <Button
//               onClick={() => setChatView(ChatView.Media)}
//               minimal
//               large
//               active={selectedChat.activeView === ChatView.Media}
//               icon={'media'}
//               aria-label={tx('media')}
//             />
//             {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
//               <Button
//                 minimal
//                 large
//                 icon='map'
//                 onClick={() => setChatView(ChatView.Map)}
//                 active={selectedChat.activeView === ChatView.Map}
//                 aria-label={tx('tab_map')}
//               />
//             )}
//           </span>
//         </>
//       )}
//       {(selectedChat.chat || alternativeView === 'global-gallery') && (
//         <span
//           style={{
//             marginLeft: 0,
//             marginRight: '3px',
//           }}
//         >
//           <Button
//             className='icon-rotated'
//             minimal
//             icon='more'
//             id='three-dot-menu-button'
//             aria-label={tx('main_menu')}
//             onClick={onClickThreeDotMenu}
//           />
//         </span>
//       )}
//     </NavbarGroup>
//   )
// }
