const React = require('react')
const ChatListContextMenu = require('./ChatListContextMenu').default
const ChatListItem = require('./ChatListItem').default
const mapCoreMsgStatus2String = require('./helpers/MapMsgStatus')
const styled = require('styled-components').default

const log = require('../../logger').getLogger('renderer/chatView')

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
  }

  .module-conversation-list-item:hover {
    background-color: ${props => props.theme.chatListItemBgHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${props => props.theme.chatListItemSelectedBg};
    color: ${props => props.theme.chatListItemSelectedText};

    span.module-contact-name {
      color: ${props => props.theme.chatListItemSelectedText};
    }

    .module-conversation-list-item__is-group {
      filter: unset;
    }

    &:hover {
        background-color: var(--chatListItemSelectedBg);
    }
  }

  .module-conversation-list-item__header__name {
    width: 90%;
  }

  .status-icon {
    flex-shrink: 0;
    margin-top: 2px;
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

class ChatList extends React.Component {
  constructor (props) {
    super(props)
    this.realOpenContextMenu = null
  }

  componentDidMount () {
    this.doc = document.querySelector(`.${ChatListWrapper.styledComponentId}`)
    if (!this.doc) return log.warn(`Didn't find .ChatListWrapper .ConversationList`)
  }

  openContextMenu (event, chatId) {
    if (this.realOpenContextMenu === null) throw new Error('Tried to open ChatListContextMenu before we recieved open method')
    const chat = this.props.chatList.find(chat => chat.id === chatId)
    this.realOpenContextMenu(event, chat)
  }

  render () {
    const { onDeadDropClick, chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')
    const self = this
    return (
      <div>
        <ChatListWrapper>
          { !chatList.length && (<ChatListNoChats><p>{missingChatsMsg}</p></ChatListNoChats>) }
          <div className='ConversationList' ref={this.chatListDiv}>
            {chatList.map((chatListItem, i) => {
              if (!chatListItem) return

              // Don't show freshMessageCounter on selected chat
              if (chatListItem.deaddrop) {
                const name = `${tx('new_message_from_desktop')} ${chatListItem.name}`
                return (
                  <ContactRequestItemWrapper key={chatListItem.id}>
                    <ChatListItem
                      className='contactrequest'
                      chatListItem={chatListItem}
                      onClick={() => onDeadDropClick(chatListItem.deaddrop)}
                      isSelected={chatListItem.id === selectedChatId}
                    />
                  </ContactRequestItemWrapper>)
              } else if (chatListItem.isArchiveLink) {
                return (
                  <ArchivedChats key={chatListItem.id}>
                    <ChatListItem
                      onClick={this.props.onShowArchivedChats}
                      chatListItem={chatListItem}
                    />
                  </ArchivedChats>
                )
              } else {
                return (
                  <ChatListItem
                    key={chatListItem.id}
                    chatListItem={chatListItem}
                    onClick={this.props.onChatClick.bind(null, chatListItem.id)}
                    isSelected={chatListItem.id === selectedChatId}
                    onContextMenu={(event) => { this.openContextMenu(event, chatListItem.id) }}
                  />
                )
              }
            })}
          </div>
        </ChatListWrapper>
        <ChatListContextMenu
          showArchivedChats={showArchivedChats}
          getShow={show => { self.realOpenContextMenu = show }}
        />
      </div>
    )
  }
}

module.exports = ChatList
