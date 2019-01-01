const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const Media = require('./Media')
const Menu = require('./Menu')
const ChatList = require('./ChatList')
const ChatView = require('./ChatView')
const Centered = require('./helpers/Centered')
const SearchInput = require('./SearchInput.js')

const Unselectable = require('./helpers/Unselectable')
const StyleVariables = require('./style-variables')
const NavbarWrapper = require('./NavbarWrapper')

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

const NavbarGroupName = styled.div`
  font-size: medium;
  font-weight: bold;
`
const NavbarGroupSubtitle = styled.div`
  font-size: small;
  font-weight: 100;
  color: ${StyleVariables.colors.deltaPrimaryFgLight};
`
const BelowNavbar = styled.div`
  height: calc(100vh - 50px);
  margin-top: 50px;
`

class SplittedChatListAndView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      queryStr: '',
      media: false
    }

    this.onShowArchivedChats = this.showArchivedChats.bind(this, true)
    this.onHideArchivedChats = this.showArchivedChats.bind(this, false)
    this.onChatClick = this.onChatClick.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)
  }

  componentDidMount () {
    this.searchChats('')
  }

  showArchivedChats (show) {
    ipcRenderer.send('dispatch', 'showArchivedChats', show)
  }

  onChatClick (chatId) {
    ipcRenderer.send('dispatch', 'selectChat', chatId)
  }

  searchChats (queryStr) {
    this.setState({ queryStr })
    ipcRenderer.send('dispatch', 'searchChats', queryStr)
  }

  onDeadDropClick (deadDrop) {
    this.props.openDialog('DeadDrop', { deadDrop })
  }

  handleSearchChange (event) {
    this.searchChats(event.target.value)
  }

  render () {
    const { deltachat } = this.props
    const { selectedChat, showArchivedChats } = deltachat

    const tx = window.translate

    const menu = <Menu
      openDialog={this.props.openDialog}
      changeScreen={this.props.changeScreen}
      selectedChat={selectedChat}
      showArchivedChats={showArchivedChats}
    />

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
              <img src={selectedChat ? selectedChat.profileImage : null} />
              <NavbarHeading>
                <NavbarGroupName>{selectedChat ? selectedChat.name : ''}</NavbarGroupName>
                <NavbarGroupSubtitle>{selectedChat ? selectedChat.subtitle : ''}</NavbarGroupSubtitle>
              </NavbarHeading>
              {selectedChat && <Button
                onClick={() => this.setState({ media: !this.state.media })}
                minimal
                icon={this.state.media ? 'chat' : 'media'} />}
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className='icon-rotated' minimal icon='more' />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <BelowNavbar>
          <ChatList
            chatList={deltachat.chatList}
            onDeadDropClick={this.onDeadDropClick}
            onShowArchivedChats={this.onShowArchivedChats}
            onChatClick={this.onChatClick}
            showArchivedChats={deltachat.showArchivedChats}
            selectedChatId={selectedChat ? selectedChat.id : null}
          />
          {
            selectedChat
              ? this.state.media ? <Media
                openDialog={this.props.openDialog}
                chat={selectedChat}
              />
                : (<ChatView
                  screenProps={this.props.screenProps}
                  onDeadDropClick={this.onDeadDropClick}
                  userFeedback={this.props.userFeedback}
                  changeScreen={this.props.changeScreen}
                  openDialog={this.props.openDialog}
                  chat={selectedChat}
                  deltachat={this.props.deltachat} />)
              : (
                <Unselectable>
                  <Centered>
                    <div className='window '>
                      <h1>{tx('welcome_desktop')}</h1>
                      <p>{tx('no_chat_selected_suggestion_desktop')}</p>
                    </div>
                  </Centered>
                </Unselectable>
              )
          }
        </BelowNavbar>

      </div>
    )
  }
}

module.exports = SplittedChatListAndView
