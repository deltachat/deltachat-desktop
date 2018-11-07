const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class CreateGroup extends GroupBase {
  constructor (props) {
    super(props, {
      buttonLabel: 'newGroup',
      heading: 'newGroup'
    })
  }

  isButtonDisabled () {
    if (!this.state.name.length) return true
    if (!Object.keys(this.state.group).length) return true
    return false
  }

  onSubmit () {
    const contactIds = Object.keys(this.state.group)
    ipcRenderer.sendSync(
      'dispatchSync',
      'createUnverifiedGroup',
      this.state.name,
      this.state.image,
      contactIds
    )
    this.props.changeScreen('ChatList')
  }
}

module.exports = CreateGroup
