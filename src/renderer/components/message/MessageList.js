import React, { useRef, useState, useEffect, useContext } from 'react'
import { shell } from 'electron'
import { callDcMethod } from '../../ipc'
import ScreenContext from '../../contexts/ScreenContext'

import Composer from '../composer/Composer'
import MessageWrapper from './MessageWrapper'
import logger from '../../../logger'

import { isDisplayableByRenderMedia } from './Attachment'
import SettingsContext from '../../contexts/SettingsContext'

import { DC_CHAT_ID_DEADDROP, DC_CHAT_ID_STARRED } from 'deltachat-node/constants'
import chatStore from '../../stores/chat'

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

export default function MessageList (props) {
  const [state, setState] = useState({
    error: false,
    composerSize: 40
  })
  const { chat } = props

  const previousScrollHeightMinusTop = useRef(null)
  const messageListWrap = useRef(null)
  let doc = document.querySelector(`.message-list-and-composer #message-list`)
  const conversationRef = useRef(null)
  const refComposer = useRef(null)

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
  const setComposerSize = size => setState({ composerSize: size })

  const onDrop = (e) => {
    const files = e.target.files || e.dataTransfer.files
    e.preventDefault()
    e.stopPropagation()
    // TODO maybe add a clause here for windows because that uses backslash instead of slash
    const forbiddenPathRegEx = /DeltaChat\/[\d\w]*\/db\.sqlite-blobs\//gi
    for (let i = 0; i < files.length; i++) {
      const { path } = files[i]
      if (!forbiddenPathRegEx.test(path.replace('\\', '/'))) {
        callDcMethod(
          'messageList.sendMessage',
          [chat.id, null, path]
        )
      } else {
        logger.warn('Prevented a file from being send again while dragging it out')
      }
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

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

  const [disabled, disabledReason] = (({ id, isGroup, selfInGroup }) => {
    if (id === DC_CHAT_ID_DEADDROP) {
      return [true, 'messaging_disabled_deaddrop']
    } else if (id === DC_CHAT_ID_STARRED) {
      return [true]
    } else if (isGroup && !selfInGroup) {
      return [true, 'messaging_disabled_not_in_group']
    } else {
      return [false]
    }
  })(chat)

  let specialMessageIdCounter = 0

  return (
    <SettingsContext.Consumer>
      {(settings) => {
        var style = { backgroundSize: 'cover', gridTemplateRows: `auto ${state.composerSize}px` }
        if (settings['chatViewBgImg']) {
          if (settings['chatViewBgImg'] && settings['chatViewBgImg'].indexOf('url') !== -1) {
            style.backgroundImage = settings['chatViewBgImg']
          } else {
            style.backgroundColor = settings['chatViewBgImg']
            style.backgroundImage = 'none'
          }
        }
        return (
          <div className='message-list-and-composer'
            style={style}
            ref={conversationRef} onDrop={onDrop.bind({ props: { chat } })} onDragOver={onDragOver} >
            <div className='message-list-and-composer__message-list'>
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
                      />
                    )
                  })}
                </ul>
              </div>
            </div>
            <Composer
              ref={refComposer}
              chatId={chat.id}
              draft={chat.draft}
              setComposerSize={setComposerSize.bind(this)}
              isDisabled={disabled}
              disabledReason={disabledReason}
            />
          </div>
        )
      }}
    </SettingsContext.Consumer>
  )
}
