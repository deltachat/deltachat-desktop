import React, { useRef, useState, useContext } from 'react'
import { callDcMethod } from '../../ipc'

import Composer from '../composer/Composer'
import logger from '../../../logger'
import MessageList from './MessageList'

import SettingsContext from '../../contexts/SettingsContext'

import ScreenContext from '../../contexts/ScreenContext'

import { DC_CHAT_ID_DEADDROP, DC_CHAT_ID_STARRED } from 'deltachat-node/constants'

export default function MessageListAndComposer (props) {
  const [state, setState] = useState({
    error: false,
    composerSize: 40
  })
  const { chat } = props
  const conversationRef = useRef(null)
  const refComposer = useRef(null)
  const { openDialog } = useContext(ScreenContext)

  const setComposerSize = size => setState({ composerSize: size })

  const onDrop = (e) => {
    const files = e.target.files || e.dataTransfer.files
    e.preventDefault()
    e.stopPropagation()
    const tx = window.translate

    // TODO maybe add a clause here for windows because that uses backslash instead of slash
    const forbiddenPathRegEx = /DeltaChat\/[\d\w]*\/db\.sqlite-blobs\//gi
    for (let i = 0; i < files.length; i++) {
      const { path, name } = files[i]
      if (!forbiddenPathRegEx.test(path.replace('\\', '/'))) {
        openDialog('ConfirmationDialog', {
          message: tx('ask_send_file_desktop', [name, chat.name]),
          confirmLabel: tx('menu_send'),
          cb: yes => {
            if (!yes) { return }
            callDcMethod(
              'messageList.sendMessage',
              [chat.id, null, path]
            )
          }
        })
      } else {
        logger.warn('Prevented a file from being send again while dragging it out')
      }
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const [disabled, disabledReason] = (({ id, isGroup, selfInGroup }) => {
    if (id === DC_CHAT_ID_DEADDROP) {
      return [true, 'messaging_disabled_deaddrop']
    } else if (chat.isDeviceChat === true) {
      return [true, 'messaging_disabled_device_chat']
    } else if (id === DC_CHAT_ID_STARRED) {
      return [true]
    } else if (isGroup && !selfInGroup) {
      return [true, 'messaging_disabled_not_in_group']
    } else {
      return [false]
    }
  })(chat)

  const settings = useContext(SettingsContext)
  const style = { backgroundSize: 'cover', gridTemplateRows: `auto ${state.composerSize}px` }
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
        <MessageList chat={chat} refComposer={refComposer} locationStreamingEnabled={settings.enableOnDemandLocationStreaming} />
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
}
