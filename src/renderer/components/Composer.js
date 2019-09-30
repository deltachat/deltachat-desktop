import React, { useState, useRef } from 'react'
import styled, { withTheme } from 'styled-components'

import { Button } from '@blueprintjs/core'
import { remote } from 'electron'

import { Picker } from 'emoji-mart'

import logger from '../../logger'
import SettingsContext from '../contexts/SettingsContext'
import ComposerMessageInput from './ComposerMessageInput'
import { callDcMethodAsync } from '../ipc'
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

const EmojiPickerWrapper = styled.div`
  position: fixed;

  z-index: 10;
  width: 314px;
  right: 10px;
  bottom: 50px;

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

const Composer = withTheme(React.forwardRef((props, composerRef) => {
  const { onSubmit, setComposerSize, chatId, draft, theme } = props
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
    onSubmit({
      text: message
    })
    messageInputRef.current.clearText()
    messageInputRef.current.focus()
  }

  const addFilename = () => {
    remote.dialog.showOpenDialog(
      { properties: ['openFile'] },
      filenames => { filenames && filenames[0] && onSubmit({ filename: filenames[0] }) }
    )
  }

  const insideBoundingRect = (mouseX, mouseY, boundingRect, margin = 0) => {
    return mouseX >= boundingRect.x - margin &&
           mouseX <= boundingRect.x + boundingRect.width + margin &&
           mouseY >= boundingRect.y - margin &&
           mouseY <= boundingRect.y + boundingRect.height + margin
  }

  const onMouseMove = event => {
    const x = event.clientX
    const y = event.clientY
    if (showEmojiPicker === false) return

    const bounding = pickerRef.current.getBoundingClientRect()
    const boundingButton = pickerButtonRef.current.getBoundingClientRect()

    if (!insideBoundingRect(x, y, bounding, 10) &&
        !insideBoundingRect(x, y, boundingButton, 10)) {
      log.debug(`Closing EmojiPicker x: ${x} y: ${y}`)
      setShowEmojiPicker(false)
    }
  }

  const onClickEmojiPicker = show => {
    if (show) {
      document.addEventListener('mousemove', onMouseMove)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
    }
    setShowEmojiPicker(show)
  }

  const onEmojiSelect = emoji => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current.insertStringAtCursorPosition(emoji.native)
  }

  const onClickStickers = async () => {
    const stickers = await callDcMethodAsync('getStickers')
    console.log('stickers', stickers)
  }

  const tx = window.translate

  return (
    <ComposerWrapper ref={composerRef}>
      <AttachmentButtonWrapper>
        <Button minimal
          icon='paperclip'
          onClick={addFilename.bind(this)}
          aria-label={tx('a11y_attachment_btn_label')} />
      </AttachmentButtonWrapper>
      <SettingsContext.Consumer>
        {({ enterKeySends }) => (
          <ComposerMessageInput
            ref={messageInputRef}
            enterKeySends={enterKeySends}
            sendMessage={sendMessage}
            setComposerSize={setComposerSize}
            chatId={chatId}
            draft={draft}
          />
        )}
      </SettingsContext.Consumer>
      <EmojiButtonWrapper ref={pickerButtonRef}>
        <IconButton onClick={onClickEmojiPicker.bind(this, true)} aria-label={tx('a11y_emoji_btn_label')}>
          <IconButtonSpan />
        </IconButton>
      </EmojiButtonWrapper>
      { showEmojiPicker &&
        <EmojiPickerWrapper ref={pickerRef}>
          <Picker
            style={{ width: '100%', height: '100%' }}
            native
            color={theme.emojiSelectorSelectionColor}
            onSelect={onEmojiSelect}
            showPreview={false}
            showSkinTones={false}
            emojiTooltip
          />
        </EmojiPickerWrapper>
      }
      <button onClick={onClickStickers}>Stickers</button>
      <SendButtonCircleWrapper onClick={sendMessage}>
        <SendButton aria-label={tx('a11y_send_btn_label')} />
      </SendButtonCircleWrapper>
    </ComposerWrapper>
  )
}))

export default Composer
