import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import { C, T } from '@deltachat/jsonrpc-client'

import MenuAttachment from './menuAttachment'
import ComposerMessageInput from './ComposerMessageInput'
import { getLogger } from '../../../../shared/logger'
import { EmojiAndStickerPicker } from './EmojiAndStickerPicker'
import { replaceColonsSafe } from '../conversations/emoji'
import { Quote } from '../message/Message'
import { DraftAttachment } from '../attachment/messageAttachment'
import { useSettingsStore } from '../../stores/settings'
import {
  BackendRemote,
  EffectfulBackendActions,
  onDCEvent,
  Type,
} from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { MessageTypeAttachmentSubset } from '../attachment/Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { confirmDialog } from '../message/messageFunctions'
import { ProtectionBrokenDialog } from '../dialogs/ProtectionStatusDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'
import useChat from '../../hooks/chat/useChat'

import type { EmojiData, BaseEmoji } from 'emoji-mart/index'
import type { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'
import { VisualVCardComponent } from '../message/VCard'
import { KeybindAction } from '../../keybindings'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import { CloseButton } from '../Dialog'

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

const Composer = forwardRef<
  any,
  {
    isContactRequest: boolean
    isProtectionBroken: boolean
    selectedChat: Type.FullChat
    messageInputRef: React.MutableRefObject<ComposerMessageInput | null>
    draftState: DraftObject
    removeQuote: () => void
    updateDraftText: (text: string, InputChatId: number) => void
    addFileToDraft: (file: string, viewType: T.Viewtype) => Promise<void>
    removeFile: () => void
    clearDraft: () => void
  }
>((props, ref) => {
  const {
    isContactRequest,
    isProtectionBroken,
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

  const emojiAndStickerRef = useRef<HTMLDivElement>(null)
  const pickerButtonRef = useRef<HTMLButtonElement>(null)

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { openDialog } = useDialog()
  const { sendMessage } = useMessage()
  const { unselectChat } = useChat()

  const hasSecureJoinEnded = useRef<boolean>(false)
  useEffect(() => {
    if (hasSecureJoinEnded) {
      // after can send was updated
      window.__reloadDraft && window.__reloadDraft()
      hasSecureJoinEnded.current = false
    }
  }, [selectedChat.canSend])

  useEffect(() => {
    return onDCEvent(accountId, 'SecurejoinJoinerProgress', ({ progress }) => {
      // fix bug where composer was locked after joining a group via qr code
      if (progress === 1000) {
        // if already updated can send, currently this is not the case
        window.__reloadDraft && window.__reloadDraft()
        hasSecureJoinEnded.current = true
      }
    })
  }, [accountId])

  const composerSendMessage = async () => {
    if (chatId === null) {
      throw new Error('chat id is undefined')
    }
    if (!messageInputRef.current) {
      throw new Error('messageInputRef is undefined')
    }
    const textareaRef = messageInputRef.current.textareaRef.current
    if (textareaRef) {
      if (textareaRef.disabled) {
        throw new Error(
          'text area is disabled, this means it is either already sending or loading the draft'
        )
      }
      textareaRef.disabled = true
    }
    try {
      const message = messageInputRef.current.getText()
      if (message.match(/^\s*$/) && !draftState.file) {
        log.debug(`Empty message: don't send it...`)
        return
      }

      const sendMessagePromise = sendMessage(accountId, chatId, {
        text: replaceColonsSafe(message),
        file: draftState.file || undefined,
        quotedMessageId:
          draftState.quote?.kind === 'WithMessage'
            ? draftState.quote.messageId
            : null,
        viewtype: draftState.viewType,
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

  const onEmojiIconClick = () => setShowEmojiPicker(!showEmojiPicker)
  const shiftPressed = useRef(false)
  const onEmojiSelect = (emoji: EmojiData) => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    messageInputRef.current?.insertStringAtCursorPosition(
      (emoji as BaseEmoji).native
    )
    if (!shiftPressed.current) {
      setShowEmojiPicker(false)
      messageInputRef.current?.focus()
    }
  }
  // track shift key -> update [shiftPressed]
  // also handle escape key for emoji picker
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.code === 'Shift') {
        shiftPressed.current = ev.shiftKey
      }
      if (ev.type === 'keydown' && ev.code === 'Escape') {
        setShowEmojiPicker(false)
      }
    }
    // these options are needed, otherwise emoji mart sometimes eats the keydown event
    // and we don't get it here
    const opt = { passive: true, capture: true }
    document.addEventListener('keydown', onKey, opt)
    document.addEventListener('keyup', onKey, opt)
    return () => {
      const opt = { capture: true }
      document.removeEventListener('keydown', onKey, opt)
      document.removeEventListener('keyup', onKey, opt)
    }
  }, [shiftPressed])
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

    // `setTimeout` to work around the fact that otherwise we'd catch
    // the "click" event that caused the emoji picker to open
    // in the first place, resulting in it getting closed immediately.
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', onClick)
    })
    return () => {
      clearTimeout(timeoutId)
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
    // when there is a file then don't paste text
    // https://github.com/deltachat/deltachat-desktop/issues/3261
    e.preventDefault()

    // File object
    // https://www.electronjs.org/docs/api/file-object
    const file = e.clipboardData.files[0]

    log.debug(
      `paste: received file: "${file.name}" ${file.type}`,
      e.clipboardData.files
    )

    const msgType: Viewtype = file.type.startsWith('image') ? 'Image' : 'File'

    try {
      // Write clipboard to file then attach it to the draft
      const path = await runtime.writeClipboardToTempFile()
      await addFileToDraft(path, msgType)
      // delete file again after it was sucessfuly added
      await runtime.removeTempFile(path)
    } catch (err) {
      log.error('Failed to paste file.', err)
    }
  }

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
          onClick={async () => {
            if (selectedChat.chatType !== C.DC_CHAT_TYPE_SINGLE) {
              // if chat gets deleted instead of blocked ask user for confirmation
              if (
                !(await confirmDialog(
                  openDialog,
                  tx('ask_delete_named_chat', selectedChat.name),
                  tx('delete'),
                  true
                ))
              ) {
                return
              }
            }
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
  } else if (isProtectionBroken) {
    return (
      <div ref={ref} className='composer contact-request'>
        <div
          className='contact-request-button'
          onClick={async () => {
            openDialog(ProtectionBrokenDialog, { name: selectedChat.name })
          }}
        >
          {tx('more_info_desktop')}
        </div>
        <div
          className='contact-request-button'
          onClick={() => {
            EffectfulBackendActions.acceptChat(selectedAccountId(), chatId)
          }}
        >
          {tx('ok')}
        </div>
      </div>
    )
  } else if (!selectedChat.canSend) {
    return null
  } else {
    return (
      <div className='composer' ref={ref}>
        <div className='upper-bar'>
          {draftState.quote !== null && (
            <div className='attachment-quote-section is-quote'>
              <Quote quote={draftState.quote} />
              <CloseButton onClick={removeQuote} />
            </div>
          )}
          {draftState.file && !draftState.vcardContact && (
            <div className='attachment-quote-section is-attachment'>
              {/* TODO make this pretty: draft image/video/attachment */}
              {/* <p>file: {draftState.file}</p> */}
              {/* {draftState.viewType} */}
              <DraftAttachment attachment={draftState} />
              <CloseButton onClick={removeFile} />
            </div>
          )}
          {draftState.vcardContact && (
            <div className='attachment-quote-section is-attachment'>
              <VisualVCardComponent vcardContact={draftState.vcardContact} />
              <CloseButton onClick={removeFile} />
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
          <button
            type='button'
            className='emoji-button'
            ref={pickerButtonRef}
            onClick={onEmojiIconClick}
            aria-label={tx('emoji')}
          >
            <span />
          </button>
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
      </div>
    )
  }
})

export default Composer

export type DraftObject = { chatId: number } & Pick<
  Type.Message,
  'text' | 'file' | 'quote' | 'viewType' | 'vcardContact'
> &
  MessageTypeAttachmentSubset

function emptyDraft(chatId: number | null): DraftObject {
  return {
    chatId: chatId || 0,
    text: '',
    file: null,
    fileBytes: 0,
    fileMime: null,
    fileName: null,
    quote: null,
    viewType: 'Text',
    vcardContact: null,
  }
}

export function useDraft(
  accountId: number,
  chatId: number | null,
  isContactRequest: boolean,
  isProtectionBroken: boolean,
  inputRef: React.MutableRefObject<ComposerMessageInput | null>
): {
  draftState: DraftObject
  removeQuote: () => void
  updateDraftText: (text: string, InputChatId: number) => void
  addFileToDraft: (file: string, viewType: T.Viewtype) => Promise<void>
  removeFile: () => void
  clearDraft: () => void
} {
  const [draftState, _setDraft] = useState<DraftObject>(emptyDraft(chatId))
  const draftRef = useRef<DraftObject>(emptyDraft(chatId))
  draftRef.current = draftState

  const clearDraft = useCallback(() => {
    _setDraft(_ => emptyDraft(chatId))
  }, [chatId])

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
            vcardContact: newDraft.vcardContact,
          }))
          inputRef.current?.setText(newDraft.text)
        }
        inputRef.current?.setState({ loadingDraft: false })
        setTimeout(() => {
          inputRef.current?.focus()
        })
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
  }, [chatId, loadDraft, isContactRequest, isProtectionBroken])

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
        draft.quote?.kind === 'WithMessage' ? draft.quote.messageId : null,
        draft.viewType
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
        vcardContact: newDraft.vcardContact,
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
    inputRef.current?.focus()
  }, [inputRef, saveDraft])

  const removeFile = useCallback(() => {
    draftRef.current.file = ''
    draftRef.current.viewType = 'Text'
    saveDraft()
    inputRef.current?.focus()
  }, [inputRef, saveDraft])

  const addFileToDraft = useCallback(
    async (file: string, viewType: Viewtype) => {
      draftRef.current.file = file
      draftRef.current.viewType = viewType
      inputRef.current?.focus()
      return saveDraft()
    },
    [inputRef, saveDraft]
  )

  const settingsStore = useSettingsStore()[0]
  useKeyBindingAction(KeybindAction.Composer_SelectReplyToUp, () => {
    if (settingsStore?.desktopSettings.enableCtrlUpToReplyShortcut !== true) {
      return
    }
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToUp)
  })
  useKeyBindingAction(KeybindAction.Composer_SelectReplyToDown, () => {
    if (settingsStore?.desktopSettings.enableCtrlUpToReplyShortcut !== true) {
      return
    }
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToDown)
  })
  useKeyBindingAction(KeybindAction.Composer_CancelReply, () => {
    if (settingsStore?.desktopSettings.enableCtrlUpToReplyShortcut !== true) {
      return
    }
    removeQuote()
  })
  const { jumpToMessage } = useMessage()
  const onSelectReplyToShortcut = async (
    upOrDown:
      | KeybindAction.Composer_SelectReplyToUp
      | KeybindAction.Composer_SelectReplyToDown
  ) => {
    if (chatId == undefined) {
      return
    }
    const quoteMessage = (messageId: number) => {
      draftRef.current.quote = {
        kind: 'WithMessage',
        messageId,
      } as Type.MessageQuote
      saveDraft()

      // TODO perf: jumpToMessage is not instant, but it should be
      // since the message is (almost?) always already rendered.
      jumpToMessage(accountId, messageId, chatId, true)
    }
    // TODO perf: I imagine this is pretty slow, given IPC and some chats
    // being quite large. Perhaps we could hook into the
    // MessageList component, or share the list of messages with it.
    // If not, at least cache this list. Use the cached version first,
    // then, when the Promise resolves, execute this code again in case
    // the message list got updated so that it feels more reponsive.
    const messageIds = await BackendRemote.rpc.getMessageIds(
      accountId,
      chatId,
      false,
      false
    )
    const currQuote = draftRef.current.quote
    if (!currQuote) {
      if (upOrDown === KeybindAction.Composer_SelectReplyToUp) {
        quoteMessage(messageIds[messageIds.length - 1])
      }
      return
    }
    if (currQuote.kind !== 'WithMessage') {
      // Or shall we override with the last message?
      return
    }
    const currQuoteMessageIdInd = messageIds.lastIndexOf(currQuote.messageId)
    if (
      currQuoteMessageIdInd === messageIds.length - 1 && // Last message
      upOrDown === KeybindAction.Composer_SelectReplyToDown
    ) {
      removeQuote()
      return
    }
    const newId: number | undefined =
      messageIds[
        upOrDown === KeybindAction.Composer_SelectReplyToUp
          ? currQuoteMessageIdInd - 1
          : currQuoteMessageIdInd + 1
      ]
    if (newId == undefined) {
      return
    }
    quoteMessage(newId)
  }

  useEffect(() => {
    window.__setQuoteInDraft = (messageId: number) => {
      draftRef.current.quote = {
        kind: 'WithMessage',
        messageId,
      } as Partial<Type.MessageQuote> as any as Type.MessageQuote
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
