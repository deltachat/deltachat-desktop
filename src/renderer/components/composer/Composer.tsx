import React, { useRef, useState, useEffect, forwardRef } from 'react'
import { Button } from '@blueprintjs/core'

import { SettingsContext, useTranslationFunction } from '../../contexts'
import ComposerMessageInput from './ComposerMessageInput'
import { getLogger } from '../../../shared/logger'
import { EmojiAndStickerPicker } from './EmojiAndStickerPicker'
import { useChatStore } from '../../stores/chat'
import { EmojiData, BaseEmoji } from 'emoji-mart'
import { replaceColonsSafe } from '../conversations/emoji'
import { JsonMessage, MessageType } from '../../../shared/shared-types'
import { Qoute } from '../message/Message'
import { DeltaBackend, sendMessageParams } from '../../delta-remote'
import { DraftAttachment } from '../attachment/messageAttachment'
import { C } from 'deltachat-node'
const { remote } = window.electron_functions

const log = getLogger('renderer/composer')

const insideBoundingRect = (
  mouseX: number,
  mouseY: number,
  boundingRect: DOMRect,
  margin = 0
) => {
  return (
    mouseX >= boundingRect.x - margin &&
    mouseX <= boundingRect.x + boundingRect.width + margin &&
    mouseY >= boundingRect.y - margin &&
    mouseY <= boundingRect.y + boundingRect.height + margin
  )
}

const Composer = forwardRef<
  any,
  {
    isDisabled: boolean
    disabledReason: string
    chatId: number
    setComposerSize: (size: number) => void
  }
