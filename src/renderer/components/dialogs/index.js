const React = require('react')
const SetupMessage = require('./SetupMessage')
const MessageDetail = require('./MessageDetail')
const RenderMedia = require('./RenderMedia')
const ContactDetail = require('./ContactDetail')
const DeadDrop = require('./DeadDrop')
const KeyTransfer = require('./KeyTransfer')
const QrCode = require('./QrCode')
const ImexProgress = require('./ImexProgress')
const About = require('./About')
const Settings = require('./Settings')
const ForwardMessage = require('./ForwardMessage')
const EncrInfo = require('./EncrInfo')

const allDialogs = [
  SetupMessage,
  ContactDetail,
  DeadDrop,
  RenderMedia,
  MessageDetail,
  KeyTransfer,
  QrCode,
  ImexProgress,
  About,
  Settings,
  ForwardMessage,
  EncrInfo
]

class Controller extends React.Component {
  constructor (props) {
    super(props)

    var dialogs = {}
    allDialogs.forEach((Component) => {
      dialogs[Component.name] = {
        Component,
        props: false
      }
    })

    this.state = { dialogs }
    this.close = this.close.bind(this)
  }

  open (name, props) {
    var Component = this.state.dialogs[name]
    if (!Component) throw new Error(`Component with name ${name} does not exist`)
    if (!props) props = {}
    this.state.dialogs[name].props = props
    this.setState({ dialogs: this.state.dialogs })
  }

  close (name) {
    this.state.dialogs[name].props = false
    this.setState({ dialogs: this.state.dialogs })
  }

  render () {
    const { saved, userFeedback, deltachat } = this.props
    const { dialogs } = this.state

    return (
      <div>
        {Object.values(dialogs).map((dialog) => {
          var name = dialog.Component.name
          var defaultProps = {
            isOpen: dialog.props !== false,
            onClose: () => this.close(name),
            userFeedback,
            saved,
            deltachat,
            key: name
          }

          var props = Object.assign({}, defaultProps, dialog.props || {})
          return <dialog.Component {...props} />
        })}
      </div>
    )
  }
}

module.exports = allDialogs
module.exports.Controller = Controller
