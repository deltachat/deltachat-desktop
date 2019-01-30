const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class CreateGroup extends GroupBase {
  constructor (props) {
    const { verified } = props.screenProps
    const label = verified ? 'menu_new_verified_group' : 'menu_new_group'
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
      'createGroupChat',
      verified,
      this.state.name,
      this.state.image,
      contactIds
    )
    this.props.changeScreen('ChatList')
  }
}

module.exports = CreateGroup
