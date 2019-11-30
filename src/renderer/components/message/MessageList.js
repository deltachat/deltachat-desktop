import React, { useContext, useRef, useEffect, useState } from 'react'
import MessageWrapper from './MessageWrapper'
import ScreenContext from '../../contexts/ScreenContext'
import { callDcMethod } from '../../ipc'
import MessageListStore from '../../stores/MessageList'

import { getLogger } from '../../../logger'
const log = getLogger('render/msgList')

const PAGE_SIZE = 30

export function useStore(StoreInstance) {
  const [state, setState] = useState(StoreInstance.getState())
  const [page, setPage] = useState(1)

  useEffect(() => {
    StoreInstance.subscribe(setState)
    return () => StoreInstance.unsubscribe(setState)
  }, [])

  return [state, StoreInstance.dispatch.bind(StoreInstance)]
}

export default function MessageList ({ chat, refComposer, locationStreamingEnabled }) {
  const [{messageIdsToShow, messages}, messageListDispatch] = useStore(MessageListStore)
  useEffect(() => {

    messageListDispatch({type: 'SELECT_CHAT', payload: chat.id })
  }, [chat.id])

  const messageListRef = useRef(null)
  const scrollDownOnChatSelected = () => {
    console.log('newChatSelected!', messageListRef)
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }
  useEffect(() => {
    MessageListStore.addListener('NEW_CHAT_SELECTED', scrollDownOnChatSelected)
    return () => MessageListStore.removeListener('NEW_CHAT_SELECTED', scrollDownOnChatSelected)
  }, [])


  const tx = window.translate
  console.log('messageIdsToShow', messageIdsToShow)
  return (
    <div id='message-list' ref={messageListRef}>
      <ul>
        {messageIdsToShow.map(messageId => {
          return MessageListItem({
            messageId,
            rawMessage: messages[messageId],
            chat,
            locationStreamingEnabled
          })
        })} 
      </ul>
    </div>
  )
}


export function MessageListItem(props) {
  const {messageId, rawMessage, chat, locationStreamingEnabled} = props
  if(!rawMessage) return null
  const onClickSetupMessage = setupMessage => openDialog('EnterAutocryptSetupMessage', { setupMessage })
  const onShowDetail = message => openDialog('MessageDetail', { message, chat })
  const onDelete = message => openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message_desktop'),
    cb: yes => yes && chatStore.dispatch({ type: 'UI_DELETE_MESSAGE', payload: { msgId: message.id } })
  })
  const onForward = forwardMessage => openDialog('ForwardMessage', { forwardMessage })
  const message = MessageWrapper.convert(rawMessage)

  // As messages with a message id below 9 are special messages without a unique id, we need to generate a unique key for them
  const key = message.id <= 9
    ? 'magic' + message.id + '_' + specialMessageIdCounter++
    : message.id

  message.onReply = () => log.debug('reply to', message)
  message.onForward = onForward.bind(this, message)
  return (
    <MessageWrapper.render
      key={key}
      message={message}
      chat={chat}
      onClickContactRequest={() => openDialog('DeadDrop', { deaddrop: message })}
      onClickSetupMessage={onClickSetupMessage.bind(this, message)}
      onShowDetail={onShowDetail.bind(this, message)}
      onDelete={onDelete.bind(this, message)}
      locationStreamingEnabled={locationStreamingEnabled}
    />
  )
}
