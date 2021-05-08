import React from 'react'
import { DeltaBackend } from '../../delta-remote'
import { Classes } from '@blueprintjs/core'
import { useChatStore } from '../../stores/chat'
import { DialogProps } from './DialogController'
import { DCContact, MessageType, FullChat } from '../../../shared/shared-types'
import { SmallDialog } from './DeltaDialog'
import { useTranslationFunction } from '../../contexts'
import { C } from 'deltachat-node/dist/constants'

/**
 * handle contact requests
 */
export default function DeadDrop(props: {
  contact: DCContact
  msg: MessageType['msg']
  chat: FullChat
  onClose: DialogProps['onClose']
}) {
  const { contact, msg, chat, onClose } = props
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
        setTimeout(
          () => chatStoreDispatch({ type: 'SELECT_CHAT', payload: chatId }),
          0
        )
        break
      case C.DC_DECISION_NOT_NOW:
        break
      case C.DC_DECISION_BLOCK:
        // do not delete the message, even if we want that in the future, the core should handle it.
        break
    }
    onClose()
  }

  const isOpen = !!contact
  const nameAndAddr = contact && contact.nameAndAddr

  const tx = useTranslationFunction()

  const isMailingList = chat.type === C.DC_CHAT_TYPE_MAILINGLIST

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p>
          {isMailingList
            ? tx('ask_show_mailing_list', chat.name)
            : tx('ask_start_chat_with', nameAndAddr)}
        </p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ justifyContent: 'space-between', marginTop: '7px' }}
          >
            <p
              className='delta-button danger'
              onClick={decide.bind(null, C.DC_DECISION_BLOCK)}
            >
              {tx(isMailingList ? 'block' : 'menu_block_contact').toUpperCase()}
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

export async function openDeadDropDecisionDialog(message: MessageType) {
  const chat = await DeltaBackend.call(
    'chatList.getFullChatById',
    message.msg.realChatId
  )
  window.__openDialog('DeadDrop', {
    contact: message.contact,
    chat,
    msg: message.msg,
  })
}
