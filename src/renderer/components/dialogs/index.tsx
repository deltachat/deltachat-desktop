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
import { AppState } from '../../../shared/shared-types'
import { getLogger } from '../../../shared/logger'

export const allDialogs: { [key: string]: any } = {
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
  ImportQrCode,
  ConfirmationDialog,
  UnblockContacts,
}

export type DialogId = keyof typeof allDialogs | string

const log = getLogger('renderer/dialogs')

type dialogs = {
  [key: string]: {
    id: number
    props: false
    fnc: any
  }
}

export type DialogProps = {
  isOpen: boolean
  onClose: () => void
  userFeedback: todo
  deltachat: AppState['deltachat']
  key: string
  openDialog: todo
  closeDialog: todo
  [key: string]: any
}

var dialogCounter = 1

export class Controller extends React.Component<
  any,
  {
    dialogs: dialogs
  }
> {
  constructor(props: any) {
    super(props)

    this.state = { dialogs: {} }
    this.close = this.close.bind(this)
  }

  open(fnc: any, props?: todo /* infer from component */) {
    if (typeof fnc === 'string') {
      fnc = allDialogs[fnc]
      if (!fnc) throw new Error(`Dialog with name ${name} does not exist`)
    }

    if (!props) props = {}
    log.debug('openDialog: ', fnc, props)

    let id: number = dialogCounter++
    if (id >= Number.MAX_SAFE_INTEGER - 1) {
      id = dialogCounter = 0
    }

    log.debug(`Add dialog with id: ${id}`)
    this.setState(state => {
      return {
        dialogs: {
          ...state.dialogs,
          [id]: {
            id,
            fnc,
            props,
          },
        },
      }
    })
  }

  close(id: DialogId) {
    const { [id]: closedDialog, ...dialogs } = this.state.dialogs
    log.debug(`Close dialog with id: ${id}`)
    this.setState({ dialogs })
  }

  render() {
    const { userFeedback, deltachat } = this.props
    const { dialogs } = this.state
    // ToDo: This is shit. We can't alway renders all Dialogs and show them if something happens. We need to hook them up if they are needed, not always

    return (
      <div>
        {Object.keys(dialogs).map((id: string) => {
          log.debug(`Rendering dialog with id ${id}`)
          const dialog = dialogs[id]
          var defaultProps: DialogProps = {
            isOpen: true,
            onClose: () => this.close(id),
            userFeedback,
            deltachat,
            key: name,
            openDialog: this.open.bind(this),
            closeDialog: this.close.bind(this),
          }
          var props = Object.assign({}, defaultProps, dialog.props || {})
          return <dialog.fnc key={id} {...props} />
        })}
      </div>
    )
  }
}
