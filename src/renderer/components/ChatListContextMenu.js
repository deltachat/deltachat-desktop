const React = require('react')
const { ipcRenderer } = require('electron')

const ScreenContext = require('../contexts/ScreenContext')

const { ContextMenu, MenuItem } = require('react-contextmenu')
const confirmation = require('./dialogs/confirmationDialog')
const { Icon } = require('@blueprintjs/core')

class ChatListContextMenu extends React.Component {
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
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'archiveChat', this.state.chat.id, archive)
  }

  onDeleteChat () {
    const tx = window.translate
    const chatId = this.state.chat.id
    confirmation(tx('ask_delete_chat_desktop'), yes => {
      if (yes) {
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'deleteChat', chatId)
      }
    })
  }

  onEncrInfo () {
    this.context.openDialog('EncrInfo', { chat: this.state.chat })
  }

  onEditGroup () {
    this.context.changeScreen('EditGroup', { chat: this.state.chat })
  }

  onLeaveGroup () {
    const selectedChat = this.state.chat
    const tx = window.translate
    confirmation(tx('ask_leave_group'), yes => {
      if (yes) {
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'leaveGroup', selectedChat.id)
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'selectChat', selectedChat.id)
      }
    })
  }

  onBlockContact () {
    const tx = window.translate
    const chat = this.state.chat
    const contactId = (chat && chat.contacts.length) ? chat.contacts[0].id : undefined
    if (!contactId) return
    confirmation(tx('ask_block_contact'), yes => {
      if (yes) {
        ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'blockContact', contactId)
      }
    })
  }
}
ChatListContextMenu.contextType = ScreenContext

module.exports = ChatListContextMenu
