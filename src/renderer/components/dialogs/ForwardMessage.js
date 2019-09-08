const React = require('react')
const { callDcMethod } = require('../../ipc')
const {
  Classes,
  Dialog
} = require('@blueprintjs/core')
const chatListStore = require('../../stores/chatList')

const ForwardToList = require('../ForwardToList')

class ForwardMessage extends React.Component {
  constructor (props) {
    super(props)
    this.assignChatList = this.assignChatList.bind(this)
    this.state = {
      chatList: []
    }
  }

  onChatClick (chatid) {
    callDcMethod(
      'forwardMessage',
      [this.props.forwardMessage.msg.id, chatid]
    )
    this.props.onClose()
  }

  assignChatList (chatListState) {
    let { chatList } = chatListState
    chatList = chatList.filter(chat => (!chat.deaddrop && !chat.archive))
    this.setState({ chatList })
  }

  componentDidMount () {
    chatListStore.subscribe(this.assignChatList)
  }

  componentWillUnmount () {
    chatListStore.unsubscribe(this.assignChatList)
  }

  render () {
    const { forwardMessage, onClose } = this.props
    const tx = window.translate
    const { chatList } = this.state
    var isOpen = !!forwardMessage
    return (
      <Dialog
        isOpen={isOpen}
        title={tx('menu_forward')}
        icon='info-sign'
        onClose={onClose}>
        <div className={Classes.DIALOG_BODY}>
          <ForwardToList
            chatList={chatList}
            onChatClick={this.onChatClick.bind(this)}
          />
        </div>
      </Dialog>
    )
  }
}

module.exports = ForwardMessage
