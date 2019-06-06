const React = require('react')
const { ipcRenderer } = require('electron')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')

const ForwardToList = require('../ForwardToList')

class ForwardMessage extends React.Component {
  onChatClick (chatid) {
    ipcRenderer.send(
      'EVENT_DC_FUNCTION_CALL',
      'forwardMessage',
      this.props.forwardMessage.msg.id,
      chatid
    )
    this.props.onClose()
  }

  render () {
    const { forwardMessage, onClose } = this.props
    const tx = window.translate
    var isOpen = !!forwardMessage

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('menu_forward')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          <ForwardToList
            onChatClick={this.onChatClick.bind(this)}
          />
        </div>
      </Dialog>
    )
  }
}

module.exports = ForwardMessage
