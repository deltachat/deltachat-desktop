import React, { useState, useRef, useContext, useEffect } from 'react'
import { ScreenContext } from '../../contexts'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog,
  openEditGroupDialog,
  openViewProfileDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
} from '../helpers/ChatMethods'

import { ChatListItemType } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { DeltaBackend } from '../../delta-remote'

// const log = require('../../shared/logger').getLogger('renderer/ChatListContextMenu')

const ArchiveStateMenu = (chat: ChatListItemType) => {
  const tx = window.translate

  const archive = (
    <MenuItem
      onClick={() =>
        setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_ARCHIVED, true)
      }
      key='import'
    >
      {tx('menu_archive_chat')}
    </MenuItem>
  )
  const unArchive = (
    <MenuItem
      onClick={() =>
        setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_NORMAL, true)
      }
      key='export'
    >
      {tx('menu_unarchive_chat')}
    </MenuItem>
  )
  const pin = (
    <MenuItem
      onClick={() =>
        setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_PINNED, chat.archived)
      }
      key='pinChat'
    >
      {tx('pin_chat')}
    </MenuItem>
  )
  const unPin = (
    <MenuItem
      onClick={() => setChatVisibility(chat.id, C.DC_CHAT_VISIBILITY_NORMAL)}
      key='pinChat'
    >
      {tx('unpin_chat')}
    </MenuItem>
  )

  /*
            Archive	UnArchive	Pin	UnPin
  pinned	  y	      n       	n	  y
  archived  n       y       	y	  n
  normal	  y	      n       	y	  n
  */

  if (chat.pinned) {
    return [unPin, archive]
  } else if (chat.archived) {
    return [pin, unArchive]
  } else {
    // normal
    return [pin, archive]
  }
}

const ChatListContextMenu = React.memo<{
  showArchivedChats: boolean
  getShow: (cb: (event: MouseEvent, chat: ChatListItemType) => void) => void
}>(
  props => {
    const screenContext = useContext(ScreenContext)
    const { showArchivedChats } = props
    const [chatListItem, setChat] = useState<ChatListItemType | null>(null)
    const [showEvent, setShowEvent] = useState(null)
    const contextMenu = useRef(null)

    const show = (event: MouseEvent, chat: ChatListItemType) => {
      // no log.debug, because passing the event object to through ipc freezes the application
      // console.debug('ChatListContextMenu.show', chat, event) // also commented out because it's not needed

      /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
      event.preventDefault()
      event.stopPropagation()
      const position = { x: event.clientX, y: event.clientY }
      const ev = { detail: { id: 'chat-options', position } }
      setChat(chat)
      setShowEvent(ev)
    }

    useEffect(() => {
      props.getShow(show)
    }, [])
    useEffect(() => {
      if (showEvent) contextMenu.current.handleShow(showEvent)
    })

    const reset = () => {
      setShowEvent(null)
      setChat(null)
    }

    const onDeleteChat = () => openDeleteChatDialog(screenContext, chatListItem)
    const onEncrInfo = () =>
      openEncryptionInfoDialog(screenContext, chatListItem)
    const onEditGroup = async () => {
      const fullChat = await DeltaBackend.call(
        'chatList.getFullChatById',
        chatListItem.id
      )
      openEditGroupDialog(screenContext, fullChat)
    }
    const onViewProfile = async () => {
      const fullChat = await DeltaBackend.call(
        'chatList.getFullChatById',
        chatListItem.id
      )
      openViewProfileDialog(screenContext, fullChat.contacts[0].id)
    }
    const onLeaveGroup = () =>
      openLeaveChatDialog(screenContext, chatListItem.id)
    const onBlockContact = () =>
      openBlockContactDialog(screenContext, chatListItem)
    const onMuteChat = () => openMuteChatDialog(screenContext, chatListItem.id)
    const onUnmuteChat = () => unMuteChat(chatListItem.id)
    const tx = window.translate

    const menu = chatListItem
      ? [
          ...ArchiveStateMenu(chatListItem),
          <MenuItem onClick={onDeleteChat} key='delete'>
            {tx('menu_delete_chat')}
          </MenuItem>,
          !chatListItem.isGroup && !chatListItem.isDeviceTalk && (
            <MenuItem onClick={onEncrInfo} key='info'>
              {tx('encryption_info_desktop')}
            </MenuItem>
          ),
          chatListItem.isGroup && chatListItem.selfInGroup && (
            <>
              <MenuItem onClick={onEditGroup} key='edit'>
                {tx('menu_edit_group')}
              </MenuItem>
              <MenuItem onClick={onLeaveGroup} key='leave'>
                {tx('menu_leave_group')}
              </MenuItem>
            </>
          ),
          !chatListItem.isGroup && (
            <MenuItem onClick={onViewProfile} key='view'>
              {tx('menu_view_profile')}
            </MenuItem>
          ),
          !chatListItem.isGroup &&
            !(chatListItem.isSelfTalk || chatListItem.isDeviceTalk) && (
              <MenuItem onClick={onBlockContact} key='block'>
                {tx('menu_block_contact')}
              </MenuItem>
            ),
          !chatListItem.muted ? (
            <MenuItem onClick={onMuteChat} key='mute'>
              {tx('menu_mute')}
            </MenuItem>
          ) : (
            <MenuItem onClick={onUnmuteChat} key='unmute'>
              {tx('menu_unmute')}
            </MenuItem>
          ),
        ]
      : []

    return (
      <ContextMenu id='chat-options' ref={contextMenu} onHide={reset}>
        {menu}
      </ContextMenu>
    )
  },
  (prevProps, nextProps) => {
    const shouldRerender =
      prevProps.showArchivedChats !== nextProps.showArchivedChats
    return !shouldRerender
  }
)

export default ChatListContextMenu
