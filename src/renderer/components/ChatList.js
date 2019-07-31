const React = require('react')
const ChatListContextMenu = require('./ChatListContextMenu').default
const ChatListItem = require('./ChatListItem')
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
    color: #232323;
  }

  .module-conversation-list-item:hover {
    background-color: ${props => props.theme.deltaHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${props => props.theme.deltaSelected};
    color: ${props => props.theme.deltaPrimaryFg};

    span.module-contact-name {
      color: ${props => props.theme.deltaPrimaryFg};
    }

    .module-conversation-list-item__is-group {
      filter: unset;
    }

    &:hover {
      background-color: ${props => props.theme.deltaSelected};
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

class ChatList extends React.Component {
  constructor (props) {
    super(props)
    this.contextMenu = React.createRef()
  }

  componentDidMount () {
    this.doc = document.querySelector(`.${ChatListWrapper.styledComponentId}`)
    if (!this.doc) return log.warn(`Didn't find .ChatListWrapper .ConversationList`)
  }

  openMenu (chatId, e) {
    e.persist()
    this.contextMenu.current.show(chatId, e)
  }

  render () {
    const { onDeadDropClick, chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

    return (
      <div>
        <ChatListWrapper>
          { !chatList.length && (<ChatListNoChats><p>{missingChatsMsg}</p></ChatListNoChats>) }
          <div className='ConversationList' ref={this.chatListDiv}>
            {chatList.map((chatListItem, i) => {
              if (!chatListItem) return
              const lastUpdated = chatListItem.summary.timestamp ? chatListItem.summary.timestamp * 1000 : null

              // Don't show freshMessageCounter on selected chat
              if (chatListItem.deaddrop) {
                const name = `${tx('new_message_from_desktop')} ${chatListItem.name}`
                return (
                  <ContactRequestItemWrapper key={i}>
                    <ChatListItem
                      className='contactrequest'
                      name={name}
                      lastUpdated={lastUpdated}
                      lastMessage={{
                        text1: chatListItem.summary.text1,
                        text2: chatListItem.summary.text2,
                        status: 'delivered'
                      }}
                      onClick={() => onDeadDropClick(chatListItem.deaddrop)}
                      isSelected={chatListItem.id === selectedChatId}
                      unreadCount={chatListItem.freshMessageCounter}
                    />
                  </ContactRequestItemWrapper>)
              } else if (chatListItem.isArchiveLink) {
                return (
                  <ArchivedChats key={chatListItem.id}>
                    <ChatListItem
                      onClick={this.props.onShowArchivedChats}
                      name={chatListItem.name}
                    />
                  </ArchivedChats>
                )
              } else {
                return (
                  <ChatListItem
                    key={chatListItem.id}
                    onClick={this.props.onChatClick.bind(null, chatListItem.id)}
                    email={chatListItem.summary.text1}
                    name={chatListItem.name}
                    avatarPath={chatListItem.profileImage}
                    color={chatListItem.color}
                    lastUpdated={lastUpdated}
                    lastMessage={{
                      text1: chatListItem.summary.text1,
                      text2: chatListItem.summary.text2,
                      status: mapCoreMsgStatus2String(chatListItem.summary.state)
                    }}
                    isSelected={chatListItem.id === selectedChatId}
                    isVerified={chatListItem.isVerified}
                    isGroup={chatListItem.isGroup}
                    unreadCount={chatListItem.freshMessageCounter}
                    onContextMenu={this.openMenu.bind(this, chatListItem.id)}
                  />
                )
              }
            })}
          </div>
        </ChatListWrapper>
        <ChatListContextMenu
          ref={this.contextMenu}
          chatList={chatList}
          showArchivedChats={showArchivedChats}
        />
      </div>
    )
  }
}

module.exports = ChatList
