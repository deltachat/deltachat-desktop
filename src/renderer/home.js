const React = require('react')
const Chats = require('./chats')

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      screen: Chats
    }
    this.changeScreen = this.changeScreen.bind(this)
  }

  changeScreen (screen) {
    this.setState({screen})
  }

  render () {
    // renderer/main.js polls every second and updates the deltachat
    // property with current state of database.
    const deltachat = this.props.deltachat
    const Screen = this.state.screen
    console.log('rendering', deltachat)

    return (
      <div>
        <Screen changeScreen={this.changeScreen} deltachat={deltachat} />
      </div>
    )
  }
}

module.exports = Home
