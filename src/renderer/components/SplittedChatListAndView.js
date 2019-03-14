const React = require('react')
const { ipcRenderer } = require('electron')
const styled = require('styled-components').default

const Media = require('./Media')
const Menu = require('./Menu')
const ChatList = require('./ChatList')
const ChatView = require('./ChatView')
const SearchInput = require('./SearchInput.js')

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
      media: false
    }

    this.onShowArchivedChats = this.showArchivedChats.bind(this, true)
    this.onHideArchivedChats = this.showArchivedChats.bind(this, false)
    this.onChatClick = this.onChatClick.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)

    this.chatView = React.createRef()
  }

  componentDidMount () {
    this.searchChats('')
  }

  showArchivedChats (show) {
    ipcRenderer.send('showArchivedChats', show)
  }

  onChatClick (chatId) {
    ipcRenderer.send('selectChat', chatId)
    console.log('chatId:', chatId)
    ipcRenderer.send('getLocations', 10, 10)
    try {
      if (this.chatView.current) {
        this.chatView.current.refComposer.current.messageInputRef.current.focus()
      }
    } catch (error) {
      console.debug(error)
    }
  }

  searchChats (queryStr) {
    this.setState({ queryStr })
    ipcRenderer.send('searchChats', queryStr)
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
    const profileImage = selectedChat && selectedChat.profileImage

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
              {profileImage && <img src={profileImage} />}
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
        <div>
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
                  ref={this.chatView}
                  screenProps={this.props.screenProps}
                  onDeadDropClick={this.onDeadDropClick}
                  userFeedback={this.props.userFeedback}
                  changeScreen={this.props.changeScreen}
                  openDialog={this.props.openDialog}
                  chat={selectedChat}
                  deltachat={this.props.deltachat} />)
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

module.exports = SplittedChatListAndView
