import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import classNames from 'classnames'
import { DeltaBackend } from '../../delta-remote'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'

import { C } from 'deltachat-node/dist/constants'

export default function ForwardMessage(props: {
  message: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.translate
  const { message, onClose } = props
  const { chatListIds, queryStr, setQueryStr } = useChatListIds(
    C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  )
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(
    chatListIds
  )

  const onChatClick = (chatid: number) => {
    DeltaBackend.call('messageList.forwardMessage', message.msg.id, chatid)
    onClose()
  }
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  var isOpen = !!message
  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader onClose={onClose}>
        <input
          className='search-input'
          onChange={onSearchChange}
          value={queryStr}
          placeholder={tx('contacts_enter_name_or_email')}
          autoFocus
        />
      </DeltaDialogHeader>
      <div
        ref={scrollRef}
        className={classNames(
          Classes.DIALOG_BODY,
          '.bp3-dialog-body-no-footer'
        )}
        onScroll={onChatListScroll}
      >
        <Card style={{ padding: '0px' }}>
          <div className='forward-message-list-chat-list'>
            {chatListIds.map(chatId => (
              <ChatListItem
                key={chatId}
                chatListItem={chatItems[chatId]}
                onClick={onChatClick.bind(null, chatId)}
              />
            ))}
            {chatListIds.length === 0 &&
              queryStr !== '' &&
              PseudoListItemNoSearchResults({ queryStr })}
          </div>
        </Card>
      </div>
    </DeltaDialogBase>
  )
}
