import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@blueprintjs/core'
import { remote } from 'electron'

import SettingsContext from '../../contexts/SettingsContext'
import ComposerMessageInput from './ComposerMessageInput'
import logger from '../../../logger'
import EmojiAndStickerPicker from './EmojiAndStickerPicker'
import { callDcMethod } from '../../ipc'

const log = logger.getLogger('renderer/composer')

const insideBoundingRect = (mouseX, mouseY, boundingRect, margin = 0) => {
  return mouseX >= boundingRect.x - margin &&
         mouseX <= boundingRect.x + boundingRect.width + margin &&
         mouseY >= boundingRect.y - margin &&
         mouseY <= boundingRect.y + boundingRect.height + margin
}

const Composer = React.forwardRef((props, ref) => {
  const { isDisabled, chatId, draft } = props

  const [filename, setFilename] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messageInputRef = useRef()
  const emojiAndStickerRef = useRef()
  const pickerButtonRef = useRef()

  const sendMessage = () => {
    const message = messageInputRef.current.getText()
    if (message.match(/^\s*$/)) {
      log.debug(`Empty message: don't send it...`)
      return
    }
    callDcMethod('sendMessage', [chatId, message, filename])

    messageInputRef.current.clearText()
    messageInputRef.current.focus()
  }

  const addFilename = () => {
    remote.dialog.showOpenDialog({ properties: ['openFile'] }, filenames => {
      if (filenames && filenames[0]) setFilename(filenames[0])
    })
  }

  const onEmojiIconClick = () => setShowEmojiPicker(!showEmojiPicker)

  const onEmojiSelect = emoji => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current.insertStringAtCursorPosition(emoji.native)
  }

  useEffect(() => {
    console.log('showEmojiPicker', showEmojiPicker)
    if (!showEmojiPicker) return
    const onClick = ({ clientX, clientY }) => {
      if (!emojiAndStickerRef.current) return
      const boundingRect = emojiAndStickerRef.current.getBoundingClientRect()
      const clickIsOutSideEmojiPicker = !insideBoundingRect(clientX, clientY, boundingRect, 2)
      if (clickIsOutSideEmojiPicker) setShowEmojiPicker(false)
    }

    document.addEventListener('click', onClick)
    return () => { console.log('unmount'); document.removeEventListener('click', onClick) }
  }, [showEmojiPicker, emojiAndStickerRef])

  const tx = window.translate

  if (isDisabled) {
    return <div
      ref={ref}
      className={'composer composer--disabled-message-input'}
      style={{ textAlign: 'center', padding: '0.5rem', color: '#999' }}>
      {tx('messaging_disabled_not_in_group')}
    </div>
  } else {
    return (
      <div className='composer' ref={ref}>
        {!isDisabled && <div className='composer__attachment-button'>
          <Button minimal
            icon='paperclip'
            onClick={addFilename.bind(this)}
            aria-label={tx('attachment')} />
        </div>}
        <SettingsContext.Consumer>
          {({ enterKeySends }) => (
            <ComposerMessageInput
              ref={messageInputRef}
              enterKeySends={enterKeySends}
              sendMessage={sendMessage}
              setComposerSize={props.setComposerSize}
              chatId={chatId}
              draft={draft}
            />
          )}
        </SettingsContext.Consumer>
        <div className='composer__emoji-button' ref={pickerButtonRef} onClick={onEmojiIconClick} aria-label={tx('emoji')}>
          <span />
        </div>
        { showEmojiPicker &&
          <EmojiAndStickerPicker chatId={chatId} ref={emojiAndStickerRef} onEmojiSelect={onEmojiSelect} setShowEmojiPicker={setShowEmojiPicker} />
        }
        <div className='composer__send-button-wrapper' onClick={sendMessage}>
          <button aria-label={tx('menu_send')} />
        </div>
      </div>
    )
  }
})

export default Composer
