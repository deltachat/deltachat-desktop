const React = require('react')
const MessageDetail = require('./MessageDetail')
const RenderMedia = require('./RenderMedia')
const ContactDetail = require('./ContactDetail')
const DeadDrop = require('./DeadDrop').default
const EnterAutocryptSetupMessage = require('./EnterAutocryptSetupMessage').default
const SendAutocryptSetupMessage = require('./SendAutocryptSetupMessage').default
const QrCode = require('./QrCode')
const ImexProgress = require('./ImexProgress')
const About = require('./About')
const Settings = require('./Settings').default
const ForwardMessage = require('./ForwardMessage')
const EncryptionInfo = require('./EncryptionInfo').default
const CreateChat = require('./CreateChat').default
const EditGroup2 = require('./EditGroup2').default
const MapDialog = require('./MapDialog')
const ConfirmationDialog = require('./confirmationDialog').default

const allDialogs = [
  ContactDetail,
  DeadDrop,
  RenderMedia,
  MessageDetail,
  EnterAutocryptSetupMessage,
  SendAutocryptSetupMessage,
  QrCode,
  ImexProgress,
  About,
  Settings,
  ForwardMessage,
  EncryptionInfo,
  CreateChat,
  EditGroup2,
  MapDialog,
  ConfirmationDialog
]

const log = require('../../../logger').getLogger('renderer/dialogs')

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

    this.state = { dialogs, attachedDialogs: [] }
    this.close = this.close.bind(this)
  }

  open (name, props) {
    log.debug('openDialog: ', name, props)
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
    const { userFeedback, deltachat } = this.props
    const { dialogs, attachedDialogs } = this.state
    // ToDo: This is shit. We can't alway renders all Dialogs and show them if something happens. We need to hook them up if they are needed, not always

    return (
      <div>
        {Object.values(dialogs).map((dialog) => {
          const isOpen = dialog.props !== false
          if (!isOpen) return null

          var name = dialog.Component.name
          var defaultProps = {
            isOpen,
            onClose: () => this.close(name),
            userFeedback,
            deltachat,
            key: name,
            openDialog: this.open.bind(this),
            closeDialog: this.close.bind(this)
          }

          var props = Object.assign({}, defaultProps, dialog.props || {})
          return <dialog.Component {...props} />
        })}
        {attachedDialogs.map(([Component, props], id) => {
          return <Component {...props} onClose={() => this.detachDialog(id)} />
        })}
      </div>
    )
  }
}

module.exports = allDialogs
module.exports.Controller = Controller
