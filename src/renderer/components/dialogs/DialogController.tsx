import React from 'react'
import MessageDetail from './MessageDetail'
import FullscreenMedia from './FullscreenMedia'
import EnterAutocryptSetupMessage from './EnterAutocryptSetupMessage'
import About from './About'
import Settings from './Settings'
import ForwardMessage from './ForwardMessage'
import EncryptionInfo from './EncryptionInfo'
import CreateChat from './CreateChat'
import ViewGroup from './ViewGroup'
import ViewProfile from './ViewProfile'
import ImportQrCode from './ImportQrCode'
import AlertDialog from './AlertDialog'
import ConfirmationDialog from './ConfirmationDialog'
import UnblockContacts from './UnblockContacts'
import MuteChat from './MuteChat'
import QrCode from './QrCode'
import DisappearingMessages from './DisappearingMessages'
import ChatAuditLogDialog from './ChatAuditLogDialog'
import { getLogger } from '../../../shared/logger'

export const allDialogs: { [key: string]: any } = {
  FullscreenMedia,
  MessageDetail,
  EnterAutocryptSetupMessage,
  About,
  Settings,
  ForwardMessage,
  EncryptionInfo,
  CreateChat,
  ViewGroup,
  ViewProfile,
  ImportQrCode,
  ConfirmationDialog,
  AlertDialog,
  UnblockContacts,
  MuteChat,
  DisappearingMessages,
  ChatAuditLogDialog,
  QrCode,
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
  key: string
  openDialog: todo
  closeDialog: todo
  [key: string]: any
}

let dialogCounter = 1

export type OpenDialogFunctionType =
  typeof DialogController.prototype.openDialog
export type CloseDialogFunctionType =
  typeof DialogController.prototype.closeDialog
export type HasOpenDialogsFunctionType =
  typeof DialogController.prototype.hasOpenDialogs

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
    this.hasOpenDialogs = this.hasOpenDialogs.bind(this)
  }

  hasOpenDialogs(): boolean {
    return Object.keys(this.state.dialogs).length !== 0
  }

  openDialog<T extends { [key: string]: any }>(
    fnc: DialogId | ((props: DialogProps & T) => React.ReactElement),
    additionalProps?: T /* infer from component */
  ) {
    if (typeof fnc === 'string') {
      fnc = allDialogs[fnc]
      if (!fnc) throw new Error(`Dialog with name ${name} does not exist`)
    }

    log.debug(
      'openDialog: ',
      typeof fnc === 'string' ? fnc : 'Anonymous',
      additionalProps
    )

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
            additionalProps: additionalProps || {},
          },
        },
      }
    })
    return id
  }

  closeDialog(id: DialogId) {
    this.setState((prevState: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: closedDialog, ...dialogs } = prevState.dialogs
      log.debug(`Close dialog with id: ${id}`)
      return { ...prevState, dialogs }
    })
  }

  render() {
    const { userFeedback } = this.props
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
            key: id,
            openDialog: this.openDialog.bind(this),
            closeDialog: this.closeDialog.bind(this),
            ...dialog.additionalProps,
          }
          return (
            <div key={'dialog-' + id}>
              <dialog.fnc {...props} />
            </div>
          )
        })}
      </div>
    )
  }
}