>((props, ref) => {
  const { isDisabled, disabledReason, chatId } = props
  const chatStoreDispatch = useChatStore()[1]
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messageInputRef = useRef<ComposerMessageInput>()
  const emojiAndStickerRef = useRef<HTMLDivElement>()
  const pickerButtonRef = useRef()

  const {
    draftState,
    updateDraftText,
    removeQuote,
    addFileToDraft,
    removeFile,
    clearDraft,
  } = useDraft(chatId, messageInputRef)

  const sendMessage = () => {
    const message = messageInputRef.current.getText()
    if (message.match(/^\s*$/) && !draftState.file) {
      log.debug(`Empty message: don't send it...`)
      return
    }
    chatStoreDispatch({
      type: 'SEND_MESSAGE',
      payload: [
        chatId,
        {
          text: replaceColonsSafe(message),
          filename: draftState.file,
          qouteMessageId: draftState.quotedMessageId,
        } as sendMessageParams,
      ],
    })

    messageInputRef.current.clearText()
    messageInputRef.current.focus()
    /* clear it here to make sure the draft is cleared */
    DeltaBackend.call('messageList.setDraft', chatId, {
      text: '',
      file: null,
      quotedMessageId: null,
    })
    /* update the state to reflect the removed draft */
    clearDraft()
  }

  const addFilename = () => {
    remote.dialog.showOpenDialog(
      { properties: ['openFile'] },
      (filenames: string[]) => {
        if (filenames && filenames[0]) {
          addFileToDraft(filenames[0])
        }
      }
    )
  }

  const onEmojiIconClick = () => setShowEmojiPicker(!showEmojiPicker)
  const onEmojiSelect = (emoji: EmojiData) => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current.insertStringAtCursorPosition(
      (emoji as BaseEmoji).native
    )
  }
  useEffect(() => {
    if (!showEmojiPicker) return
    const onClick = ({
      clientX,
      clientY,
    }: {
      clientX: number
      clientY: number
    }) => {
      if (!emojiAndStickerRef.current) return
      const boundingRect = emojiAndStickerRef.current.getBoundingClientRect()
      const clickIsOutSideEmojiPicker = !insideBoundingRect(
        clientX,
        clientY,
        boundingRect,
        2
      )
      if (clickIsOutSideEmojiPicker) setShowEmojiPicker(false)
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [showEmojiPicker, emojiAndStickerRef])

  const tx = useTranslationFunction()

  if (isDisabled) {
    if (disabledReason) {
      return (
        <div ref={ref} className='composer composer--disabled-message-input'>
          {tx(disabledReason)}
        </div>
      )
    } else {
      return <span />
    }
  } else {
    return (
      <div className='composer' ref={ref}>
        <div className='upper-bar'>
          {draftState.quotedText !== null && (
            <div className='quote-section'>
              <Qoute
                quotedText={draftState.quotedText}
                quotedMessageId={draftState.quotedMessageId}
              />
              <button onClick={removeQuote}>X</button>
            </div>
          )}
          {draftState.file && (
            <div>
              <div className='attachment-section'>
                {/* TODO make this pretty: draft image/video/attachment */}
                {/* <p>file: {draftState.file}</p> */}
                <div style={{ flexGrow: 1 }}>
                  <DraftAttachment attachment={draftState.attachment} />
                </div>
                <button onClick={removeFile}>X</button>
              </div>
              <div>{`draftState.viewType ->${draftState.viewType}`}</div>
            </div>
          )}
        </div>
        <div className='lower-bar'>
          <div className='attachment-button'>
            <Button
              minimal
              icon='paperclip'
              onClick={addFilename.bind(this)}
              aria-label={tx('attachment')}
            />
          </div>
          <SettingsContext.Consumer>
            {({ desktopSettings }) => (
              <ComposerMessageInput
                ref={messageInputRef}
                enterKeySends={desktopSettings.enterKeySends}
                sendMessage={sendMessage}
                setComposerSize={props.setComposerSize}
                chatId={chatId}
                updateDraftText={updateDraftText}
              />
            )}
          </SettingsContext.Consumer>
          <div
            className='emoji-button'
            ref={pickerButtonRef}
            onClick={onEmojiIconClick}
            aria-label={tx('emoji')}
          >
            <span />
          </div>
          <div className='send-button-wrapper' onClick={sendMessage}>
            <button aria-label={tx('menu_send')} />
          </div>
        </div>
        {showEmojiPicker && (
          <EmojiAndStickerPicker
            chatId={chatId}
            ref={emojiAndStickerRef}
            onEmojiSelect={onEmojiSelect}
            setShowEmojiPicker={setShowEmojiPicker}
          />
        )}
      </div>
    )
  }
})

export default Composer

type draftObject = { chatId: number } & Pick<
  JsonMessage,
  'text' | 'file' | 'quotedMessageId' | 'quotedText'
> &
  Pick<MessageType['msg'], 'attachment' | 'viewType'>

function useDraft(
  chatId: number,
  inputRef: React.MutableRefObject<ComposerMessageInput>
) {
  const [draftState, _setDraft] = useState<draftObject>({
    chatId,
    text: '',
    file: null,
    attachment: null,
    viewType: null,
    quotedMessageId: 0,
    quotedText: null,
  })
  const draftRef = useRef<draftObject>()
  draftRef.current = draftState

  useEffect(() => {
    log.debug('reloading chat because id changed', chatId)
    //load
    DeltaBackend.call('messageList.getDraft', chatId).then(newDraft => {
      if (!newDraft) {
        log.debug('no draft')
        clearDraft()
        inputRef.current?.setText('')
      } else {
        _setDraft(old => ({
          ...old,
          text: newDraft.msg.text,
          file: newDraft.msg.file,
          attachment: newDraft.msg.attachment,
          viewType: newDraft.msg.viewType,
          quotedMessageId: newDraft.msg.quotedMessageId,
          quotedText: newDraft.msg.quotedText,
        }))
        inputRef.current?.setText(newDraft.msg.text)
      }
    })
  }, [chatId])

  const saveDraft = async () => {
    const draft = draftRef.current
    const oldChatId = chatId
    await DeltaBackend.call('messageList.setDraft', chatId, {
      text: draft.text,
      file: draft.file,
      quotedMessageId: draft.quotedMessageId,
    })

    if (oldChatId !== chatId) {
      log.debug('switched chat no reloading of draft required')
      return
    }
    const newDraft = await DeltaBackend.call('messageList.getDraft', chatId)
    if (newDraft) {
      _setDraft(old => ({
        ...old,
        file: newDraft.msg.file,
        attachment: newDraft.msg.attachment,
        viewType: newDraft.msg.viewType,
        quotedMessageId: newDraft.msg.quotedMessageId,
        quotedText: newDraft.msg.quotedText,
      }))
      // don't load text to prevent bugging back
    } else {
      clearDraft()
    }
  }

  const updateDraftText = (text: string, InputChatId: number) => {
    if (chatId !== InputChatId) {
      log.warn("chat Id and InputChatId don't match, do nothing")
    } else {
      draftRef.current.text = text // don't need to rerender on text change
      saveDraft()
    }
  }

  const removeQuote = () => {
    draftRef.current.quotedMessageId = null
    saveDraft()
  }

  const removeFile = () => {
    draftRef.current.file = null
    saveDraft()
  }

  const addFileToDraft = (file: string) => {
    draftRef.current.file = file
    saveDraft()
  }

  const clearDraft = () => {
    _setDraft(_ => ({
      chatId,
      text: '',
      file: null,
      attachment: null,
      viewType: null,
      quotedMessageId: 0,
      quotedText: null,
    }))
  }

  useEffect(() => {
    window.__setQuoteInDraft = (messageId: number) => {
      draftRef.current.quotedMessageId = messageId
      saveDraft()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  })

  return {
    draftState,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraft,
  }
}
