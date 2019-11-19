import React, { useContext, useRef, useEffect } from 'react'
import MessageWrapper from './MessageWrapper'
import ScreenContext from '../../contexts/ScreenContext'
import { callDcMethod } from '../../ipc'
import chatStore from '../../stores/chat'
import { isDisplayableByRenderMedia } from './Attachment'
import { shell } from 'electron'
import logger from '../../../logger'

const SCROLL_BUFFER = 70
const MutationObserver = window.MutationObserver

export default function MessageList ({ chat, refComposer, locationStreamingEnabled }) {
  const previousScrollHeightMinusTop = useRef(null)
  const messageListWrap = useRef(null)
  let doc = document.querySelector(`.message-list-and-composer #message-list`)

  const { openDialog } = useContext(ScreenContext)

  const fetchNextMessages = () => {
    if (chat.totalMessages === chat.messages.length) return
    scrollPrepare()
    callDcMethod(
      'messageList.fetchMessages',
      [chat.id]
    )
  }

  const handleScroll = () => {
    if (previousScrollHeightMinusTop.current !== null) {
      restoreScroll()
    } else {
      scrollToBottom()
    }
  }

  const restoreScroll = () => {
    doc.scrollTop = doc.scrollHeight - previousScrollHeightMinusTop.current
    previousScrollHeightMinusTop.current = null
  }

  const scrollPrepare = () => { previousScrollHeightMinusTop.current = doc.scrollHeight - doc.scrollTop }

  const onScroll = () => {
    if (doc.scrollTop <= SCROLL_BUFFER) {
      fetchNextMessages()
    }
  }

  const scrollToBottom = force => { doc.scrollTop = doc.scrollHeight }

  useEffect(() => {
    if (!doc) {
      doc = document.querySelector(`.message-list-and-composer #message-list`)
    }
    if (!doc) {
      logger.warn(`Didn't find '.message-list-and-composer #message-list' element`)
    }
    const observer = new MutationObserver(handleScroll)
    if (messageListWrap.current) {
      observer.observe(messageListWrap.current, { attributes: false, childList: true, subtree: true })
    }
    doc.onscroll = onScroll
    return () => {
      if (observer) observer.disconnect()
    }
  }, [chat.id])

  useEffect(() => {
    // on new chat selected
    previousScrollHeightMinusTop.current = null
    if (refComposer.current && refComposer.current.messageInputRef && refComposer.current.messageInputRef.current) {
      refComposer.current.messageInputRef.current.focus()
    }
    scrollToBottom()
  }, [chat.id])

  const onClickAttachment = (message) => {
    if (message.viewType.viewType === 23) return
    if (isDisplayableByRenderMedia(message.msg.attachment)) {
      openDialog('RenderMedia', { message })
    } else {
      if (!shell.openItem(message.msg.attachment.url)) {
        logger.info("file couldn't be opened, try saving it in a different place and try to open it from there")
      }
    }
  }

  const onClickSetupMessage = setupMessage => openDialog('EnterAutocryptSetupMessage', { setupMessage })
  const onShowDetail = message => openDialog('MessageDetail', { message, chat })
  const tx = window.translate
  const onDelete = message => openDialog('ConfirmationDialog', {
    message: tx('ask_delete_message_desktop'),
    cb: yes => yes && chatStore.dispatch({ type: 'UI_DELETE_MESSAGE', payload: { msgId: message.id } })
  })
  const onForward = forwardMessage => openDialog('ForwardMessage', { forwardMessage })
  let specialMessageIdCounter = 0
  return (
    <div id='message-list' ref={messageListWrap}>
      <ul>
        {chat.messages.map(rawMessage => {
          const message = MessageWrapper.convert(rawMessage)

          // As messages with a message id below 9 are special messages without a unique id, we need to generate a unique key for them
          const key = message.id <= 9
            ? 'magic' + message.id + '_' + specialMessageIdCounter++
            : message.id

          message.onReply = () => logger.debug('reply to', message)
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
              onClickAttachment={onClickAttachment.bind(this, message)}
              locationStreamingEnabled={locationStreamingEnabled}
            />
          )
        })}
      </ul>
    </div>
  )
}
