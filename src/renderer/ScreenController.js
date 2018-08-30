const React = require('react')
const { ipcRenderer } = require('electron')

const ChatList = require('./components/ChatList')
const ChatView = require('./components/ChatView')
const CreateChat = require('./components/CreateChat')
const CreateGroup = require('./components/CreateGroup')
const CreateContact = require('./components/CreateContact')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: 'ChatList',
      screenProps: {}
    }
    this.changeScreen = this.changeScreen.bind(this)
  }

  changeScreen (screen, screenProps) {
    if (!screen) screen = ChatList
    if (!screenProps) screenProps = {}
    this.setState({ screen, screenProps })
    ipcRenderer.send('render')
  }

  render () {
    // renderer/main.js polls every second and updates the deltachat
    // property with current state of database.
    const { deltachat } = this.props
    const { screen, screenProps } = this.state

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
        Screen = ChatList
        break
    }

    return (
      <Screen
        screenProps={screenProps}
        changeScreen={this.changeScreen}
        deltachat={deltachat}
      />
    )
  }
}

module.exports = Home
