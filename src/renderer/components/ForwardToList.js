const React = require('react')
const { ipcRenderer } = require('electron')
const SearchableList = require('./SearchableList')
const chatListStore = require('../stores/chatList')

const ChatListItem = require('./ChatListItem')

class ForwardToList extends SearchableList {
  constructor (props) {
    super(props)
    this.state.showVerifiedContacts = false
    this.handleSearch = this.handleSearch.bind(this)
    this.search = this.search.bind(this)
    this.filterChatList = this.filterChatList.bind(this)
  }

  filterChatList (chatListState) {
    const { chatList, filteredChatIdList } = chatListState
    let data = []
    chatList.map(chat => {
      if (filteredChatIdList.indexOf(chat.id) > -1) {
        data.push(chat)
      }
    })
    this.setState({ data })
  }

  componentDidMount () {
    chatListStore.subscribe(this.filterChatList)
    this.search('')
  }

  componentWillUnmount () {
    chatListStore.unsubscribe(this.filterChatList)
  }

  search (queryStr) {
    this.setState({ queryStr })
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'getForwardChatList',
      0,
      queryStr
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
