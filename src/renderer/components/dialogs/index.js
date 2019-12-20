import React from 'react'
import MessageDetail from './MessageDetail'
import RenderMedia from './RenderMedia'
import DeadDrop from './DeadDrop'
import EnterAutocryptSetupMessage from './EnterAutocryptSetupMessage'
import SendAutocryptSetupMessage from './SendAutocryptSetupMessage'
import ImexProgress from './ImexProgress'
import About from './About'
import Settings from './Settings'
import ForwardMessage from './ForwardMessage'
import EncryptionInfo from './EncryptionInfo'
import CreateChat from './CreateChat'
import EditGroup from './EditGroup'
import OneOnOneChatInfo from './OneOnOneChatInfo'
import MapDialog from './MapDialog'
import QrInviteCode from './QrInviteCode'
import ConfirmationDialog from './ConfirmationDialog'
import UnblockContacts from './UnblockContacts'

export const allDialogs = [
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
  OneOnOneChatInfo,
  MapDialog,
  QrInviteCode,
  ConfirmationDialog,
  UnblockContacts
]

const log = require('../../../logger').getLogger('renderer/dialogs')

export class Controller extends React.Component {
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

