const React = require('react')
const MessageDetail = require('./MessageDetail').default
const RenderMedia = require('./RenderMedia')
const DeadDrop = require('./DeadDrop').default
const EnterAutocryptSetupMessage = require('./EnterAutocryptSetupMessage').default
const SendAutocryptSetupMessage = require('./SendAutocryptSetupMessage').default
const ImexProgress = require('./ImexProgress').default
const About = require('./About')
const Settings = require('./Settings').default
const ForwardMessage = require('./ForwardMessage').default
const EncryptionInfo = require('./EncryptionInfo').default
const CreateChat = require('./CreateChat').default
const EditGroup = require('./EditGroup').default
const MapDialog = require('./MapDialog')
const QrInviteCode = require('./QrInviteCode').default
const ConfirmationDialog = require('./ConfirmationDialog').default

const allDialogs = [
  DeadDrop,
  RenderMedia,
  MessageDetail,
  EnterAutocryptSetupMessage,
  SendAutocryptSetupMessage,
  ImexProgress,
  About,
  Settings,
  ForwardMessage,
  EncryptionInfo,
  CreateChat,
  EditGroup,
  MapDialog,
  QrInviteCode,
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
