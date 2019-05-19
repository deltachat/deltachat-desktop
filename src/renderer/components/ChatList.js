const React = require('react')
const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const ChatListContextMenu = require('./ChatListContextMenu')
const ChatListItem = require('./ChatListItem')
const styled = require('styled-components').default
const StyleVariables = require('./style-variables')

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
    this.doc.onscroll = this.onScroll.bind(this)
  }

  onScroll () {
    var element = this.doc
    var fetch = (element.scrollHeight - element.scrollTop) === element.clientHeight
    if (fetch) this.fetchNextChats()
  }

  fetchNextChats () {
    if (this.props.totalChats === this.props.chatList.length) return
    ipcRenderer.send('fetchChats')
  }

  openMenu (chatId, e) {
    e.persist()
    this.contextMenu.current.show(chatId, e)
  }

  render () {
    const { onDeadDropClick, chatList, selectedChatId, showArchivedChats } = this.props
    const tx = window.translate
    const missingChatsMsg = tx(showArchivedChats ? 'no_archived_chats_desktop' : 'no_chats_desktop')

    if (this.doc) {
      var allowedScroll = this.doc.scrollHeight > this.doc.clientHeight
      if (!allowedScroll) this.fetchNextChats()
    }

    return (
      <div>
        <ChatListWrapper>
          { !chatList.length && (<ChatListNoChats><p>{missingChatsMsg}</p></ChatListNoChats>) }
          <div className='ConversationList' ref={this.chatListDiv}>
            {chatList.map((chatListItem, i) => {
              if (!chatListItem) return
              const i18n = window.translate
              const lastUpdated = chatListItem.summary.timestamp ? chatListItem.summary.timestamp * 1000 : null

              // Don't show freshMessageCounter on selected chat
              if (chatListItem.id === C.DC_CHAT_ID_DEADDROP) {
                const name = `${tx('new_message_from_desktop')} ${chatListItem.name}`
                return (
                  <ContactRequestItemWrapper key={i}>
                    <ChatListItem
                      className='contactrequest'
                      name={name}
                      i18n={i18n}
                      phoneNumber={chatListItem.summary.text1}
                      lastUpdated={lastUpdated}
                      lastMessage={{
                        text2: chatListItem.summary.text2,
                        status: 'delivered'
                      }}
                      onClick={() => onDeadDropClick(chatListItem.deaddrop)}
                      isSelected={chatListItem.id === selectedChatId}
                      unreadCount={chatListItem.freshMessageCounter}

                    />
                  </ContactRequestItemWrapper>)
              } else if (chatListItem.id === C.DC_CHAT_ID_ARCHIVED_LINK) {
                return (
                  <ArchivedChats key={i}>
                    <ChatListItem
                      onClick={this.props.onShowArchivedChats}
                      name={chatListItem.name}
                      i18n={i18n} />
                  </ArchivedChats>
                )
              } else {
                return (
                  <ChatListItem
                    key={chatListItem.id}
                    onClick={this.props.onChatClick.bind(null, chatListItem.id)}
                    phoneNumber={chatListItem.summary.text1}
                    name={chatListItem.name}
                    avatarPath={chatListItem.profileImage}
                    color={chatListItem.color}
                    lastUpdated={lastUpdated}
                    lastMessage={{
                      text1: chatListItem.summary.text1,
                      text1Meaning: chatListItem.summary.text1Meaning,
                      text2: chatListItem.summary.text2,
                      status: 'sent' // TODO: interpret data from summary to get correct state
                    }}
                    i18n={i18n}
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
          showArchivedChats={showArchivedChats}
          openDialog={this.props.openDialog}
          changeScreen={this.props.changeScreen} />
      </div>
    )
  }
}

module.exports = ChatList
