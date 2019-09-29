const React = require('react')
const { callDcMethod } = require('../ipc')
const styled = require('styled-components').default
const ScreenContext = require('../contexts/ScreenContext')

const Media = require('./Media')
const Menu = require('./Menu').default
const ChatList = require('./ChatList').default
const ChatView = require('./ChatView')
const SearchInput = require('./SearchInput').default
const SettingsContext = require('../contexts/SettingsContext')

const NavbarWrapper = require('./NavbarWrapper')

const chatStore = require('../stores/chat')

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
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.onMapIconClick = this.onMapIconClick.bind(this)

    this.chatView = React.createRef()
    this.chatClicked = 0
  }

  onChatUpdate (chat) {
    this.setState({ selectedChat: chat })
  }

  componentDidMount () {
    chatStore.subscribe(this.onChatUpdate)
  }

  componentWillUnmount () {
    chatStore.unsubscribe(this.onChatUpdate)
  }

  showArchivedChats (showArchivedChats) {
    this.setState({ showArchivedChats })
  }

  onChatClick (chatId) {
    if (chatId === this.chatClicked) {
      // avoid double clicks
      return
    }
    this.chatClicked = chatId
    callDcMethod('selectChat', [chatId])
    setTimeout(() => { this.chatClicked = 0 }, 500)
    try {
      if (this.chatView.current) {
        this.chatView.current.refComposer.current.messageInputRef.current.focus()
      }
    } catch (error) {
      log.debug(error)
    }
  }

  searchChats (queryStr) {
    this.setState({ queryStr })
  }

  handleSearchChange (event) {
    this.searchChats(event.target.value)
  }

  onMapIconClick () {
    const { selectedChat } = this.state
    this.context.openDialog('MapDialog', { selectedChat })
  }

  render () {
    const { selectedChat, showArchivedChats, queryStr } = this.state

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
              <SearchInput
                onChange={this.handleSearchChange}
                value={this.state.queryStr}
                className='icon-rotated'
              />
              { showArchivedChats && (
                <Button
                  className={[Classes.MINIMAL, 'icon-rotated']}
                  icon='undo' onClick={this.onHideArchivedChats}
                  aria-label={tx('a11y_back_btn_label')} />
              ) }
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <NavbarHeading>
                <NavbarGroupName>{selectedChat ? selectedChat.name : ''}</NavbarGroupName>
                <NavbarGroupSubtitle>{selectedChat ? selectedChat.subtitle : ''}</NavbarGroupSubtitle>
              </NavbarHeading>
              {selectedChat && <Button
                onClick={() => this.setState({ media: !this.state.media })}
                minimal
                icon={this.state.media ? 'chat' : 'media'}
                aria-label={tx(`a11y_goto_${this.state.media ? 'chat' : 'media'}_label`)} />}
              {selectedChat &&

              <SettingsContext.Consumer>
                {({ enableOnDemandLocationStreaming }) => (
                  enableOnDemandLocationStreaming &&
                  <Button minimal icon='map' onClick={this.onMapIconClick} aria-label={tx('a11y_map_btn_label')} />
                )}
              </SettingsContext.Consumer>
              }
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className='icon-rotated' minimal icon='more' id='main-menu-button' aria-label={tx('a11y_main_menu_label')} />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <div>
          <ChatList
            queryStr={queryStr}
            showArchivedChats={showArchivedChats}
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
                  <img src={'../images/image-80.svg'} className='welcome-image' />
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
