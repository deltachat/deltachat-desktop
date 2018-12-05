const React = require('react')
const C = require('deltachat-node/constants')
const { ConversationListItem } = require('./conversations')
const styled = require('styled-components').default

const StyleVariables = require('./style-variables')

const ChatListWrapper = styled.div`
  width: 30%;
  height: 100%;
  float: left;
  border-right: 1px solid rgba(16, 22, 26, 0.1);
  overflow-y: auto;

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

class ChatList extends React.Component {
  render () {
    const { chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'noArchivedChats' : 'noChats')

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
              const name = `${tx('newMessageFrom')} ${chat.name}`
              return (
                <ConversationListItem
                  key={i}
                  name={name}
                  i18n={i18n}
                  color={'purple'}
                  phoneNumber={chat.summary.text1}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'delivered'
                  }}
                  onClick={this.props.onDeadDropClick.bind(null, chat)}
                  isSelected={chat.id === selectedChatId}
                  unreadCount={chat.freshMessageCounter}
                />)
            } else if (chat.id === C.DC_CHAT_ID_ARCHIVED_LINK) {
              return (
                <div key={i} className='ShowArchivedChats'>
                  <ConversationListItem
                    onClick={this.props.onShowArchivedChats}
                    name={chat.name}
                    i18n={i18n} />
                </div>
              )
            } else {
              return (
                <ConversationListItem
                  key={i}
                  onClick={this.props.onChatClick.bind(null, chat.id)}
                  phoneNumber={chat.summary.text1}
                  name={chat.name}
                  avatarPath={chat.profileImage}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'sent' // TODO: interpret data from summary to get correct state
                  }}
                  i18n={i18n}
                  isSelected={chat.id === selectedChatId}
                  isVerified={chat.isVerified}
                  unreadCount={chat.freshMessageCounter} />
              )
            }
          })}
        </div>
      </ChatListWrapper>
    )
  }
}

module.exports = ChatList
