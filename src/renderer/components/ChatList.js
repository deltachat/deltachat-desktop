const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')
const { ConversationListItem } = require('./conversations')



const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Position,
  Menu,
  MenuItem,
  Popover,
  Button
} = require('@blueprintjs/core')

class ChatList extends React.Component {
  constructor (props) {
    super(props)

  }

  render () {
    const { deltachat, selectedChatId } = this.props

    const tx = window.translate

    return (

      <div className="ChatList">

        <div className='ConversationList'>
          {deltachat.chats.map((chat) => {
            if (!chat) return
            if (chat.id === C.DC_CHAT_ID_ARCHIVED_LINK) return
            const i18n = window.translate
            const lastUpdated = chat.summary.timestamp ? chat.summary.timestamp * 1000 : null
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
                  onClick={this.onDeadDropClick.bind(this, chat)}
                  isSelected={chat.id === selectedChatId}
                />)
            } else {
              return (
                <ConversationListItem
                  key={chat.id}
                  onClick={this.props.onChatClick.bind(this, chat.id)}
                  phoneNumber={chat.summary.text1}
                  name={chat.name}
                  lastUpdated={lastUpdated}
                  lastMessage={{
                    text: chat.summary.text2,
                    status: 'sent' // TODO: interpret data from summary to get correct state
                  }}
                  i18n={i18n}
                  isSelected={chat.id === selectedChatId} />
              )
            }
          })}
        </div>
      </div>
    )
  }
}

module.exports = ChatList
