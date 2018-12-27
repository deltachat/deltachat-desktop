const React = require('react')
const { ipcRenderer } = require('electron')
const autobind = require('class-autobind').default
const confirmation = require('./dialogs/confirmationDialog')

const {
  Menu,
  MenuItem
} = require('@blueprintjs/core')

class Controller {
  constructor (props) {
    this.props = props
    autobind(this)
  }

  onCreateChat () {
    this.props.changeScreen('CreateChat')
  }

  onEditGroup () {
    this.props.changeScreen('EditGroup', { chat: this.props.selectedChat })
  }

  onLeaveGroup () {
    const selectedChat = this.props.selectedChat
    const tx = window.translate
    const message = tx('dialogs.leaveGroup', selectedChat.name)
    confirmation(message, yes => {
      if (yes) {
        ipcRenderer.send('dispatch', 'leaveGroup', selectedChat.id)
      }
    })
  }

  onArchiveChat (archive) {
    const selectedChat = this.props.selectedChat
    ipcRenderer.send('dispatch', 'archiveChat', selectedChat.id, archive)
  }

  onBlockContact () {
    const selectedChat = this.props.selectedChat
    const tx = window.translate
    if (selectedChat && selectedChat.contacts.length) {
      var contact = selectedChat.contacts[0]
      var message = tx('dialogs.blockContact', contact.displayName)
      confirmation(message, yes => {
        if (yes) {
          ipcRenderer.sendSync('dispatchSync', 'blockContact', contact.id)
        }
      })
    }
  }

  onDeleteChat () {
    const selectedChat = this.props.selectedChat
    const tx = window.translate
    const message = tx('dialogs.deleteChat', selectedChat.name)
    confirmation(message, yes => {
      if (yes) {
        ipcRenderer.send('dispatch', 'deleteChat', selectedChat.id)
      }
    })
  }

  onUnblockContacts () {
    this.props.changeScreen('UnblockContacts')
  }

  onContactRequests () {
    ipcRenderer.send('dispatch', 'contactRequests')
  }

  logout () {
    ipcRenderer.send('dispatch', 'logout')
  }

  onEncrInfo () {
    this.props.openDialog('EncrInfo', { chat: this.props.selectedChat })
  }
}

class DeltaMenu extends React.Component {
  render () {
    const {
      openDialog,
      selectedChat,
      showArchivedChats
    } = this.props

    const tx = window.translate

    const isGroup = selectedChat && selectedChat.isGroup
    const controller = new Controller(this.props)

    let chatMenu = <div />

    if (selectedChat) {
      chatMenu = <div>
        <Menu.Divider />
        {showArchivedChats
          ? <MenuItem icon='export' text={tx('menu_unarchive_chat')}
            onClick={() => controller.onArchiveChat(false)} />
          : <MenuItem icon='import' text={tx('menu_archive_chat')}
            onClick={() => controller.onArchiveChat(true)} />
        }
        <MenuItem
          icon='delete'
          text={tx('menu_delete_chat')}
          onClick={controller.onDeleteChat} />
        <MenuItem
          icon='lock'
          text={tx('encryptionInfoMenu')}
          onClick={controller.onEncrInfo} />
        {isGroup
          ? (
            <div>
              <MenuItem
                icon='edit'
                text={tx('menu_edit_group')}
                onClick={controller.onEditGroup}
              />
              <MenuItem
                icon='log-out' text={tx('menu_leave_group')}
                onClick={controller.onLeaveGroup}
              />
            </div>
          ) : <MenuItem
            icon='blocked-person'
            text={tx('menu_block_contact')}
            onClick={controller.onBlockContact}
          />
        }
        <Menu.Divider />
      </div>
    } else {
      chatMenu = <Menu.Divider />
    }

    return (<Menu>
      <MenuItem icon='plus' text={tx('menu_new_chat')} onClick={controller.onCreateChat} />
      {chatMenu}
      <MenuItem
        icon='settings'
        text={tx('menu_settings')}
        onClick={() => openDialog('Settings')}
      />
      <MenuItem
        icon='person'
        text={tx('menu_deaddrop')}
        onClick={controller.onContactRequests}
      />
      <MenuItem icon='log-out' text={tx('logout')} onClick={controller.logout} />
    </Menu>)
  }
}

module.exports = DeltaMenu
