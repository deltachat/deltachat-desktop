import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogBody, DeltaDialogHeader } from '../helpers/DeltaDialog'
import ChatListItem from '../ChatListItem'
import { useChatListIds, useLazyChatListItems, LazyChatListItem } from '../helpers/ChatList'
import { CreateChatSearchInput, PseudoContactListItemNoSearchResults } from './CreateChat-Styles'
import classNames from 'classnames'


export default function ForwardMessage(props) {
  const tx = window.translate
  const { forwardMessage, onClose } = props
  const { chatListIds, queryStr, setQueryStr} = useChatListIds()
  const [chatItems, fetchChatsInView, scrollRef] = useLazyChatListItems(chatListIds)

  const onChatClick = chatid => {
    callDcMethod('forwardMessage', [props.forwardMessage.msg.id, chatid])
    props.onClose()
  }
  const onSearchChange = e => setQueryStr(e.target.value)


  var isOpen = !!forwardMessage
  return (
    <DeltaDialogBase
      isOpen={isOpen}
      title={tx('menu_forward')}
      onClose={onClose}
      style={{ width: '400px', height: 'calc(100% - 60px)', margin: '0' }}
    >
      <DeltaDialogHeader onClose={onClose}>
        <CreateChatSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} autoFocus />
      </DeltaDialogHeader>
      <div ref={scrollRef} className={classNames(Classes.DIALOG_BODY, '.bp3-dialog-body-no-footer')} onScroll={fetchChatsInView}>
        <Card>
          {chatListIds.map(chatId => <LazyChatListItem
            key={chatId}
            chatListItem={chatItems[chatId]}
            onClick={onChatClick.bind(null, chatId)}
          />)}
          {chatListIds.length === 0 && queryStr !== '' && PseudoContactListItemNoSearchResults({queryStr})}
        </Card>
      </div>
    </DeltaDialogBase>
  )
}
