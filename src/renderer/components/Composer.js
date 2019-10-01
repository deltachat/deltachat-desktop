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

const ComposerWrapper = styled.div`
  background-color: ${props => props.theme.composerBg};
  border-left: 1px solid rgba(16,22,26,0.1);
`

const AttachmentButtonWrapper = styled.div`
  float: left;

  position: fixed;
  bottom: 0;

  .bp3-button.bp3-minimal {
    width: 40px;
    height: 40px;

    &:hover {
      background: none;
      cursor: pointer;
    }
    &:focus {
      outline: none;
    }
  }
`

const EmojiButtonWrapper = styled(AttachmentButtonWrapper)`
  height: 40px;
  right: 40px;
`

const IconButton = styled.button`
  height: 40px;
  width: 40px;
  margin-right: 0px !important;
  padding: 0px;
  border: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: ${props => props.theme.composerBg};
  &:focus {
    outline: none;
  }
`

const IconButtonSpan = styled.span`
  display: block
  width: 25px
  height: 25px
  margin: 0 auto;
  background-image: url(../images/emoji.png);
  background-size: contain
`


const SendButtonCircleWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  float: right;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: 5px;
  background-color: ${props => props.theme.composerSendButton};
  border-radius: 180px;
  cursor: pointer;
  
  &:focus {
    outline: none;
  }
`

const SendButton = styled.button`
  height: 24px;
  width: 24px;
  margin: 4px;
  padding-left: 16px;
  border: none;
  background-image: url(../images/send-button.png);
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: 3px 1px;
  background-size: contain;
  vertical-align: middle;
  
  &:focus {
    outline: none;
  }
`

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
    return <ComposerWrapper ref={ref}
      className={'disabled-message-input'}
      style={{ textAlign: 'center', padding: '0.5rem', color: '#999' }}>
      {tx('messaging_disabled_not_in_group')}
    </ComposerWrapper>
  } else {
    return (
      <ComposerWrapper ref={ref}>
        {!isDisabled && <AttachmentButtonWrapper>
          <Button minimal
            icon='paperclip'
            onClick={addFilename.bind(this)}
            aria-label={tx('a11y_attachment_btn_label')} />
        </AttachmentButtonWrapper>}
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
        <EmojiButtonWrapper ref={pickerButtonRef}>
          <IconButton onClick={onEmojiIconClick} aria-label={tx('a11y_emoji_btn_label')}>
            <IconButtonSpan />
          </IconButton>
        </EmojiButtonWrapper>
        { showEmojiPicker &&
            <EmojiAndStickerPicker chatId={chatId} ref={pickerRef} onEmojiSelect={onEmojiSelect} color={theme.emojiSelectorSelectionColor} />
        }
        <SendButtonCircleWrapper onClick={sendMessage}>
          <SendButton aria-label={tx('a11y_send_btn_label')} />
        </SendButtonCircleWrapper>
      </ComposerWrapper>
    )
  }
}))

export default Composer

const EmojiAndStickerPickerWrapper = styled.div`
  position: fixed;
  z-index: 10;
  width: 438px;
  height: 70vh;
  right: 10px;
  bottom: 50px;
  background-color: white;
  border-radius: 2px;
  box-shadow: 0px 0px 0px 1px #00000017;

  .emoji-sticker-picker__sticker-picker {
    width: 100%;
    height: calc(70vh - 40px - 30px + 1px);
    margin-top: -1px;
    overflow: overlay;
    img {
      max-width: 300px;
      height: auto;
    }
  }

  .emoji-sticker-picker__emoji-or-sticker-selector {
    width: 100%
    height: 41px;
    display: flex;
    border-bottom: 1px solid var(--emojiMartBorder);
  }

  .emoji-sticker-picker__emoji-or-sticker-selector__button {
    width: 50%;
    padding-top: 7px;
    font-size: large;
    text-align: center;
    border-bottom-style: solid;
    border-bottom-width: 4px;
    border-bottom-color: transparent;
    color: grey;
    &:last-child {
      float: right;
    }
    &:hover {
      cursor: pointer;
    }
  }
  
  .emoji-sticker-picker__emoji-or-sticker-selector__button--is-selected {
    color: var(--emojiSelectorSelectionColor) !important;
    border-bottom-color: var(--emojiSelectorSelectionColor) !important;
  }

  .emoji-sticker-picker__emoji-or-sticker-picker {
    border-bottom: 1px solid var(--emojiMartBorder);
  }

  .emoji-sticker-picker__emoji-picker {
    height: calc(70vh - 40px - 30px);
  }

  .emoji-sticker-picker__sticker-picker__inner {
    padding: 0px 6px;
  }

  .emoji-sticker-picker__sticker-picker__inner__sticker-pack-title {
    padding: 5px 6px;
    color: grey;
    font-size: large;
    font-weight: 500;
    text-transform: capitalize;
    font-family: Roboto, "Apple Color Emoji", NotoEmoji, "Helvetica Neue", Arial, Helvetica, NotoMono, sans-serif;
    font-size: 16px;
    font-weight: 500;
    height: 28px;
    line-height: 18.4px;
  }

  .emoji-sticker-picker__sticker-picker__inner__sticker-pack-container {
    display: flex;
    /* max-width: 400px; */
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 5px 0px;
  }
  .emoji-sticker-picker__sticker-picker__inner__sticker-pack-container__sticker { 
    display: flex;
    justify-content: center;
    width: 133px;
    height: 133px;
    margin: 5px 0px;
    padding: 3px;
    border-radius: 4px;
    &:hover {
      background-color: lightgrey;
      cursor: pointer;
    }
    img {
      max-height: calc(133px - 6px);
      max-width: calc(133px - 6px);
      object-fit: contain;
    }
  }
`

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
    <EmojiAndStickerPickerWrapper>
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
    </EmojiAndStickerPickerWrapper>
  )
})
