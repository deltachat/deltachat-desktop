import React from 'react'
import { ipcRenderer } from 'electron'
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

export default class ChatListContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chat: {}
    }
    this.contextMenu = React.createRef()
  }

  show (chatId, e) {
    e.preventDefault()
    e.stopPropagation()
    console.log('ChatListContextMenu.show', chatId, this.props)
    /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
    const ev = { detail: { id: 'chat-options', position: { x: e.clientX, y: e.clientY } } }
    const chat = this.props.chatList.find(chat => chat.id === chatId)
    this.setState({ chat }, () => {
      if (!this.contextMenu.current) return
      this.contextMenu.current.handleShow(ev)
    })
  }

  reset () {
    this.setState({ chat: {} })
  }

  render () {
    const tx = window.translate
    const { showArchivedChats } = this.props
    return (
      <ContextMenu id='chat-options' ref={this.contextMenu} onHide={() => this.reset()}>
        {showArchivedChats
          ? <MenuItem onClick={() => this.onArchiveChat(false)} >
            <Icon icon='export' /> {tx('menu_unarchive_chat')}
          </MenuItem>
          : <MenuItem icon='import' onClick={() => this.onArchiveChat(true)}>
            <Icon icon='import' /> {tx('menu_archive_chat')}
          </MenuItem>
        }
        <MenuItem onClick={this.onDeleteChat.bind(this)}>
          <Icon icon='delete' /> {tx('menu_delete_chat')}
        </MenuItem>
        <MenuItem onClick={this.onEncrInfo.bind(this)}>
          <Icon icon='lock' /> {tx('encryption_info_desktop')}
        </MenuItem>
        {this.state.chat.isGroup
          ? (
            <div>
              <MenuItem onClick={this.onEditGroup.bind(this)} >
                <Icon icon='edit' /> {tx('menu_edit_group')}
              </MenuItem>
              <MenuItem onClick={this.onLeaveGroup.bind(this)}>
                <Icon icon='log-out' /> {tx('menu_leave_group')}
              </MenuItem>
            </div>
          )
          : <MenuItem onClick={this.onBlockContact.bind(this)}>
            <Icon icon='blocked-person' /> {tx('menu_block_contact')}
          </MenuItem>
        }
      </ContextMenu>
    )
  }

  onArchiveChat (archive) {
    archiveChat(this.state.chat.id, archive)
  }

  onDeleteChat () {
    openDeleteChatDialog(this.context, this.state.chat.id)
  }

  onEncrInfo () {
    openEncryptionInfoDialog(this.context, this.state.chat)
  }

  onEditGroup () {
    this.context.changeScreen('EditGroup', { chat: this.state.chat })
  }

  onLeaveGroup () {
    openLeaveChatDialog(this.context, this.state.chat.id)
  }

  onBlockContact () {
    openBlockContactDialog(this.context, this.state.chat)
  }
}
ChatListContextMenu.contextType = ScreenContext

