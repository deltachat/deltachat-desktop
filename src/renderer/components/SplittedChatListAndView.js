const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default
const ScreenContext = require('../contexts/ScreenContext')

const Media = require('./Media')
const Menu = require('./Menu').default
const ChatList = require('./ChatList')
const ChatView = require('./ChatView')
const SearchInput = require('./SearchInput.js')
const SettingsContext = require('../contexts/SettingsContext')

const NavbarWrapper = require('./NavbarWrapper')

const chatStore = require('../stores/chat')
const chatListStore = require('../stores/chatList')

const {
  Alignment,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Position,
  Popover,
  Button
} = require('@blueprintjs/core')

const log = require('../../logger').getLogger('renderer/SplittedChatListAndView')

const NavbarGroupName = styled.div`
  font-size: medium;
  font-weight: bold;
`
const NavbarGroupSubtitle = styled.div`
  font-size: small;
  font-weight: 100;
  color: ${props => props.theme.navBarGroupSubtitle};
`

const Welcome = styled.div`
  width: 70%;
  float: right;
  height: calc(100vh - 50px);
  margin-top: 50px;
  text-align: center;
`

class SplittedChatListAndView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      queryStr: '',
      media: false,
      selectedChat: null,
      chatList: [],
      archivedChatList: [],
      filteredChatList: [],
      showArchivedChats: false
    }

    this.onShowArchivedChats = this.showArchivedChats.bind(this, true)
    this.onHideArchivedChats = this.showArchivedChats.bind(this, false)
    this.onChatClick = this.onChatClick.bind(this)
    this.onChatUpdate = this.onChatUpdate.bind(this)
    this.onChatListUpdate = this.onChatListUpdate.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)
    this.onMapIconClick = this.onMapIconClick.bind(this)

    this.chatView = React.createRef()
    this.chatClicked = 0
  }

  onChatUpdate (chat) {
    this.setState({ selectedChat: chat })
  }

  onChatListUpdate (state) {
    const { chatList, archivedChatList } = state
    this.setState({ chatList, archivedChatList })
    this.searchChats(this.state.queryStr)
  }

  componentDidMount () {
    chatStore.subscribe(this.onChatUpdate)
    chatListStore.subscribe(this.onChatListUpdate)
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'updateChatList')
  }

  componentWillUnmount () {
    chatStore.unsubscribe(this.onChatUpdate)
    chatListStore.unsubscribe(this.onChatListUpdate)
  }

  showArchivedChats (showArchivedChats) {
    this.setState({ showArchivedChats })
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'showArchivedChats', showArchivedChats)
  }

  onChatClick (chatId) {
    if (chatId === this.chatClicked) {
      // avoid double clicks
      return
    }
    this.chatClicked = chatId
    ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'selectChat', chatId)
    setTimeout(() => { this.chatClicked = 0 }, 500)
    try {
      if (this.chatView.current) {
        this.chatView.current.refComposer.current.messageInputRef.current.focus()
      }
    } catch (error) {
      log.debug(error)
    }
  }

  onDeadDropClick (deadDrop) {
    this.context.openDialog('DeadDrop', { deadDrop })
  }

  searchChats (queryStr) {
    const { chatList, archivedChatList, showArchivedChats } = this.state
    let filteredChatList = chatList
    if (showArchivedChats) {
      filteredChatList = archivedChatList
    }
    this.setState({ queryStr })
    if (queryStr.length > 0) {
      filteredChatList = filteredChatList.filter(chat =>
        `${chat.name}`.toLowerCase().indexOf(queryStr.toLowerCase()) !== -1
      )
    }
    this.setState({ filteredChatList })
  }

  handleSearchChange (event) {
    this.searchChats(event.target.value)
  }

  onMapIconClick () {
    const { selectedChat } = this.state
    this.context.openDialog('MapDialog', { selectedChat })
  }

  render () {
    const { selectedChat, filteredChatList, showArchivedChats } = this.state

    const tx = window.translate

    const menu = <ScreenContext.Consumer>{(screenContext) =>
      <Menu
        selectedChat={selectedChat}
        showArchivedChats={showArchivedChats}
      />}
    </ScreenContext.Consumer>

    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              { showArchivedChats && (<Button className={[Classes.MINIMAL, 'icon-rotated']} icon='undo' onClick={this.onHideArchivedChats} />) }
              <SearchInput
                onChange={this.handleSearchChange}
                value={this.state.queryStr}
                className='icon-rotated'
              />
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <NavbarHeading>
                <NavbarGroupName>{selectedChat ? selectedChat.name : ''}</NavbarGroupName>
                <NavbarGroupSubtitle>{selectedChat ? selectedChat.subtitle : ''}</NavbarGroupSubtitle>
              </NavbarHeading>
              {selectedChat && <Button
                onClick={() => this.setState({ media: !this.state.media })}
                minimal
                icon={this.state.media ? 'chat' : 'media'} />}
              {selectedChat &&

              <SettingsContext.Consumer>
                {({ enableOnDemandLocationStreaming }) => (
                  enableOnDemandLocationStreaming &&
                  <Button minimal icon='map' onClick={this.onMapIconClick} />
                )}
              </SettingsContext.Consumer>
              }
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className='icon-rotated' minimal icon='more' />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div>
          <ChatList
            chatList={filteredChatList}
            showArchivedChats={showArchivedChats}
            onDeadDropClick={this.onDeadDropClick}
            onShowArchivedChats={this.onShowArchivedChats}
            onChatClick={this.onChatClick}
            selectedChatId={selectedChat ? selectedChat.id : null}
          />
          {
            selectedChat
              ? selectedChat.id
                ? this.state.media ? <Media
                  chat={selectedChat}
                />
                  : (<ChatView
                    ref={this.chatView}
                    chat={selectedChat}
                    onDeadDropClick={this.onDeadDropClick}
                    openDialog={this.context.openDialog}
                  />)
                : (
                  <Welcome>
                    <h3>{tx('no_chat_selected_suggestion_desktop')}</h3>
                  </Welcome>
                )
              : (
                <Welcome>
                  <h1>{tx('welcome_desktop')}</h1>
                  <p>{tx('no_chat_selected_suggestion_desktop')}</p>
                </Welcome>
              )
          }
        </div>
      </div>
    )
  }
}

SplittedChatListAndView.contextType = ScreenContext

module.exports = SplittedChatListAndView
