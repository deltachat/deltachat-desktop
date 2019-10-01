import React, { useRef, useState, useEffect } from 'react'
import { withTheme } from 'styled-components'
import { Button } from '@blueprintjs/core'
import { remote } from 'electron'
import styled from 'styled-components'
import { Picker } from 'emoji-mart'
import classNames from 'classnames'

import SettingsContext from '../contexts/SettingsContext'
import ComposerMessageInput from './ComposerMessageInput'
import { callDcMethodAsync, callDcMethod } from '../ipc'
import logger from '../../logger'

const log = logger.getLogger('renderer/composer')

const Composer = withTheme(React.forwardRef((props, ref) => {
  const { onSubmit, isDisabled, chatId, draft, theme } = props

  const [filename, setFilename] = useState(null)
  const [error, setError] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messageInputRef = useRef()
  const pickerRef = useRef()
  const pickerButtonRef = useRef()

  const handleError = () => setError(true)

  const sendMessage = () => {
    const message = messageInputRef.current.getText()
    if (message.match(/^\s*$/)) {
      log.debug(`Empty message: don't send it...`)
      return
    }
    onSubmit({text: message})
    messageInputRef.current.clearText()
    messageInputRef.current.focus()
  }

  const addFilename = () => {
    remote.dialog.showOpenDialog({ properties: ['openFile'] }, filenames => {
      if (filenames && filenames[0]) onSubmit({ filename: filenames[0] })
    })
  }

  const onEmojiIconClick = () => setShowEmojiPicker(!showEmojiPicker)

  const onEmojiSelect = emoji => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current.insertStringAtCursorPosition(emoji.native)
  }


  const tx = window.translate

  if (isDisabled) {
    return <div className='composer' ref={ref}
      className={'disabled-message-input'}
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
            <EmojiAndStickerPicker chatId={chatId} ref={pickerRef} onEmojiSelect={onEmojiSelect} color={theme.emojiSelectorSelectionColor} />
        }
        <div className='composer__send-button-wrapper' onClick={sendMessage}>
          <button aria-label={tx('a11y_send_btn_label')} />
        </div>
      </div>
    )
  }
}))

export default Composer

export const useAsyncEffect = (asyncEffect, ...args) => useEffect(() => { asyncEffect() }, ...args)


export const StickerDiv = props => {
  const { stickerPackName, stickerPackImages, chatId } = props
  const onClickSticker = (fileName) => {
    callDcMethod('sendMessage', [chatId, 'We are testing stickers', fileName])
  }

  return (
    <div>
      <div className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-title'>{stickerPackName}</div>
      <div className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-container'>
        { stickerPackImages.map((filePath, index) => {
            return (
              <div className='emoji-sticker-picker__sticker-picker__inner__sticker-pack-container__sticker'>
                <img
                  key={index}
                  src={filePath}
                  onClick={onClickSticker.bind(this, filePath)}
                />
              </div>
            )
        })}
      </div>
    </div>
  )
}

export const StickerPicker = props => {
  const { stickers, chatId } = props
  return (
    <div className='emoji-sticker-picker__sticker-picker'>
      <div className='emoji-sticker-picker__sticker-picker__inner'>
       { Object.keys(stickers).map(stickerPackName => {
           return <StickerDiv
             chatId={chatId}
             key={stickerPackName}
             stickerPackName={stickerPackName}
             stickerPackImages={stickers[stickerPackName]}
           />
       })}
      </div>
    </div>
  )
}

export const EmojiOrStickerSelectorButton = props => {
  return (
    <div
      className={classNames(
        'emoji-sticker-picker__emoji-or-sticker-selector__button',
        { 'emoji-sticker-picker__emoji-or-sticker-selector__button--is-selected' : props.isSelected })}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  )
}

export const EmojiAndStickerPicker = React.forwardRef((props, ref) => {
  const { color, onEmojiSelect, emojiTooltip, chatId } = props

  const [showSticker, setShowSticker] = useState(false)
  const [stickers, setStickers] = useState(null)
  
  useAsyncEffect(async () => {
    const stickers = await callDcMethodAsync('getStickers')
    setStickers(stickers)
  }, [])

  return (
    <div className='emoji-sticker-picker'>
      <div className='emoji-sticker-picker__emoji-or-sticker-selector'>
        <EmojiOrStickerSelectorButton onClick={() => setShowSticker(false)} isSelected={!showSticker}>Emoji</EmojiOrStickerSelectorButton>
        <EmojiOrStickerSelectorButton onClick={() => setShowSticker(true)} isSelected={showSticker}>Sticker</EmojiOrStickerSelectorButton>
      </div>
      <div className='emoji-sticker-picker__emoji-or-sticker-picker'>
       { !showSticker &&
         <div className='emoji-sticker-picker__emoji-picker' ref={ref}>
           <Picker
             style={{ width: '100%', height: '100%' }}
             native
             color={color}
             onSelect={onEmojiSelect}
             showPreview={false}
             showSkinTones={false}
             emojiTooltip
           />
         </div>
       }
       { showSticker && stickers !== null && typeof stickers === 'object' && <StickerPicker chatId={chatId} stickers={stickers} /> }
      </div>
    </div>
  )
})
