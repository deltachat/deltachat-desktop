import React from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Classes } from '@blueprintjs/core'
import { useChatStore } from '../../stores/chat'
import { DialogProps } from './DialogController'
import { DCContact, MessageType } from '../../../shared/shared-types'
import { SmallDialog } from './DeltaDialog'
import { useTranslationFunction } from '../../contexts'
import { C } from 'deltachat-node/dist/constants'

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

  const decide = async (
    action:
      | C.DC_DECISION_START_CHAT
      | C.DC_DECISION_NOT_NOW
      | C.DC_DECISION_BLOCK
  ) => {
    const chatId = await DeltaBackend.call(
      'chat.decideOnContactRequest',
      msg.id,
      action
    )
    // do additional update events so the ui behaves as expected
    switch (action) {
      case C.DC_DECISION_START_CHAT:
        // setTimeOut 0 to render on next iteration of the js event loop
        // this should prevent the new chatlistitem from being in placeholder mode.
        setTimeout(() => chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId }), 0)
        break
      case C.DC_DECISION_NOT_NOW:
        break
      case C.DC_DECISION_BLOCK:
        chatStoreDispatch({ type: 'UI_DELETE_MESSAGE', payload: msg.id })
        break
    }
    onClose()
  }

  const isOpen = !!contact
  const nameAndAddr = contact && contact.nameAndAddr

  const tx = useTranslationFunction()

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>{tx('ask_start_chat_with', nameAndAddr)}</p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <p
              className='delta-button danger'
              onClick={decide.bind(null, C.DC_DECISION_BLOCK)}
            >
              {tx('never').toUpperCase()}
            </p>
            <p
              className='delta-button'
              onClick={decide.bind(null, C.DC_DECISION_NOT_NOW)}
            >
              {tx('not_now').toUpperCase()}
            </p>
            <p
              className='delta-button primary'
              onClick={decide.bind(null, C.DC_DECISION_START_CHAT)}
            >
              {tx('yes').toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
