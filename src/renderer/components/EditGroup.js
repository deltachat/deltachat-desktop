const { ipcRenderer } = require('electron')
const GroupBase = require('./GroupBase')

class EditGroup extends GroupBase {
  constructor (props) {
    const { chatId, chatName } = props.screenProps
    const group = {}
    const readOnly = ipcRenderer.sendSync(
      'dispatchSync',
      'getChatContacts',
      chatId
    ).filter(id => id !== 1)
    readOnly.forEach(id => { group[id] = true })
    super(props, {
      buttonLabel: 'save',
      group: group,
      name: chatName,
      heading: 'editGroup',
      readOnly
    })
  }

  onSubmit () {
    const contactIds = Object.keys(this.state.group).filter(id => {
      return !this.state.readOnly.includes(Number(id))
    })
    const { chatId } = this.props.screenProps
    ipcRenderer.sendSync(
      'dispatchSync',
      'modifyGroup',
      chatId,
      this.state.name,
      contactIds
    )
    this.props.changeScreen('ChatList')
  }
}

module.exports = EditGroup
