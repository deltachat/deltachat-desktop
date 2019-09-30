import React, { useRef, useState, useEffect } from 'react'
import { withTheme } from 'styled-components'
import { Button } from '@blueprintjs/core'
import { remote } from 'electron'
import styled from 'styled-components'
import { Picker } from 'emoji-mart'

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
  width: 314px;
  height: 400px
  right: 10px;
  bottom: 50px;
  background-color: white;
  .emoji-sticker-picker__sticker-picker {
    height: 300px;
    width: 314px;
    overflow: scroll;
    img {
      max-width: 300px;
      height: auto;
    }
  }
`

const EmojiPickerWrapper = styled.div`
  .emoji-mart-emoji-native, .emoji-mart {
    font-family: inherit
  }

  .emoji-mart-category .emoji-mart-emoji span {
    height: auto !important;
    width: auto !important;
  }

  @media only screen and (max-height: 530px) {
    .emoji-mart-scroll {
      height: 100px;
    }
  }

  @media only screen and (max-width: 600px) {
    width: 272px;

    .emoji-mart-title-label {
      font-size: 20px;
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
    <div className='emoji-sticker-picker__sticker-picker'>
      <h1>{stickerPackName}</h1>
      { stickerPackImages.map((filePath, index) => {
          return (
            <img
              key={index}
              src={filePath}
              onClick={onClickSticker.bind(this, filePath)}
            />
          )
      })}
    </div>
  )
}

export const StickerPicker = props => {
  const { stickers, chatId } = props
  return (
    <div>
      { console.log(stickers, Object.keys(stickers)) }
      { Object.keys(stickers).map(stickerPackName => {
          return <StickerDiv
            chatId={chatId}
            key={stickerPackName}
            stickerPackName={stickerPackName}
            stickerPackImages={stickers[stickerPackName]}
          />
      })}
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
      <div className='emoji-sticker-picker__titlebar'>
        <div onClick={() => setShowSticker(false)}>Emoji</div>
        <div onClick={() => setShowSticker(true)} style={{float:'right'}}>Sticker</div>
      </div>
      { !showSticker &&
        <EmojiPickerWrapper ref={ref}>
          <Picker
            style={{ width: '100%', height: '100%' }}
            native
            color={color}
            onSelect={onEmojiSelect}
            showPreview={false}
            showSkinTones={false}
            emojiTooltip
          />
        </EmojiPickerWrapper>
      }
      { showSticker && stickers !== null && typeof stickers === 'object' && <StickerPicker chatId={chatId} stickers={stickers} /> }
    </EmojiAndStickerPickerWrapper>
  )
})
