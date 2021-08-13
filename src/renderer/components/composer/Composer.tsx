import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import { Button } from '@blueprintjs/core'

import { SettingsContext, useTranslationFunction } from '../../contexts'
import ComposerMessageInput from './ComposerMessageInput'
import { getLogger } from '../../../shared/logger'
import { EmojiAndStickerPicker } from './EmojiAndStickerPicker'
import { useChatStore } from '../../stores/chat'
import { EmojiData, BaseEmoji } from 'emoji-mart'
import { replaceColonsSafe } from '../conversations/emoji'
import {
  JsonMessage,
  MessageTypeAttachmentSubset,
} from '../../../shared/shared-types'
import { Quote } from '../message/Message'
import { DeltaBackend, sendMessageParams } from '../../delta-remote'
import { DraftAttachment } from '../attachment/messageAttachment'
import { runtime } from '../../runtime'

const log = getLogger('renderer/composer')

export const insideBoundingRect = (
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

const QuoteOrDraftRemoveButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      aria-label='Clear'
      className='clear-quote-icon bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross clear-button'
    />
  )
}

const Composer = forwardRef<
  any,
  {
    isDisabled: boolean
    disabledReason: string
    chatId: number
    messageInputRef: React.MutableRefObject<ComposerMessageInput>
    draftState: DraftObject
    removeQuote: () => void
    updateDraftText: (text: string, InputChatId: number) => void
    addFileToDraft: (file: string) => void
    removeFile: () => void
    clearDraft: () => void
  }
