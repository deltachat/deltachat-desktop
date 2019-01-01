const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const GroupBase = require('./GroupBase')
const differ = require('array-differ')

class EditGroup extends GroupBase {
  constructor (props) {
    const { chat } = props.screenProps
    const group = {}

    super(props, {
      buttonLabel: 'save_desktop',
      heading: 'menu_edit_group',
      group: group,
      name: chat.name,
      image: chat.profileImage,
      showVerifiedContacts: chat.isVerified,
      showQrInviteCodeButton: chat.isVerified,
      chatId: chat.id
    })

    this.before = ipcRenderer.sendSync(
      'dispatchSync',
      'getChatContacts',
      chat.id)
      .filter(id => id !== C.DC_CONTACT_ID_SELF)
      .map(id => Number(id))
    this.before.forEach(id => { group[id] = true })
  }

  isButtonDisabled () {
    return !this.state.name.length
  }

  back () {
    this.props.changeScreen('ChatList')
  }

  onSubmit () {
    const after = Object.keys(this.state.group).map(id => Number(id))
    const remove = differ(this.before, after)
    const add = differ(after, this.before)
    const { chat } = this.props.screenProps

    ipcRenderer.send(
      'dispatch',
      'modifyGroup',
      chat.id,
      this.state.name,
      this.state.image,
      remove,
      add
    )

    this.props.changeScreen('ChatList')
  }
}

module.exports = EditGroup
