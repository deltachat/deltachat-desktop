import React from 'react'
import { callDcMethod, callDcMethodAsync } from '../../ipc'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaButton, DeltaButtonPrimary, DeltaButtonDanger } from './SmallDialog'
import { useChatStore } from '../../stores/chat'

/**
 * handle contact requests
 */
export default function DeadDrop (props) {
  const { deaddrop, onClose } = props
  const chatStoreDispatch = useChatStore()[1]

  const never = () => {
    callDcMethod('contacts.blockContact', [deaddrop.contact.id])
    onClose()
  }

  const notNow = async () => {
    const contactId = deaddrop.contact.id
    await callDcMethodAsync('contacts.markNoticedContact', [contactId])
    onClose()
  }

  const yes = async () => {
    const messageId = deaddrop.msg.id
    const contactId = deaddrop.contact.id
    const chatId = await callDcMethodAsync('contacts.acceptContactRequest', [{ messageId, contactId }])
    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    onClose()
  }

  const isOpen = !!deaddrop
  const nameAndAddr = deaddrop && deaddrop.contact && deaddrop.contact.nameAndAddr

  const tx = window.translate
  const body = tx('ask_start_chat_with', nameAndAddr)

  return (
    <SmallDialog
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='bp3-dialog-body-with-padding'>
        <p>{body}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <DeltaButtonDanger bold={false} onClick={never}>
              {tx('never').toUpperCase()}
            </DeltaButtonDanger>
            <DeltaButton
              bold={false}
              onClick={notNow}
            >
              {tx('not_now').toUpperCase()}
            </DeltaButton>
            <DeltaButtonPrimary bold={false} onClick={yes}>{tx('yes').toUpperCase()}</DeltaButtonPrimary>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
