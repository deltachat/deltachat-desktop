const React = require('react')
const { ipcRenderer } = require('electron')
const SearchableList = require('./SearchableList')

const ChatListItem = require('./ChatListItem')

class ForwardToList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
  }

  _getData () {
    return ipcRenderer.sendSync(
      'getForwardChatList',
      0,
      this.state.queryStr
    )
  }

  renderItem (chatListItem) {
    const { onChatClick, i18n } = this.props
    const lastUpdated = chatListItem.summary.timestamp ? chatListItem.summary.timestamp * 1000 : null
    return <ChatListItem
      key={chatListItem.id}
      onClick={onChatClick.bind(null, chatListItem.id)}
      phoneNumber={chatListItem.summary.text1}
      name={chatListItem.name}
      avatarPath={chatListItem.profileImage}
      color={chatListItem.color}
      lastUpdated={lastUpdated}
      lastMessage={{
        text1: chatListItem.summary.text1,
        text2: chatListItem.summary.text2,
        status: 'sent' // TODO: interpret data from summary to get correct state
      }}
      i18n={i18n}
      isSelected={false}
      isVerified={chatListItem.isVerified}
      isGroup={chatListItem.isGroup}
      unreadCount={null}
    />
  }
}
module.exports = ForwardToList
