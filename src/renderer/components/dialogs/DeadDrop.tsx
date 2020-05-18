import React from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Classes } from '@blueprintjs/core'
import { useChatStore } from '../../stores/chat'
import { DialogProps } from './DialogController'
import { DCContact, MessageType } from '../../../shared/shared-types.d'
import { SmallDialog } from './DeltaDialog'

/**
 * handle contact requests
 */
export default function DeadDrop(props: {
  contact: DCContact
  msg: MessageType['msg']
  onClose: DialogProps['onClose']
}) {
  const { contact, msg, onClose } = props
  const chatStoreDispatch = useChatStore()[1]

  const never = () => {
    DeltaBackend.call('contacts.blockContact', contact.id)
    onClose()
  }

  const notNow = async () => {
    const contactId = contact.id
    await DeltaBackend.call('contacts.markNoticedContact', contactId)
    onClose()
  }

  const yes = async () => {
    const messageId = msg.id
    const contactId = contact.id
    const chatId = await DeltaBackend.call('contacts.acceptContactRequest', {
      messageId,
      contactId,
    })
    chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId })
    onClose()
  }

  const isOpen = !!contact
  const nameAndAddr = contact && contact.nameAndAddr

  const tx = window.translate
  const body = tx('ask_start_chat_with', nameAndAddr)

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>{body}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <p className='delta-button danger' onClick={never}>
              {tx('never').toUpperCase()}
            </p>
            <p className='delta-button' onClick={notNow}>
              {tx('not_now').toUpperCase()}
            </p>
            <p className='delta-button primary' onClick={yes}>
              {tx('yes').toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
