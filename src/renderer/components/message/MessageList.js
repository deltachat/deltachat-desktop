import React, { useRef, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { shell } from 'electron'
import { callDcMethod } from '../../ipc'
import ScreenContext from '../../contexts/ScreenContext'

import Composer from '../composer/Composer'
import MessageWrapper from './MessageWrapper'
import logger from '../../../logger'

import { isDisplayableByRenderMedia } from './Attachment'
import SettingsContext from '../../contexts/SettingsContext'

const MutationObserver = window.MutationObserver

const SCROLL_BUFFER = 70

export default function ChatView (props) {
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

  const writeMessage = (opts) => {
    callDcMethod(
      'sendMessage',
      [chat.id, opts.text, opts.filename]
    )
  }

  const fetchNextMessages = () => {
    if (chat.totalMessages === chat.messages.length) return
    scrollPrepare()
    callDcMethod(
      'fetchMessages',
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

  const scrollPrepare = () => {
    previousScrollHeightMinusTop.current = doc.scrollHeight - doc.scrollTop
  }

  const onScroll = () => {
    if (doc.scrollTop <= SCROLL_BUFFER) {
      fetchNextMessages()
    }
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

  const scrollToBottom = (force) => {
    doc.scrollTop = doc.scrollHeight
  }

  const onClickAttachment = (message) => {
    if (isDisplayableByRenderMedia(message.msg.attachment)) {
      openDialog('RenderMedia', { message })
    } else {
      if (!shell.openItem(message.msg.attachment.url)) {
        logger.info("file couldn't be opened, try saving it in a different place and try to open it from there")
      }
    }
  }

  const onClickSetupMessage = (setupMessage) => {
    openDialog('EnterAutocryptSetupMessage', { setupMessage })
  }

  const onShowDetail = (message) => {
    openDialog('MessageDetail', {
      message,
      chat
    })
  }

  const onForward = (forwardMessage) => {
    openDialog('ForwardMessage', { forwardMessage })
  }

  const setComposerSize = (size) => {
    setState({ composerSize: size })
  }

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
          'sendMessage',
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

  const { onDeadDropClick } = props
  const disabled = chat.isGroup && !chat.selfInGroup

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
                    message.onReply = () => logger.debug('reply to', message)
                    message.onForward = onForward.bind(this, message)
                    return MessageWrapper.render({
                      message,
                      chat,
                      onClickContactRequest: () => onDeadDropClick(message),
                      onClickSetupMessage: onClickSetupMessage.bind(this, message),
                      onShowDetail: onShowDetail.bind(this, message),
                      onClickAttachment: onClickAttachment.bind(this, message)
                    })
                  })}
                </ul>
              </div>
            </div>
            <Composer
              ref={refComposer}
              chatId={chat.id}
              draft={chat.draft}
              onSubmit={writeMessage}
              setComposerSize={setComposerSize.bind(this)}
              isDisabled={disabled}
            />
          </div>
        )
      }}
    </SettingsContext.Consumer>
  )
}
