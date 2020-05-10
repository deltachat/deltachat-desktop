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
import ImportQrCode from './ImportQrCode'
import ConfirmationDialog from './ConfirmationDialog'
import UnblockContacts from './UnblockContacts'

export const allDialogs = {
  'DeadDrop': DeadDrop,
  'FullScreenMedia': FullscreenMedia,
  'MessageDetail': MessageDetail,
  'EnterAutocryptSetupMessage': EnterAutocryptSetupMessage,
  'SendAutocryptSetupMessage': SendAutocryptSetupMessage,
  'ImexProgress': ImexProgress,
  About,
  Settings,
  ForwardMessage,
  EncryptionInfo,
  CreateChat,
  EditGroup,
  ViewProfile,
  MapDialog,
  QrInviteCode,
  ImportQrCode,
  ConfirmationDialog,
  UnblockContacts,
}

export type DialogId = keyof typeof allDialogs | string

const log = require('../../../shared/logger').getLogger('renderer/dialogs')

type dialogs = {
  [key: string]: {
    name: DialogId
    Component: any
    props: false,
    fnc?: any
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
    Object.keys(allDialogs).forEach((key: string) => {
      const component: any = allDialogs[key]
      dialogs[key] = {
        name: key,
        Component: component,
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

  open2<T extends DialogId>(name: T, fnc: any, props: todo) {
    log.debug('openDialog2: ', name, props)
    var Component = this.state.dialogs[name]
    if (typeof fnc !== 'function')
      throw new Error(`fnc is not a function but ${typeof fnc}`)
    if (!props) props = {}
    this.state.dialogs[name].props = props
    this.state.dialogs[name].fnc = fnc
    this.setState({ dialogs: this.state.dialogs })
  }

  close(key: DialogId) {
    this.setState({ dialogs: { ...this.state.dialogs, [key]: undefined }})
  }

  render() {
    const { userFeedback, deltachat } = this.props
    const { dialogs } = this.state
    // ToDo: This is shit. We can't alway renders all Dialogs and show them if something happens. We need to hook them up if they are needed, not always

    return (
      <div>
        {Object.keys(dialogs).map(key => {
          const dialog = dialogs[key]
          const isOpen = dialog.props !== false
          if (!isOpen) return null

          var name = dialog.name
          var defaultProps = {
            isOpen,
            onClose: () => this.close(key),
            userFeedback,
            deltachat,
            key: name,
            openDialog: this.open.bind(this),
            closeDialog: this.close.bind(this),
          }

          var props = Object.assign({}, defaultProps, dialog.props || {})
          if (dialog.fnc) return dialog.fnc(props)
          return <dialog.Component {...props} />
        })}
      </div>
    )
  }
}
