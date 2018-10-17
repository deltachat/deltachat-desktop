const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class CreateGroup extends GroupBase {
  constructor (props) {
    super(props, {
      buttonLabel: 'createGroup',
      heading: 'createGroup'
    })
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
