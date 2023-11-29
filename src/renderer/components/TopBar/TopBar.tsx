import React, { useContext, useRef } from 'react'
import classNames from 'classnames'
import { C } from '@deltachat/jsonrpc-client'
import {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Button,
} from '@blueprintjs/core'

import { KeybindAction, useKeyBindingAction } from '../../keybindings'
import { MenuButton } from '../MenuButton'
import { SearchContext } from '../../contexts/SearchContext'
import { SearchInput } from '../SearchInput'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { useSidebar } from '../MainScreen/hooks/useSidebar'
import { useMainView } from '../MainScreen/hooks/useMainView'
import { ChatView, useChatStore } from '../../stores/chat'
import MailingListProfile from '../dialogs/MessageListProfile'
import {
  openViewGroupDialog,
  openViewProfileDialog,
  setChatView,
} from '../helpers/ChatMethods'
import { Avatar } from '../Avatar'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import { useSettingsStore } from '../../stores/settings'
import { useThreeDotMenu } from '../ThreeDotMenu'
import { Type } from '../../backend-com'

import styles from './styles.module.scss'

export function TopBar() {
  const { showSidebar } = useSidebar()
  const { mainView, switchToChat } = useMainView()

  const handleMenuClick = () => {
    showSidebar()
  }

  const handleHideArchivedChats = () => {
    switchToChat()
  }

  return (
    <Navbar className={styles.topBar} fixedToTop>
      <NavbarGroup align={Alignment.LEFT}>
        <MenuButton onClick={handleMenuClick} />
        {mainView === 'archive' ? (
          <ArchivedChatsTitle onHide={handleHideArchivedChats} />
        ) : (
          <SearchChat />
        )}
      </NavbarGroup>
      <TopBarRight />
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

function TopBarRight() {
  const { mainView } = useMainView()
  const selectedChat = useChatStore()

  return (
    <NavbarGroup align={Alignment.RIGHT}>
      {mainView === 'global-gallery' && <GlobalGalleryTitle />}
      {selectedChat.chat && (
        <>
          <ChatTitle chat={selectedChat.chat} />
          <ChatMenu activeView={selectedChat.activeView} />
        </>
      )}
      {(selectedChat.chat || mainView === 'global-gallery') && <ThreeDotMenu />}
    </NavbarGroup>
  )
}

function GlobalGalleryTitle() {
  const tx = useTranslationFunction()

  return (
    <NavbarHeading
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {tx('menu_all_media')}
    </NavbarHeading>
  )
}

function ChatTitle({ chat }: { chat: Type.FullChat }) {
  const screenContext = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const onTitleClick = () => {
    if (!chat) return

    if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      screenContext.openDialog(MailingListProfile, {
        chat,
      })
    } else if (
      chat.chatType === C.DC_CHAT_TYPE_GROUP ||
      chat.chatType === C.DC_CHAT_TYPE_BROADCAST
    ) {
      openViewGroupDialog(screenContext, chat)
    } else {
      if (chat.contactIds && chat.contactIds[0]) {
        openViewProfileDialog(screenContext, chat.contactIds[0])
      }
    }
  }

  return (
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
        <div className='navbar-chat-subtile'>
          <ChatSubtitle chat={chat} />
        </div>
      </div>
    </NavbarHeading>
  )
}

function ChatMenu({ activeView }: { activeView: ChatView }) {
  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  return (
    <>
      <span className='views'>
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
        {settingsStore?.desktopSettings.enableOnDemandLocationStreaming && (
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
  )
}

function ThreeDotMenu() {
  const tx = useTranslationFunction()
  const selectedChat = useChatStore()
  const { mainView } = useMainView()

  const handleMenuClick = useThreeDotMenu(
    selectedChat.chat,
    mainView === 'global-gallery' || selectedChat?.activeView === ChatView.Media
      ? 'gallery'
      : 'chat'
  )

  return (
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
        onClick={handleMenuClick}
      />
    </span>
  )
}

function ChatSubtitle({ chat }: { chat: Type.FullChat }) {
  const tx = useTranslationFunction()

  if (chat.id && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
    if (chat.chatType === C.DC_CHAT_TYPE_GROUP) {
      return (
        <>
          {tx('n_members', [String(chat.contacts.length)], {
            quantity: chat.contacts.length,
          })}
        </>
      )
    } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
      if (chat.mailingListAddress) {
        return (
          <>
            `${tx('mailing_list')} – ${chat.mailingListAddress}`
          </>
        )
      } else {
        return <>{tx('mailing_list')}</>
      }
    } else if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
      return (
        <>
          {tx('n_recipients', [String(chat.contacts.length)], {
            quantity: chat.contacts.length,
          })}
        </>
      )
    } else if (chat.contacts.length >= 1) {
      if (chat.isSelfTalk) {
        return <>{tx('chat_self_talk_subtitle')}</>
      } else if (chat.isDeviceChat) {
        return <>{tx('device_talk_subtitle')}</>
      }
      return <>{chat.contacts[0].address}</>
    }
  }

  return <>ErrTitle</>
}
