import React, { useContext, useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'
import MessageWrapper from './MessageWrapper'
import ScreenContext from '../../contexts/ScreenContext'
import { callDcMethod } from '../../ipc'
import MessageListStore from '../../stores/MessageList'
import { useDebouncedCallback } from 'use-debounce'

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

const messageIdsToShow = (oldestFetchedMessageIndex, messageIds) => {
  let messageIdsToShow = []
  for (let i = oldestFetchedMessageIndex; i < messageIds.length; i++) {
    messageIdsToShow.push(messageIds[i])
  }
  return messageIdsToShow
}

function scrollToLastMessageOnLastPageAfterFetchedMoreMessages(oldestFetchedMessageIndex, messageListRef) {
  const scrollToLastMessageOnLastPage = (countFetchedMessages) => {
    console.log('scrollToLastMessageOnLastPage', countFetchedMessages)
    let elem = document.querySelector(`#message-list li:nth-child(${countFetchedMessages})`)
    elem.scrollIntoView()
  }
  useEffect(() => {
    MessageListStore.addListener('afterFetchedMoreMessages', scrollToLastMessageOnLastPage)
    return () => {
      MessageListStore.removeListener('afterFetchedMoreMessages', scrollToLastMessageOnLastPage)
    }
  }, [oldestFetchedMessageIndex])
}

export default function MessageList ({ chat, refComposer, locationStreamingEnabled }) {
  const [{oldestFetchedMessageIndex, messages, messageIds}, messageListDispatch] = useStore(MessageListStore)
  const messageListRef = useRef(null)


  const scrollDownOnChatSelected = () => {
    console.log('newChatSelected!', messageListRef)
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    setTimeout(() => {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }, 30)
  }

  useEffect(() => {
    messageListDispatch({type: 'SELECT_CHAT', payload: chat.id })
    MessageListStore.addListener('afterNewChatSelected', scrollDownOnChatSelected)
    return () => {
      MessageListStore.removeListener('afterNewChatSelected', scrollDownOnChatSelected)
    }
  }, [chat.id])

  scrollToLastMessageOnLastPageAfterFetchedMoreMessages(oldestFetchedMessageIndex)

  const [fetchMore] = useDebouncedCallback(() => {
    messageListDispatch({type: 'FETCH_MORE_MESSAGES'})
  }, 10, { leading: true })

  const onScroll = Event => {
    if (messageListRef.current.scrollTop <= 0) {
      log.debug('Scrolled to top, fetching more messsages!')
      fetchMore()
    }
  }

  const _messageIdsToShow = messageIdsToShow(oldestFetchedMessageIndex, messageIds)
  console.log('Rerender!')

  const tx = window.translate
  return (
    <div id='message-list' ref={messageListRef} onScroll={onScroll}>
      <ul>
        {_messageIdsToShow.map(messageId => {
          return <MessageListItem
            messageId={messageId}
            rawMessage={messages[messageId]}
            chat={chat}
            locationStreamingEnabled={locationStreamingEnabled}
          />
        })} 
        })>
      </ul>
    </div>
  )
}


export function MessageListItem(props) {
  const {openDialog} = useContext(ScreenContext)
  const tx = window.translate
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