>((props, ref) => {
  const {
    isDisabled,
    disabledReason,
    chatId,
    messageInputRef,
    draftState,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraft,
  } = props
  const chatStoreDispatch = useChatStore()[1]
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const emojiAndStickerRef = useRef<HTMLDivElement>()
  const pickerButtonRef = useRef()

  const sendMessage = () => {
    const textareaRef = messageInputRef.current.textareaRef.current
    textareaRef.disabled = true
    try {
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
            quoteMessageId: draftState.quotedMessageId,
          } as sendMessageParams,
        ],
      })

      /* clear it here to make sure the draft is cleared */
      DeltaBackend.call('messageList.setDraft', chatId, {
        text: '',
        file: null,
        quotedMessageId: null,
      })
      /* update the state to reflect the removed draft */
      clearDraft()
      messageInputRef.current.clearText()
    } catch (error) {
      log.error(error)
    } finally {
      textareaRef.disabled = false
      messageInputRef.current.focus()
    }
  }

  const addFilename = async () => {
    const file = await runtime.showOpenFileDialog({
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('home'),
    })
    if (file) {
      addFileToDraft(file)
    }
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

  // Paste file functionality
  // https://github.com/deltachat/deltachat-desktop/issues/2108
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Skip if no file
    if (!e.clipboardData.files.length) {
      return
    }

    // File object
    // https://www.electronjs.org/docs/api/file-object
    const file = e.clipboardData.files[0]

    log.debug(`paste: received file: "${file.path}" "${file.name}"`)

    // file.path is always set to empty string?
    if (file.path) {
      addFileToDraft(file.path)
      return
    }

    try {
      // Write clipboard to file then attach it to the draft
      addFileToDraft(await DeltaBackend.call('extras.writeClipboardToTempFile'))
    } catch (err) {
      log.error('Failed to paste file.', err)
    }
  }

  const tx = useTranslationFunction()

  useLayoutEffect(() => {
    // focus composer on chat change
    messageInputRef.current?.focus()
  }, [chatId, messageInputRef])

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
            <div className='attachment-quote-section is-quote'>
              <Quote
                quotedText={draftState.quotedText}
                quotedMessageId={draftState.quotedMessageId}
              />
              <QuoteOrDraftRemoveButton onClick={removeQuote} />
            </div>
          )}
          {draftState.file && (
            <div className='attachment-quote-section is-attachment'>
              {/* TODO make this pretty: draft image/video/attachment */}
              {/* <p>file: {draftState.file}</p> */}
              <DraftAttachment attachment={draftState} />
              <QuoteOrDraftRemoveButton onClick={removeFile} />
            </div>
          )}
        </div>
        <div className='lower-bar'>
          <div className='attachment-button'>
            <Button
              minimal
              icon='paperclip'
              onClick={addFilename.bind(null)}
              aria-label={tx('attachment')}
            />
          </div>
          <SettingsContext.Consumer>
            {({ desktopSettings }) => (
              <ComposerMessageInput
                ref={messageInputRef}
                enterKeySends={desktopSettings.enterKeySends}
                sendMessage={sendMessage}
                chatId={chatId}
                updateDraftText={updateDraftText}
                onPaste={handlePaste}
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

export type DraftObject = { chatId: number } & Pick<
  JsonMessage,
  'text' | 'file' | 'quotedMessageId' | 'quotedText'
> &
  MessageTypeAttachmentSubset

export function useDraft(
  chatId: number,
  inputRef: React.MutableRefObject<ComposerMessageInput>
): {
  draftState: DraftObject
  removeQuote: () => void
  updateDraftText: (text: string, InputChatId: number) => void
  addFileToDraft: (file: string) => void
  removeFile: () => void
  clearDraft: () => void
} {
  const [draftState, _setDraft] = useState<DraftObject>({
    chatId,
    text: '',
    file: null,
    file_bytes: null,
    file_mime: null,
    file_name: null,
    quotedMessageId: 0,
    quotedText: null,
  })
  const draftRef = useRef<DraftObject>()
  draftRef.current = draftState

  const clearDraft = useCallback(() => {
    _setDraft(_ => ({
      chatId,
      text: '',
      file: null,
      file_bytes: null,
      file_mime: null,
      file_name: null,
      quotedMessageId: 0,
      quotedText: null,
    }))
    inputRef.current?.focus()
  }, [chatId, inputRef])

  const loadDraft = useCallback(
    (chatId: number) => {
      DeltaBackend.call('messageList.getDraft', chatId).then(newDraft => {
        if (!newDraft) {
          log.debug('no draft')
          clearDraft()
          inputRef.current?.setText('')
        } else {
          _setDraft(old => ({
            ...old,
            text: newDraft.text,
            file: newDraft.file,
            file_bytes: newDraft.file_bytes,
            file_mime: newDraft.file_mime,
            file_name: newDraft.file_name,
            viewType: newDraft.viewType,
            quotedMessageId: newDraft.quotedMessageId,
            quotedText: newDraft.quotedText,
          }))
          inputRef.current?.setText(newDraft.text)
        }
      })
    },
    [clearDraft, inputRef]
  )

  useEffect(() => {
    log.debug('reloading chat because id changed', chatId)
    //load
    loadDraft(chatId)
    window.__reloadDraft = loadDraft.bind(this, chatId)
    return () => (window.__reloadDraft = null)
  }, [chatId, loadDraft])

  const saveDraft = useCallback(async () => {
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
        file: newDraft.file,
        file_bytes: newDraft.file_bytes,
        file_mime: newDraft.file_mime,
        file_name: newDraft.file_name,
        viewType: newDraft.viewType,
        quotedMessageId: newDraft.quotedMessageId,
        quotedText: newDraft.quotedText,
      }))
      // don't load text to prevent bugging back
    } else {
      clearDraft()
    }
  }, [chatId, clearDraft])

  const updateDraftText = (text: string, InputChatId: number) => {
    if (chatId !== InputChatId) {
      log.warn("chat Id and InputChatId don't match, do nothing")
    } else {
      draftRef.current.text = text // don't need to rerender on text change
      saveDraft()
    }
  }

  const removeQuote = useCallback(() => {
    draftRef.current.quotedMessageId = null
    saveDraft()
  }, [saveDraft])

  const removeFile = useCallback(() => {
    draftRef.current.file = null
    saveDraft()
  }, [saveDraft])

  const addFileToDraft = useCallback(
    (file: string) => {
      draftRef.current.file = file
      saveDraft()
    },
    [saveDraft]
  )

  useEffect(() => {
    window.__setQuoteInDraft = (messageId: number) => {
      draftRef.current.quotedMessageId = messageId
      saveDraft()
      inputRef.current.focus()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  }, [draftRef, inputRef, saveDraft])

  return {
    draftState,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraft,
  }
}
