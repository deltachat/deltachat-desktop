import React, { useRef, useState } from 'react'
import { Button } from '@blueprintjs/core'
import { remote } from 'electron'

import SettingsContext from '../contexts/SettingsContext'
import ComposerMessageInput from './ComposerMessageInput'
import logger from '../../logger'
import EmojiAndStickerPicker from './EmojiAndStickerPicker'

const log = logger.getLogger('renderer/composer')

const Composer = React.forwardRef((props, ref) => {
  const { onSubmit, isDisabled, chatId, draft } = props

  const [filename, setFilename] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messageInputRef = useRef()
  const pickerRef = useRef()
  const pickerButtonRef = useRef()

  const sendMessage = () => {
    const message = messageInputRef.current.getText()
    if (message.match(/^\s*$/)) {
      log.debug(`Empty message: don't send it...`)
      return
    }
    onSubmit({ text: message, filename })

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
            aria-label={tx('a11y_attachment_btn_label')} />
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
        <div className='composer__emoji-button' ref={pickerButtonRef} onClick={onEmojiIconClick} aria-label={tx('a11y_emoji_btn_label')}>
          <span />
        </div>
        { showEmojiPicker &&
        <EmojiAndStickerPicker chatId={chatId} ref={pickerRef} onEmojiSelect={onEmojiSelect} />
        }
        <div className='composer__send-button-wrapper' onClick={sendMessage}>
          <button aria-label={tx('a11y_send_btn_label')} />
        </div>
      </div>
    )
  }
})

export default Composer
