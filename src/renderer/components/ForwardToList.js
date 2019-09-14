const React = require('react')
const SearchableList = require('./SearchableList').default

const ChatListItem = require('./ChatListItem').default

class ForwardToList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
  }

  _getData () {
    const { filterFunction, chatList } = this.props
    if (!chatList || chatList.length === 0) {
      return []
    }
    let data = chatList
    if (filterFunction) {
      data = chatList.filter(filterFunction)
    }
    data = data.filter(chat =>
      `${chat.name}`.indexOf(this.state.queryStr) !== -1 && !chat.deaddrop && !chat.isArchiveLink
    )
    return data
  }

  renderItem (chatListItem) {
    const { onChatClick } = this.props
    return <ChatListItem
      key={chatListItem.id}
      onClick={onChatClick.bind(null, chatListItem.id)}
      chatListItem={chatListItem}
    />
  }
}
module.exports = ForwardToList
