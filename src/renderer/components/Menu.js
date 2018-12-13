const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')
const autobind = require('class-autobind').default

const dialogs = require('./dialogs')
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
    dialogs.confirmation(message, yes => {
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
      dialogs.confirmation(message, yes => {
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
    dialogs.confirmation(message, yes => {
      if (yes) {
        ipcRenderer.send('dispatch', 'deleteChat', selectedChat.id)
      }
    })
  }

  onUnblockContacts () {
    this.props.changeScreen('UnblockContacts')
  }

  logout () {
    ipcRenderer.send('dispatch', 'logout')
  }
}

class DeltaMenu extends React.Component {
  render () {
    const {
      openSettings,
      selectedChat,
      showArchivedChats
    } = this.props

    const tx = window.translate

    const isGroup = selectedChatIsGroup(selectedChat)
    const controller = new Controller(this.props)

    const archiveMsg = isGroup ? tx('archiveGroup') : tx('archiveChat')
    const unArchiveMsg = isGroup ? tx('unArchiveGroup') : tx('unArchiveChat')
    const deleteMsg = isGroup ? tx('deleteGroup') : tx('deleteChat')

    let chatMenu = <div />

    if (selectedChat) {
      chatMenu = <div>
        <Menu.Divider />
        {showArchivedChats
          ? <MenuItem icon='export' text={unArchiveMsg}
            onClick={() => controller.onArchiveChat(false)} />
          : <MenuItem icon='import' text={archiveMsg}
            onClick={() => controller.onArchiveChat(true)} />
        }
        <MenuItem
          icon='delete'
          text={deleteMsg}
          onClick={controller.onDeleteChat} />
        {isGroup
          ? (
            <div>
              <MenuItem
                icon='edit'
                text={tx('editGroup')}
                onClick={controller.onEditGroup}
              />
              <MenuItem
                icon='log-out' text={tx('leaveGroup')}
                onClick={controller.onLeaveGroup}
              />
            </div>
          ) : <MenuItem
            icon='blocked-person'
            text={tx('blockContact')}
            onClick={controller.onBlockContact}
          />
        }
        <Menu.Divider />
      </div>
    }

    return (<Menu>
      <MenuItem icon='plus' text={tx('newChat')} onClick={controller.onCreateChat} />
      {chatMenu}
      <MenuItem
        icon='settings'
        text={tx('settingsTitle')}
        onClick={openSettings}
      />
      <MenuItem icon='log-out' text={tx('logout')} onClick={controller.logout} />
    </Menu>)
  }
}

function selectedChatIsGroup (chat) {
  return [
    C.DC_CHAT_TYPE_GROUP,
    C.DC_CHAT_TYPE_VERIFIED_GROUP
  ].includes(chat && chat.type)
}

module.exports = DeltaMenu
