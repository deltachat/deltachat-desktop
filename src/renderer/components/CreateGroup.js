const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class CreateGroup extends GroupBase {
  constructor (props) {
    const { verified } = props.screenProps
    const label = verified ? 'newVerifiedGroup' : 'newGroup'
    super(props, {
      buttonLabel: label,
      heading: label,
      showVerifiedContacts: verified,
      showQrVerifyCodeButton: verified
    })
  }

  isButtonDisabled () {
    if (!this.state.name.length) return true
    if (!Object.keys(this.state.group).length) return true
    return false
  }

  onSubmit () {
    const contactIds = Object.keys(this.state.group)
    const { verified } = this.props.screenProps
    ipcRenderer.sendSync(
      'dispatchSync',
      verified ? 'createVerifiedGroup' : 'createUnverifiedGroup',
      this.state.name,
      this.state.image,
      contactIds
    )
    this.props.changeScreen('ChatList')
  }
}

module.exports = CreateGroup
