const React = require('react')
const C = require('deltachat-node/constants')
const ChatListItem = require('./ChatListItem')
const styled = require('styled-components').default
const Unselectable = require('./helpers/Unselectable')
const StyleVariables = require('./style-variables')

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

class ChatList extends React.Component {
  render () {
    const { onDeadDropClick, chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

    return (
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
                <Unselectable key={i}>
                  <div className='ShowArchivedChats'>
                    <ChatListItem
                      onClick={this.props.onShowArchivedChats}
                      name={chat.name}
                      i18n={i18n} />
                  </div>
                </Unselectable>
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
                />
              )
            }
          })}
        </div>
      </ChatListWrapper>
    )
  }
}

module.exports = ChatList
