import React, { useState, useRef, useContext, useEffect } from 'react'
import ScreenContext from '../contexts/ScreenContext'
import { ContextMenu, MenuItem } from 'react-contextmenu'
import { Icon } from '@blueprintjs/core'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog
} from './helpers/ChatMethods'

const log = require('../../logger').getLogger('renderer/ChatListContextMenu')

const ChatListContextMenu = React.memo((props) => {
  const screenContext = useContext(ScreenContext)
  const { showArchivedChats } = props
  const [chat, setChat] = useState({ isGroup: false })
  const [showEvent, setShowEvent] = useState(null)
  const contextMenu = useRef(null)

  const show = (event, chat) => {
    //log.debug('ChatListContextMenu.show', chat, event)
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

  useEffect(() => { props.getShow(show) }, [])
  useEffect(() => { if (showEvent) contextMenu.current.handleShow(showEvent) })

  const reset = () => {
    setShowEvent(null)
    setChat({})
  }

  const onArchiveChat = archive => archiveChat(chat.id, archive)
  const onDeleteChat = () => openDeleteChatDialog(screenContext, chat.id)
  const onEncrInfo = () => openEncryptionInfoDialog(screenContext, chat)
  const onEditGroup = () => screenContext.changeScreen('EditGroup', { chat })
  const onLeaveGroup = () => openLeaveChatDialog(screenContext, chat.id)
  const onBlockContact = () => openBlockContactDialog(screenContext, chat)

  const tx = window.translate
  return (
    <ContextMenu id='chat-options' ref={contextMenu} onHide={reset}>
      {showArchivedChats
        ? <MenuItem onClick={() => onArchiveChat(false)} >
          <Icon icon='export' /> {tx('menu_unarchive_chat')}
        </MenuItem>
        : <MenuItem icon='import' onClick={() => onArchiveChat(true)}>
          <Icon icon='import' /> {tx('menu_archive_chat')}
        </MenuItem>
      }
      <MenuItem onClick={onDeleteChat}>
        <Icon icon='delete' /> {tx('menu_delete_chat')}
      </MenuItem>
      <MenuItem onClick={onEncrInfo}>
        <Icon icon='lock' /> {tx('encryption_info_desktop')}
      </MenuItem>
      {chat.isGroup
        ? (
          <div>
            <MenuItem onClick={onEditGroup} >
              <Icon icon='edit' /> {tx('menu_edit_group')}
            </MenuItem>
            <MenuItem onClick={onLeaveGroup}>
              <Icon icon='log-out' /> {tx('menu_leave_group')}
            </MenuItem>
          </div>
        )
        : <MenuItem onClick={onBlockContact}>
          <Icon icon='blocked-person' /> {tx('menu_block_contact')}
        </MenuItem>
      }
    </ContextMenu>
  )
})

export default ChatListContextMenu
