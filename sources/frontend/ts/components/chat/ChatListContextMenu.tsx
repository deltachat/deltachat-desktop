import React, { useState, useRef, useContext, useEffect } from 'react'
import { ScreenContext } from '../../contexts'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog,
  openEditGroupDialog,
  openViewProfileDialog,
} from '../helpers/ChatMethods'

import { callDcMethodAsync } from '../../ipc'
import { ChatListItemType } from '../../../../shared/shared-types'

// import logger from '../../shared/logger'
// const log = logger.getLogger('renderer/ChatListContextMenu')

const ChatListContextMenu = React.memo<{
  showArchivedChats: boolean
  getShow: (cb: (event: MouseEvent, chat: ChatListItemType) => void) => void
}>(
  props => {
    const screenContext = useContext(ScreenContext)
    const { showArchivedChats } = props
    const [chat, setChat] = useState<ChatListItemType | null>(null)
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

    const onArchiveChat = (archive: boolean) => archiveChat(chat.id, archive)
    const onDeleteChat = () => openDeleteChatDialog(screenContext, chat)
    const onEncrInfo = () => openEncryptionInfoDialog(screenContext, chat)
    const onEditGroup = async () => {
      const fullChat = await callDcMethodAsync(
        'chatList.getFullChatById',
        chat.id
      )
      openEditGroupDialog(screenContext, fullChat)
    }
    const onViewProfile = async () => {
      const fullChat = await callDcMethodAsync(
        'chatList.getFullChatById',
        chat.id
      )
      openViewProfileDialog(screenContext, fullChat.contacts[0])
    }
    const onLeaveGroup = () => openLeaveChatDialog(screenContext, chat.id)
    const onBlockContact = () => openBlockContactDialog(screenContext, chat)

    const tx = window.translate

    const menu = chat
      ? [
          showArchivedChats ? (
            <MenuItem onClick={() => onArchiveChat(false)} key='export'>
              {tx('menu_unarchive_chat')}
            </MenuItem>
          ) : (
            <MenuItem onClick={() => onArchiveChat(true)} key='import'>
              {tx('menu_archive_chat')}
            </MenuItem>
          ),
          <MenuItem onClick={onDeleteChat} key='delete'>
            {tx('menu_delete_chat')}
          </MenuItem>,
          !chat.isGroup && !chat.isDeviceTalk && (
            <MenuItem onClick={onEncrInfo} key='info'>
              {tx('encryption_info_desktop')}
            </MenuItem>
          ),
          chat.isGroup && chat.selfInGroup && (
            <>
              <MenuItem onClick={onEditGroup} key='edit'>
                {tx('menu_edit_group')}
              </MenuItem>
              <MenuItem onClick={onLeaveGroup} key='leave'>
                {tx('menu_leave_group')}
              </MenuItem>
            </>
          ),
          !chat.isGroup && (
            <MenuItem onClick={onViewProfile} key='view'>
              {tx('menu_view_profile')}
            </MenuItem>
          ),
          !chat.isGroup && !(chat.isSelfTalk || chat.isDeviceTalk) && (
            <MenuItem onClick={onBlockContact} key='block'>
              {tx('menu_block_contact')}
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
