const React = require('react')
const C = require('deltachat-node/constants')
const { ConversationListItem } = require('./conversations')
const styled = require('styled-components').default

const ChatListWrapper = styled.div`
  width: 30%;
  height: 100%;
  float: left;
  border-right: 1px solid rgba(16, 22, 26, 0.1);
  overflow-y: auto;
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
                <ContactRequestItemWrapper>
                <ConversationListItem
                    className="contactrequest"
                  key={i}
                  name={name}
                  i18n={i18n}
                  phoneNumber={chat.summary.text1}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'delivered'
                  }}
                  onClick={this.props.onDeadDropClick.bind(null, chat)}
                  isSelected={chat.id === selectedChatId}
                  unreadCount={chat.freshMessageCounter}
                  />
                </ContactRequestItemWrapper>)
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
