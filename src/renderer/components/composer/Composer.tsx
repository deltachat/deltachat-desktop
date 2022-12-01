import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import MenuAttachment from '../attachment/menuAttachment'
import { useTranslationFunction } from '../../contexts'
import ComposerMessageInput from './ComposerMessageInput'
import { getLogger } from '../../../shared/logger'
import { EmojiAndStickerPicker } from './EmojiAndStickerPicker'
import { EmojiData, BaseEmoji } from 'emoji-mart'
import { replaceColonsSafe } from '../conversations/emoji'
import { Quote } from '../message/Message'
import { DraftAttachment } from '../attachment/messageAttachment'
import { sendMessage, unselectChat } from '../helpers/ChatMethods'
import { useSettingsStore } from '../../stores/settings'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { MessageTypeAttachmentSubset } from '../attachment/Attachment'
import { runtime } from '../../runtime'
import { C } from 'deltachat-node/node/dist/constants'
import { EncryptionModusPopup } from '../message/EncyptionModusPopup'
import classNames from 'classnames'
import {EncryptionModus} from '@deltachat/jsonrpc-client/dist/generated/types'

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
      className='clear-quote-icon bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross clear-button'
    />
  )
}

const Composer = forwardRef<
  any,
  {
    isDisabled: boolean
    disabledReason: string
    isContactRequest: boolean
    selectedChat: Type.FullChat
    messageInputRef: React.MutableRefObject<ComposerMessageInput | null>
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
    isContactRequest,
    selectedChat,
    messageInputRef,
    draftState,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
  } = props

  const chatId = selectedChat.id
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showEncryptionModusPopup, setShowEncryptionModusPopup] = useState(
    false
  )

  const [encryptionModus, _setEncryptionModus] = useState<EncryptionModus>('Opportunistic')
  useEffect(() => {
    (async () => {
      const encryptionModus = await BackendRemote.rpc.getChatEncryptionModus(selectedAccountId(), chatId)
      if (encryptionModus === null) return
      _setEncryptionModus(encryptionModus)
    })()
  }, [chatId])
  const setEncryptionModus = async (state: EncryptionModus) => {
    await BackendRemote.rpc.setChatEncryptionModus(selectedAccountId(), chatId, state)
    _setEncryptionModus(state)
  }

  const emojiAndStickerRef = useRef<HTMLDivElement>(null)
  const encryptionModusPopupRef = useRef<HTMLDivElement>(null)
  const pickerButtonRef = useRef<HTMLDivElement>(null)

  const composerSendMessage = async () => {
    if (chatId === null) {
      throw new Error('chat id is undefined')
    }
    if (!messageInputRef.current) {
      throw new Error('messageInputRef is undefined')
    }
    const textareaRef = messageInputRef.current.textareaRef.current
    if (textareaRef) {
      textareaRef.disabled = true
    }
    try {
      const message = messageInputRef.current.getText()
      if (message.match(/^\s*$/) && !draftState.file) {
        log.debug(`Empty message: don't send it...`)
        return
      }

      const sendMessagePromise = sendMessage(chatId, {
        text: replaceColonsSafe(message),
        filename: draftState.file || undefined,
        quoteMessageId:
          draftState.quote?.kind === 'WithMessage'
            ? draftState.quote.messageId
            : undefined,
      })

      /* clear it here to make sure the draft is cleared */
      await BackendRemote.rpc.removeDraft(selectedAccountId(), chatId)
      // /* update the state to reflect the removed draft */
      window.__reloadDraft && window.__reloadDraft()

      await sendMessagePromise
    } catch (error) {
      log.error(error)
    } finally {
      if (textareaRef) {
        textareaRef.disabled = false
      }
      messageInputRef.current.focus()
    }
  }

  const onEmojiIconClick = () => {
    setShowEmojiPicker(!showEmojiPicker)
    setShowEncryptionModusPopup(false)
  }
  const onEncryptionModusIconClick = () => {
    setShowEncryptionModusPopup(!showEncryptionModusPopup)
    setShowEmojiPicker(false)
  }
  const onEmojiSelect = (emoji: EmojiData) => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current?.insertStringAtCursorPosition(
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
      if (emojiAndStickerRef.current) {
        const emojiBoundingRect = emojiAndStickerRef.current.getBoundingClientRect()
        const clickIsOutSideEmojiPicker = !insideBoundingRect(
          clientX,
          clientY,
          emojiBoundingRect,
          2
        )
        clickIsOutSideEmojiPicker && setShowEmojiPicker(false)
      }
      if (encryptionModusPopupRef.current) {
        const encryptionModusBoundingRect = encryptionModusPopupRef.current.getBoundingClientRect()
        const clickIsOutSideEncryptionModusPopup = !insideBoundingRect(
          clientX,
          clientY,
          encryptionModusBoundingRect,
          2
        )
        clickIsOutSideEncryptionModusPopup && setShowEncryptionModusPopup(false)
      }
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
      const path = await runtime.writeClipboardToTempFile()
      addFileToDraft(path)
    } catch (err) {
      log.error('Failed to paste file.', err)
    }
  }

  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  useLayoutEffect(() => {
    // focus composer on chat change
    messageInputRef.current?.focus()
  }, [chatId, messageInputRef])

  if (chatId === null) {
    return <div ref={ref}>Error, chatid missing</div>
  }

  if (isContactRequest) {
    return (
      <div ref={ref} className='composer contact-request'>
        <div
          className='contact-request-button delete'
          onClick={() => {
            EffectfulBackendActions.blockChat(selectedAccountId(), chatId)
            unselectChat()
          }}
        >
          {selectedChat.chatType === C.DC_CHAT_TYPE_SINGLE
            ? tx('block')
            : tx('delete')}
        </div>
        <div
          className='contact-request-button accept'
          onClick={() => {
            EffectfulBackendActions.acceptChat(selectedAccountId(), chatId)
          }}
        >
          {tx('accept')}
        </div>
      </div>
    )
  } else if (isDisabled) {
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
          {draftState.quote !== null && (
            <div className='attachment-quote-section is-quote'>
              <Quote quote={draftState.quote} />
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
          <MenuAttachment
            addFileToDraft={addFileToDraft}
            selectedChat={selectedChat}
          />
          {settingsStore && (
            <ComposerMessageInput
              ref={messageInputRef}
              enterKeySends={settingsStore?.desktopSettings.enterKeySends}
              sendMessage={composerSendMessage}
              chatId={chatId}
              updateDraftText={updateDraftText}
              onPaste={handlePaste}
            />
          )}
          <div
            className='emoji-button'
            ref={pickerButtonRef}
            onClick={onEmojiIconClick}
            aria-label={tx('emoji')}
          >
            <span />
          </div>
          <div
            className={classNames('encryption-modus-button', encryptionModus)}
            onClick={onEncryptionModusIconClick}
            aria-label={tx('encryption_modus')}
          >
            <span />
          </div>
          <div className='send-button-wrapper' onClick={composerSendMessage}>
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
        {showEncryptionModusPopup && (
          <EncryptionModusPopup
            ref={encryptionModusPopupRef}
            setShowEncryptionModusPopup={setShowEncryptionModusPopup}
            encryptionModus={encryptionModus}
            setEncryptionModus={setEncryptionModus}
          />
        )}
      </div>
    )
  }
})

