const React = require('react')
const C = require('deltachat-node/constants')
const ChatListItem = require('./ChatListItem')
const styled = require('styled-components').default
const StyleVariables = require('./style-variables')
const { ContextMenu, MenuItem } = require('react-contextmenu')
const confirmation = require('./dialogs/confirmationDialog')

const { ipcRenderer } = require('electron')
const { Icon } = require('@blueprintjs/core')

const ChatListWrapper = styled.div`
  width: 30%;
  height: calc(100vh - 50px);
  float: left;
  overflow-y: auto;
  border-right: 1px solid #b9b9b9;
  box-shadow: 0 0 4px 1px rgba(16, 22, 26, 0.1), 0 0 0 rgba(16, 22, 26, 0), 0 1px 1px rgba(16, 22, 26, 0.2);
  user-select: none;
  margin-top: 50px;

  span.module-contact-name {
    font-weight: 200;
    font-size: medium;
    color: #232323;
  }

  .module-conversation-list-item:hover {
    background-color: ${StyleVariables.colors.deltaHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${StyleVariables.colors.deltaSelected};
    color: ${StyleVariables.colors.deltaPrimaryFg};
    
    span.module-contact-name {
      color: ${StyleVariables.colors.deltaPrimaryFg};
    }

    .module-conversation-list-item__is-group {
      filter: unset; 
    }

    &:hover {
      background-color: ${StyleVariables.colors.deltaSelected};
    }
  }

  .module-conversation-list-item__header__name {
    width: 90%;
  }

  .module-conversation-list-item__message__status-icon {
    margin-left: calc(100% - 90% - 12px);
  }

}
`

const ChatListNoChats = styled.div`
  height: 52px;
  text-align: center;
  padding-top: calc((52px - 14px) / 2);
  padding: 5px;

  p {
    margin: 0 auto;
  }
`

const ContactRequestItemWrapper = styled.div`
  .module-conversation-list-item {
    background-color:#ccc;
  }

  .module-conversation-list-item:hover {
    background-color:#bbb;
  }
`

const ArchivedChats = styled.div`
.module-conversation-list-item__avatar {
    visibility: hidden;
  }
`
class ChatContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chat: {}
    }
    this.contextMenu = React.createRef()
  }

  show (chat, e) {
    e.preventDefault()
    e.stopPropagation()
    /*
     This is a workaround because react-contextmenu
     has no official programatic way of opening the menu yet
     https://github.com/vkbansal/react-contextmenu/issues/259
    */
    const ev = { detail: { id: 'chat-options', position: { x: e.clientX, y: e.clientY } } }

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
    ipcRenderer.send('archiveChat', this.state.chat.id, archive)
  }
  onDeleteChat () {
    const tx = window.translate
    const chatId = this.state.chat.id
    confirmation(tx('ask_delete_chat_desktop'), yes => {
      if (yes) {
        ipcRenderer.send('deleteChat', chatId)
      }
    })
  }
  onEncrInfo () {
    ipcRenderer.send('getChatById', this.state.chat.id)
    ipcRenderer.once('getChatById', (e, chat) => {
      this.props.openDialog('EncrInfo', { chat })
    })
  }
  onEditGroup () {
    ipcRenderer.send('getChatById', this.state.chat.id)
    ipcRenderer.once('getChatById', (e, chat) => {
      this.props.changeScreen('EditGroup', { chat })
    })
  }
  onLeaveGroup () {
    const selectedChat = this.state.chat
    const tx = window.translate
    confirmation(tx('ask_leave_group'), yes => {
      if (yes) {
        ipcRenderer.send('leaveGroup', selectedChat.id)
        ipcRenderer.send('selectChat', selectedChat.id)
      }
    })
  }

  onBlockContact () {
    const tx = window.translate
    ipcRenderer.send('getChatById', this.state.chat.id)
    ipcRenderer.once('getChatById', (e, chat) => {
      const contactId = (chat && chat.contacts.length) ? chat.contacts[0].id : undefined
      if (!contactId) return
      confirmation(tx('ask_block_contact'), yes => {
        if (yes) {
          ipcRenderer.send('blockContact', contactId)
        }
      })
    })
  }
}

class ChatList extends React.Component {
  constructor (props) {
    super(props)

    this.contextMenu = React.createRef()
  }

  openMenu (chat, e) {
    e.persist()
    console.log(chat, e)
    this.contextMenu.current.show(chat, e)
  }

  render () {
    const { onDeadDropClick, chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

    return (
      <div>
        <ChatListWrapper>
          { !chatList.length && (<ChatListNoChats><p>{missingChatsMsg}</p></ChatListNoChats>) }
          <div className='ConversationList'>
            {chatList.map((chat, i) => {
              if (!chat) return
              const i18n = window.translate
              const lastUpdated = chat.summary.timestamp ? chat.summary.timestamp * 1000 : null

              // Don't show freshMessageCounter on selected chat
              if (chat.id === C.DC_CHAT_ID_DEADDROP) {
                const name = `${tx('new_message_from_desktop')} ${chat.name}`
                return (
                  <ContactRequestItemWrapper key={i}>
                    <ChatListItem
                      className='contactrequest'
                      name={name}
                      i18n={i18n}
                      phoneNumber={chat.summary.text1}
                      lastUpdated={lastUpdated}
                      lastMessage={{
                        text: chat.summary.text2,
                        status: 'delivered'
                      }}
                      onClick={() => onDeadDropClick(chat.deaddrop)}
                      isSelected={chat.id === selectedChatId}
                      unreadCount={chat.freshMessageCounter}

                    />
                  </ContactRequestItemWrapper>)
              } else if (chat.id === C.DC_CHAT_ID_ARCHIVED_LINK) {
                return (
                  <ArchivedChats key={i}>
                    <ChatListItem
                      onClick={this.props.onShowArchivedChats}
                      name={chat.name}
                      i18n={i18n} />
                  </ArchivedChats>
                )
              } else {
                return (
                  <ChatListItem
                    key={i}
                    onClick={this.props.onChatClick.bind(null, chat.id)}
                    phoneNumber={chat.summary.text1}
                    name={chat.name}
                    avatarPath={chat.profileImage}
                    color={chat.color}
                    lastUpdated={lastUpdated}
                    lastMessage={{
                      text: chat.summary.text2,
                      status: 'sent' // TODO: interpret data from summary to get correct state
                    }}
                    i18n={i18n}
                    isSelected={chat.id === selectedChatId}
                    isVerified={chat.isVerified}
                    isGroup={chat.isGroup}
                    unreadCount={chat.freshMessageCounter}
                    onContextMenu={this.openMenu.bind(this, chat)}
                  />
                )
              }
            })}
          </div>
        </ChatListWrapper>
        <ChatContextMenu
          ref={this.contextMenu}
          showArchivedChats={showArchivedChats}
          openDialog={this.props.openDialog}
          changeScreen={this.props.changeScreen} />
      </div>
    )
  }
}

module.exports = ChatList
