const React = require('react')
const {ipcRenderer} = require('electron')

const Chats = require('./chats')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      Screen: Chats,
      screenProps: {}
    }
    this.changeScreen = this.changeScreen.bind(this)
  }

  changeScreen (Screen, screenProps) {
    if (!Screen) Screen = Chats
    if (!screenProps) screenProps = {}
    this.setState({Screen, screenProps})
    ipcRenderer.send('render')
  }

  render () {
    // renderer/main.js polls every second and updates the deltachat
    // property with current state of database.
    const {deltachat} = this.props
    const {Screen, screenProps} = this.state
    console.log('rendering', Screen, deltachat)

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
