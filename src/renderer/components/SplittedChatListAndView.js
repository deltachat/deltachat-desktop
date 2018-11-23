const React = require('react')
const { ipcRenderer } = require('electron')
const { InputGroup } = require('@blueprintjs/core')

const Menu = require('./Menu')
const dialogs = require('./dialogs')
const ChatList = require('./ChatList')
const ChatView = require('./ChatView')
const Centered = require('./helpers/Centered')

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

const styled = require('styled-components').default

const NavbarWrapper = styled.div`
  img {
    height: 40px;
    margin-left: 5px;
  }

  .bp3-navbar {
    padding: 0px;
  }

  .bp3-navbar-heading {
    margin-left: 5px;
    max-width: 250px;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .bp3-align-left {
    width: 30%;
    padding-left: 1%;
  }

  .bp3-align-right {
    width: 70%;
    float: none;
  }

  .bp3-popover-wrapper {
    margin-left: auto;
  }
`

const BelowNavbar = styled.div`
  height: calc(100vh - 50px);
  margin-top: 50px;
`

class SplittedChatListAndView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      deadDropChat: false,
      keyTransfer: false,
      queryStr: ''
    }

    this.onShowArchivedChats = this.showArchivedChats.bind(this, true)
    this.onHideArchivedChats = this.showArchivedChats.bind(this, false)
    this.onChatClick = this.onChatClick.bind(this)
    this.onDeadDropClick = this.onDeadDropClick.bind(this)
    this.onDeadDropClose = this.onDeadDropClose.bind(this)
    this.initiateKeyTransfer = this.initiateKeyTransfer.bind(this)
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
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

  onDeadDropClose () {
    this.setState({ deadDropChat: false })
  }

  onDeadDropClick (chat) {
    this.setState({ deadDropChat: chat })
  }

  onKeyTransferComplete () {
    this.setState({ keyTransfer: false })
  }

  initiateKeyTransfer () {
    this.setState({ keyTransfer: true })
  }

  handleSearchChange (event) {
    this.searchChats(event.target.value)
  }

  render () {
    const { deltachat } = this.props
    const { selectedChat, showArchivedChats } = deltachat
    const { deadDropChat, keyTransfer } = this.state

    const tx = window.translate

    const menu = <Menu
      changeScreen={this.props.changeScreen}
      selectedChat={selectedChat}
      initiateKeyTransfer={this.initiateKeyTransfer}
      showArchivedChats={showArchivedChats}
    />

    console.log(deltachat)

    return (
      <div>
        <NavbarWrapper>
          <Navbar fixedToTop>
            <NavbarGroup align={Alignment.LEFT}>
              { showArchivedChats && (<Button className={Classes.MINIMAL} icon='undo' onClick={this.onHideArchivedChats} />) }
              <InputGroup
                type='search'
                aria-label={tx('searchAriaLabel')}
                large
                placeholder={tx('searchPlaceholder')}
                value={this.state.queryStr}
                onChange={this.handleSearchChange}
                leftIcon='search'
              />
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <img src={selectedChat ? selectedChat.profileImage : null} />
              <NavbarHeading>{selectedChat ? selectedChat.name : ''}</NavbarHeading>
              <div>{selectedChat ? selectedChat.subtitle : ''}</div>
              <Popover content={menu} position={Position.RIGHT_TOP}>
                <Button className={Classes.MINIMAL} icon='menu' />
              </Popover>
            </NavbarGroup>
          </Navbar>
        </NavbarWrapper>
        <dialogs.KeyTransfer isOpen={keyTransfer} onClose={this.onKeyTransferComplete} />
        <dialogs.DeadDrop deadDropChat={deadDropChat} onClose={this.onDeadDropClose} />
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
              ? (<ChatView
                screenProps={this.props.screenProps}
                userFeedback={this.props.userFeedback}
                changeScreen={this.props.changeScreen}
                chat={selectedChat}
                deltachat={this.props.deltachat} />)
              : (
                <Centered>
                  <div className='window'>
                    <h1>{tx('chatView.nochatselectedHeader')}</h1>
                    <p>{tx('chatView.nochatselectedSuggestion')}</p>
                  </div>
                </Centered>
              )
          }
        </BelowNavbar>

      </div>
    )
  }
}

module.exports = SplittedChatListAndView
