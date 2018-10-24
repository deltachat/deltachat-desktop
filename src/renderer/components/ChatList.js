const React = require('react')
const C = require('deltachat-node/constants')
const { ConversationListItem } = require('./conversations')

class ChatList extends React.Component {
  render () {
    const { chats, selectedChatId } = this.props
    const tx = window.translate

    if (!selectedChatId) {
      return (
        <div className='ChatList'>
          <div className='ChatList-NoChats'><p>You have no chats, feel free to start a new one :)</p></div>
        </div>
      )
    }

    return (
      <div className='ChatList'>
        <div className='ConversationList'>
          {chats.map((chat) => {
            if (!chat) return
            const i18n = window.translate
            const lastUpdated = chat.summary.timestamp ? chat.summary.timestamp * 1000 : null

            // Don't show freshMessageCounter on selected chat
            const freshMessageCounter = chat.id === selectedChatId ? null : chat.freshMessageCounter
            if (chat.id === 1) {
              const name = `${tx('newMessageFrom')} ${chat.name}`
              return (
                <ConversationListItem
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
                  unreadCount={freshMessageCounter}
                />)
            } else if (chat.id === C.DC_CHAT_ID_ARCHIVED_LINK) {
              return (
                <div className='ShowArchivedChats'>
                  <ConversationListItem
                    key={chat.id}
                    onClick={this.props.onShowArchivedChats}
                    name={chat.name}
                    i18n={i18n} />
                </div>
              )
            } else {
              return (
                <ConversationListItem
                  key={chat.id}
                  onClick={this.props.onChatClick.bind(null, chat.id)}
                  phoneNumber={chat.summary.text1}
                  name={chat.name}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'sent' // TODO: interpret data from summary to get correct state
                  }}
                  i18n={i18n}
                  isSelected={chat.id === selectedChatId}
                  unreadCount={freshMessageCounter} />
              )
            }
          })}
        </div>
      </div>
    )
  }
}

module.exports = ChatList
