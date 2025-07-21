import React, { useContext } from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActions,
} from '../Dialog'
import FooterActionButton from '../Dialog/FooterActionButton'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { BackendRemote, Type } from '../../backend-com'
import { C } from '@deltachat/jsonrpc-client'
import { ScreenContext } from '../../contexts/ScreenContext'

export type Props = {
  accountId: number
  msg: Type.Message
  chat: Type.FullChat
} & DialogProps

export default function ConfirmDeleteMessageDialog(props: Props) {
  const tx = useTranslationFunction()
  const { userFeedback } = useContext(ScreenContext)

  const { accountId, msg, chat, onClose } = props

  const deleteForAllPossible =
    msg.sender.id === C.DC_CONTACT_ID_SELF &&
    !msg.isInfo &&
    chat.canSend &&
    !chat.isSelfTalk &&
    chat.isEncrypted

  const deleteMessage = (deleteForEveryone: boolean) => {
    if (deleteForEveryone) {
      BackendRemote.rpc
        .deleteMessagesForAll(accountId, [msg.id])
        .catch((err: Error) => {
          userFeedback({
            type: 'error',
            text: err.message,
          })
        })
    } else {
      BackendRemote.rpc
        .deleteMessages(accountId, [msg.id])
        .catch((err: Error) => {
          userFeedback({
            type: 'error',
            text: err.message,
          })
        })
    }
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent>
          <p className='whitespace'>{tx('ask_delete_message')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => onClose()} data-testid='cancel'>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            styling={'danger'}
            onClick={() => deleteMessage(false)}
            data-testid='delete_for_me'
          >
            {chat.isSelfTalk ? tx('delete') : tx('delete_for_me')}
          </FooterActionButton>
          {deleteForAllPossible && (
            <FooterActionButton
              styling={'danger'}
              onClick={() => deleteMessage(true)}
              data-testid='delete_for_everyone'
            >
              {tx('delete_for_everyone')}
            </FooterActionButton>
          )}
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
