const { ipcRenderer } = require('electron')
const C = require('deltachat-node/constants')
const GroupBase = require('./GroupBase')
const differ = require('array-differ')

class EditGroup extends GroupBase {
  constructor (props) {
    const { chatId, chatName } = props.screenProps
    const group = {}
    this.before = ipcRenderer.sendSync(
      'dispatchSync',
      'getChatContacts',
      chatId)
      .filter(id => id !== C.DC_CONTACT_ID_SELF)
      .map(id => Number(id))
    this.before.forEach(id => { group[id] = true })
    super(props, {
      buttonLabel: 'save',
      group: group,
      name: chatName,
      heading: 'editGroup'
    })
  }

  onSubmit () {
    const after = Object.keys(this.state.group).map(id => Number(id))
    const remove = differ(this.before, after)
    const add = differ(after, this.before)
    const { chatId } = this.props.screenProps

    ipcRenderer.send(
      'dispatch',
      'modifyGroup',
      chatId,
      this.state.name,
      remove,
      add
    )

    this.props.changeScreen('ChatList')
  }
}

module.exports = EditGroup