export default Composer

export type DraftObject = { chatId: number } & Pick<
  Type.Message,
  'text' | 'file' | 'quote'
> &
  MessageTypeAttachmentSubset

export function useDraft(
  chatId: number | null,
  isContactRequest: boolean,
  inputRef: React.MutableRefObject<ComposerMessageInput | null>
): {
  draftState: DraftObject
  removeQuote: () => void
  updateDraftText: (text: string, InputChatId: number) => void
  addFileToDraft: (file: string) => void
  removeFile: () => void
  clearDraft: () => void
} {
  const [draftState, _setDraft] = useState<DraftObject>({
    chatId: chatId || 0,
    text: '',
    file: null,
    fileBytes: 0,
    fileMime: null,
    fileName: null,
    quote: null,
  })
  const draftRef = useRef<DraftObject>({
    chatId: chatId || 0,
    text: '',
    file: null,
    fileBytes: 0,
    fileMime: null,
    fileName: null,
    quote: null,
  })
  draftRef.current = draftState

  const clearDraft = useCallback(() => {
    _setDraft(_ => ({
      chatId: chatId || 0,
      text: '',
      file: null,
      fileBytes: 0,
      fileMime: null,
      fileName: null,
      quote: null,
    }))
    inputRef.current?.focus()
  }, [chatId, inputRef])

  const loadDraft = useCallback(
    (chatId: number) => {
      BackendRemote.rpc.getDraft(selectedAccountId(), chatId).then(newDraft => {
        if (!newDraft) {
          log.debug('no draft')
          clearDraft()
          inputRef.current?.setText('')
        } else {
          _setDraft(old => ({
            ...old,
            text: newDraft.text || '',
            file: newDraft.file,
            fileBytes: newDraft.fileBytes,
            fileMime: newDraft.fileMime,
            fileName: newDraft.fileName,
            viewType: newDraft.viewType,
            quote: newDraft.quote,
          }))
          inputRef.current?.setText(newDraft.text)
        }
        inputRef.current?.setState({ loadingDraft: false })
      })
    },
    [clearDraft, inputRef]
  )

  useEffect(() => {
    log.debug('reloading chat because id changed', chatId)
    //load
    loadDraft(chatId || 0)
    window.__reloadDraft = loadDraft.bind(null, chatId || 0)
    return () => {
      window.__reloadDraft = null
    }
  }, [chatId, loadDraft, isContactRequest])

  const saveDraft = useCallback(async () => {
    if (chatId === null) {
      return
    }
    if (inputRef.current?.textareaRef.current?.disabled) {
      // Guard against strange races
      log.warn('Do not save draft while sending')
      return
    }
    const accountId = selectedAccountId()

    const draft = draftRef.current
    const oldChatId = chatId
    if (
      (draft.text && draft.text.length > 0) ||
      (draft.file && draft.file != '') ||
      !!draft.quote
    ) {
      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        draft.text,
        draft.file !== '' ? draft.file : null,
        draft.quote?.kind === 'WithMessage' ? draft.quote.messageId : null
      )
    } else {
      await BackendRemote.rpc.removeDraft(accountId, chatId)
    }

    if (oldChatId !== chatId) {
      log.debug('switched chat no reloading of draft required')
      return
    }
    const newDraft = chatId
      ? await BackendRemote.rpc.getDraft(accountId, chatId)
      : null
    if (newDraft) {
      _setDraft(old => ({
        ...old,
        file: newDraft.file,
        fileBytes: newDraft.fileBytes,
        fileMime: newDraft.fileMime,
        fileName: newDraft.fileName,
        viewType: newDraft.viewType,
        quote: newDraft.quote,
      }))
      // don't load text to prevent bugging back
    } else {
      clearDraft()
    }
  }, [chatId, clearDraft, inputRef])

  const updateDraftText = (text: string, InputChatId: number) => {
    if (chatId !== InputChatId) {
      log.warn("chat Id and InputChatId don't match, do nothing")
    } else {
      if (draftRef.current) {
        draftRef.current.text = text // don't need to rerender on text change
      }
      saveDraft()
    }
  }

  const removeQuote = useCallback(() => {
    if (draftRef.current) {
      draftRef.current.quote = null
    }
    saveDraft()
  }, [saveDraft])

  const removeFile = useCallback(() => {
    draftRef.current.file = ''
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
      draftRef.current.quote = (({
        kind: 'WithMessage',
        messageId,
      } as Partial<Type.MessageQuote>) as any) as Type.MessageQuote
      saveDraft()
      inputRef.current?.focus()
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
