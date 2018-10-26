const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class CreateGroup extends GroupBase {
  constructor (props) {
    super(props, {
      buttonLabel: 'createGroup',
      heading: 'createGroup'
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
      contactIds
    )
    this.props.changeScreen('ChatList')
  }
}

module.exports = CreateGroup
