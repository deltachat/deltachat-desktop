const React = require('react')
const MessageMetaData = require('../messagelist/MessageMetaData')

class PopupMessage extends React.Component {
  render () {
    const { username, formattedDate, message } = this.props
    if (message) {
      const props = Object.assign({}, message)
      props.padlock = props.showPadlock
      props.timestamp = props.timestamp * 1000
      props.username = username
      return (
        <div>
          <div>{message.text}</div>
          <MessageMetaData {...props} />
        </div>
      )
    } else {
      return <div> {username} <br /> {formattedDate} </div>
    }
  }
}

module.exports = PopupMessage
