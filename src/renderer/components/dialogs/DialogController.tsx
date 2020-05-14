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

const log = getLogger('renderer/dialogs/DialogController')

export type DialogAdditionProps = { [key: string]: any }
export type Dialog = {
  id: number
  additionalProps: DialogAdditionProps
  fnc: any
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

export type OpenDialogFunctionType = typeof DialogController.prototype.openDialog
export type CloseDialogFunctionType = typeof DialogController.prototype.closeDialog

export default class DialogController extends React.Component<
  any,
  {
    dialogs: {
      [key: string]: Dialog
    }
  }
> {
  constructor(props: any) {
    super(props)

    this.state = { dialogs: {} }
    this.openDialog = this.openDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
  }

  openDialog(
    fnc: DialogId | ((props: DialogProps) => React.ReactElement),
    additionalProps?: DialogAdditionProps /* infer from component */
  ) {
    if (typeof fnc === 'string') {
      fnc = allDialogs[fnc]
      if (!fnc) throw new Error(`Dialog with name ${name} does not exist`)
    }

    if (!additionalProps) additionalProps = {}
    log.debug('openDialog: ', fnc, additionalProps)

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
            ...additionalProps,
          },
        },
      }
    })
  }

  closeDialog(id: DialogId) {
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
          const props: DialogProps = {
            isOpen: true,
            onClose: () => this.closeDialog(id),
            userFeedback,
            deltachat,
            key: name,
            openDialog: this.openDialog.bind(this),
            closeDialog: this.closeDialog.bind(this),
            ...dialog.additionalProps,
          }
          return <dialog.fnc key={id} {...props} />
        })}
      </div>
    )
  }
}