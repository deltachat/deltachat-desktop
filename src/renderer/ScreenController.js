const React = require('react')
const { ipcRenderer } = require('electron')

const Login = require('./components/Login')
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
      screenProps: {},
      message: false
    }
    this.changeScreen = this.changeScreen.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
  }

  changeScreen (screen, screenProps) {
    if (!screen) screen = ChatList
    if (!screenProps) screenProps = {}
    this.setState({ screen, screenProps })
    ipcRenderer.send('render')
  }

  userFeedback (message) {
    var self = this
    setTimeout(function () {
      self.setState({ message: false })
    }, 3000)
    self.setState({ message })
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('error', function (e, text) {
      self.userFeedback({ type: 'error', text })
    })
  }

  render () {
    // renderer/main.js polls every second and updates the deltachat
    // property with current state of database.
    const { credentials, deltachat } = this.props
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

    var type = this.state.message.type
    var classNames = `user-feedback ${type}`

    return (
      <div>
        {this.state.message && (
          <div className={classNames}>
            {this.state.message.text}
          </div>
        )}
        {!deltachat.ready
          ? <Login credentials={credentials} />
          : <Screen
            screenProps={screenProps}
            userFeedback={this.userFeedback}
            changeScreen={this.changeScreen}
            deltachat={deltachat}
          />
        }
      </div>
    )
  }
}

module.exports = Home
