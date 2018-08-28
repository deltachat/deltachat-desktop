const React = require('react')
const {ipcRenderer} = require('electron')

const Chats = require('./chats')
const ChatView = require('./chatview')
const CreateChat = require('./createChat')
const CreateGroup = require('./createGroup')
const CreateContact = require('./createContact')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'Chats',
      screenProps: {}
    }
    this.changeScreen = this.changeScreen.bind(this)
  }

  changeScreen (screen, screenProps) {
    if (!screen) screen = Chats
    if (!screenProps) screenProps = {}
    this.setState({screen, screenProps})
    ipcRenderer.send('render')
  }

  render () {
    // renderer/main.js polls every second and updates the deltachat
    // property with current state of database.
    const {deltachat} = this.props
    const {screen, screenProps} = this.state

    var Screen
    switch (screen) {
      case 'CreateChat':
        Screen = CreateChat
        break
      case 'CreateContact':
        Screen = CreateContact
        break
      case 'CreateGroup':
        Screen = CreateGroup
        break
      case 'ChatView':
        Screen = ChatView
        break
      default:
        Screen = Chats
        break
    }

    return (
      <div>
        <Screen
          screenProps={screenProps}
          changeScreen={this.changeScreen}
          deltachat={deltachat}
        />
      </div>
    )
  }
}

module.exports = Home
