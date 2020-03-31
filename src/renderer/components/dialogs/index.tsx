import React from 'react'
import MessageDetail from './MessageDetail'
import FullscreenMedia from './FullscreenMedia'
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
import ViewProfile from './ViewProfile'
import MapDialog from './MapDialog'
import QrInviteCode from './QrInviteCode'
import ConfirmationDialog from './ConfirmationDialog'
import UnblockContacts from './UnblockContacts'

export const allDialogs = {
  DeadDrop,
  FullscreenMedia,
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
  ViewProfile,
  MapDialog,
  QrInviteCode,
  ConfirmationDialog,
  UnblockContacts,
}

export type DialogId = keyof typeof allDialogs

const log = require('../../../shared/logger').getLogger('renderer/dialogs')

type dialogs = {
  [key: string]: {
    name: DialogId
    Component: todo
    props: false
  }
}

export class Controller extends React.Component<
  any,
  {
    dialogs: dialogs
  }
> {
  constructor(props: any) {
    super(props)

    var dialogs: dialogs = {}
    Object.keys(allDialogs).forEach((key: DialogId) => {
      dialogs[key as string] = {
        name: key,
        Component: allDialogs[key],
        props: false,
      }
    })

    this.state = { dialogs }
    this.close = this.close.bind(this)
  }

  open<T extends DialogId>(name: T, props: todo /* infer from component */) {
    log.debug('openDialog: ', name, props)
    var Component = this.state.dialogs[name]
    if (!Component)
      throw new Error(`Component with name ${name} does not exist`)
    if (!props) props = {}
    this.state.dialogs[name].props = props
    this.setState({ dialogs: this.state.dialogs })
  }

  close(name: DialogId) {
    this.state.dialogs[name].props = false
    this.setState({ dialogs: this.state.dialogs })
  }

  render() {
    const { userFeedback, deltachat } = this.props
    const { dialogs } = this.state
    // ToDo: This is shit. We can't alway renders all Dialogs and show them if something happens. We need to hook them up if they are needed, not always

    return (
      <div>
        {Object.values(dialogs).map(dialog => {
          const isOpen = dialog.props !== false
          if (!isOpen) return null

          var name = dialog.name
          var defaultProps = {
            isOpen,
            onClose: () => this.close(name as DialogId),
            userFeedback,
            deltachat,
            key: name,
            openDialog: this.open.bind(this),
            closeDialog: this.close.bind(this),
          }

          var props = Object.assign({}, defaultProps, dialog.props || {})
          return <dialog.Component {...props} />
        })}
      </div>
    )
  }
}
