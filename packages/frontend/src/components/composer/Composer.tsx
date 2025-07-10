import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useLayoutEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react'
import { C, T } from '@deltachat/jsonrpc-client'
import { extension } from 'mime-types'

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
import { VisualVCardComponent } from '../message/VCard'
import { KeybindAction } from '../../keybindings'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import { CloseButton } from '../Dialog'
import { enterKeySendsKeyboardShortcuts } from '../KeyboardShortcutHint'
import { AppPicker } from '../AppPicker'
import { AppInfo, AppStoreUrl } from '../AppPicker'
import OutsideClickHelper from '../OutsideClickHelper'
import { basename } from 'path'
import { useHasChanged2 } from '../../hooks/useHasChanged'
import { ScreenContext } from '../../contexts/ScreenContext'
import {
  AudioErrorType,
  AudioRecorder,
  AudioRecorderError,
} from '../AudioRecorder/AudioRecorder'
import AlertDialog from '../dialogs/AlertDialog'
import { unknownErrorToString } from '../helpers/unknownErrorToString'

const log = getLogger('renderer/composer')

const Composer = forwardRef<
  any,
  {
    isContactRequest: boolean
    isProtectionBroken: boolean
    selectedChat: Type.FullChat
    regularMessageInputRef: React.MutableRefObject<ComposerMessageInput | null>
    editMessageInputRef: React.MutableRefObject<ComposerMessageInput | null>
    draftState: DraftObject
    onSelectReplyToShortcut: ReturnType<
      typeof useDraft
    >['onSelectReplyToShortcut']
    removeQuote: () => void
    updateDraftText: (text: string, InputChatId: number) => void
    addFileToDraft: (
      file: string,
      fileName: string,
      viewType: T.Viewtype
    ) => Promise<void>
    removeFile: () => void
    clearDraftStateButKeepTextareaValue: () => void
  }
>((props, ref) => {
  const {
    isContactRequest,
    isProtectionBroken,
    selectedChat,
    regularMessageInputRef,
    editMessageInputRef,
    draftState,
    onSelectReplyToShortcut,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
  } = props

  const chatId = selectedChat.id
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAppPicker, setShowAppPicker] = useState(false)
  const [currentEditText, setCurrentEditText] = useState('')
  const [recording, setRecording] = useState(false)

  const emojiAndStickerRef = useRef<HTMLDivElement>(null)
  const pickerButtonRef = useRef<HTMLButtonElement>(null)

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { openDialog } = useDialog()
  const { sendMessage } = useMessage()
  const { unselectChat } = useChat()

  // The philosophy of the editing mode is as follows.
  // The edit mode can be thought of as a dialog,
  // even though it does not like one visually.
  // The "edit message" dialog has a separate textarea,
  // a separate "send" button, and a separate emoji picker.
  // When the "edit" dialog opens, it does not modify the "normal" input,
  // i.e. the normal draft state.
  // It follows that when the "edit" dialog closes,
  // the original draft state remains the same.
  //
  // From the development (coding) perspective,
  // thinking of the "edit" mode as such (as a separate dialog)
  // makes it easier to ensure that there are no weird collisions
  // between the regular draft mode and the editing mode.
  const messageEditing = useMessageEditing(
    accountId,
    chatId,
    editMessageInputRef
  )
  /**
   * Use this only if you're sure that what you want to do with the ref
   * applies to both the editing mode and to the regular mode.
   */
  const currentComposerMessageInputRef = messageEditing.isEditingModeActive
    ? editMessageInputRef
    : regularMessageInputRef

  const voiceMessageDisabled =
    !!draftState.file || !!draftState.text || messageEditing.isEditingModeActive

  if (useHasChanged2(chatId) && recording) {
    setRecording(false)
  }

  const saveVoiceAsDraft = (voiceData: Blob) => {
    const reader = new FileReader()
    reader.readAsDataURL(voiceData)
    reader.onloadend = async () => {
      if (!reader.result) {
        log.error('Cannot convert blob to base64. reader.result is null')
        return
      }
      const b64 = reader.result.toString().split(',')[1]
      // random filename
      const filename = Math.random().toString(36).substring(2, 10) + '.mp3'
      const path = await runtime.writeTempFileFromBase64(filename, b64)
      addFileToDraft(path, filename, 'Voice').catch((reason: any) => {
        log.error('Cannot send message:', reason)
        openDialog(AlertDialog, {
          message: `${tx('error')}: ${reason}`,
        })
      })
    }
  }

  const onAudioError = (err: AudioRecorderError) => {
    log.error('onAudioError', err)
    let message = err.message
    if (err.errorType === AudioErrorType.NO_INPUT) {
      message =
        tx('chat_unable_to_record_audio') +
        '\n\n' +
        'No sound input! Please check your mic settings & permissions! ⚠️'
    }
    openDialog(AlertDialog, {
      message,
    })
  }

  const hasSecureJoinEnded = useRef<boolean>(false)
  useEffect(() => {
    if (hasSecureJoinEnded) {
      // after can send was updated
      window.__reloadDraft && window.__reloadDraft()
      hasSecureJoinEnded.current = false
    }
  }, [selectedChat.canSend])

  const showSendButton = currentEditText !== '' || !!draftState.file

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

  const composerSendMessage = messageEditing.isEditingModeActive
    ? null
    : async () => {
        if (chatId === null) {
          throw new Error('chat id is undefined')
        }
        if (!regularMessageInputRef.current) {
          throw new Error('messageInputRef is undefined')
        }
        const textareaRef = regularMessageInputRef.current?.textareaRef.current
        if (textareaRef) {
          if (textareaRef.disabled) {
            throw new Error(
              'text area is disabled, this means it is either already sending or loading the draft'
            )
          }
          textareaRef.disabled = true
        }
        try {
          const message = regularMessageInputRef.current?.getText() || ''
          if (!regularMessageInputRef.current?.hasText() && !draftState.file) {
            log.debug(`Empty message: don't send it...`)
            return
          }

          const sendMessagePromise = sendMessage(accountId, chatId, {
            text: replaceColonsSafe(message),
            file: draftState.file || undefined,
            filename: draftState.fileName || undefined,
            quotedMessageId:
              draftState.quote?.kind === 'WithMessage'
                ? draftState.quote.messageId
                : null,
            viewtype: draftState.viewType,
          })

          await sendMessagePromise

          // Ensure that the draft is cleared
          // and the state is reflected in the UI.
          //
          // At this point we know that sending has succeeded,
          // so we do not accidentally remove the draft
          // if the core fails to send.
          await BackendRemote.rpc.removeDraft(selectedAccountId(), chatId)
          window.__reloadDraft && window.__reloadDraft()
        } catch (error) {
          openDialog(AlertDialog, {
            message: unknownErrorToString(error),
          })
          log.error(error)
        } finally {
          if (textareaRef) {
            textareaRef.disabled = false
          }
          regularMessageInputRef.current?.focus()
        }
      }

  useKeyBindingAction(KeybindAction.Composer_SelectReplyToUp, () => {
    if (messageEditing.isEditingModeActive) {
      return
    }
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToUp)
  })

  useKeyBindingAction(KeybindAction.Composer_SelectReplyToDown, () => {
    if (messageEditing.isEditingModeActive) {
      return
    }
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToDown)
  })
  useKeyBindingAction(KeybindAction.Composer_CancelReply, () => {
    if (messageEditing.isEditingModeActive) {
      return
    }
    removeQuote()
  })

  const onEmojiIconClick = () => setShowEmojiPicker(!showEmojiPicker)
  const shiftPressed = useRef(false)
  const onEmojiSelect = (emoji: EmojiData) => {
    log.debug(`EmojiPicker: Selected ${emoji.id}`)
    currentComposerMessageInputRef.current?.insertStringAtCursorPosition(
      (emoji as BaseEmoji).native
    )
    if (!shiftPressed.current) {
      setShowEmojiPicker(false)
      currentComposerMessageInputRef.current?.focus()
    }
  }
  // track shift key -> update [shiftPressed]
  // also handle escape key for emoji picker
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      shiftPressed.current = ev.shiftKey
      if (ev.type === 'keydown' && ev.code === 'Escape') {
        setShowEmojiPicker(false)
        setShowAppPicker(false)
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
    const onClick = (e: MouseEvent) => {
      if (!emojiAndStickerRef.current) return
      // The same approach as in `OutsideClickHelper`.
      const clickIsOutSideEmojiPicker = !emojiAndStickerRef.current.contains(
        e.target as Node
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

  const onAppSelected = messageEditing.isEditingModeActive
    ? null
    : async (appInfo: AppInfo) => {
        log.debug('App selected', appInfo)
        const response = await BackendRemote.rpc.getHttpResponse(
          selectedAccountId(),
          AppStoreUrl + appInfo.cache_relname
        )
        if (response?.blob?.length) {
          const path = await runtime.writeTempFileFromBase64(
            appInfo.cache_relname,
            response.blob
          )
          await addFileToDraft(path, appInfo.cache_relname, 'File')
          await runtime.removeTempFile(path)
          setShowAppPicker(false)
        }
      }

  // Paste file functionality
  // https://github.com/deltachat/deltachat-desktop/issues/2108
  const handlePaste = messageEditing.isEditingModeActive
    ? null
    : async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Skip if no file
        if (!e.clipboardData.files.length) {
          return
        }
        // when there is a file then don't paste text
        // https://github.com/deltachat/deltachat-desktop/issues/3261
        e.preventDefault()

        // File object
        const file = e.clipboardData.files[0]

        log.debug(
          `paste: received file: "${file.name}" ${file.type}`,
          e.clipboardData.files
        )

        const msgType: T.Viewtype = file.type.startsWith('image')
          ? 'Image'
          : 'File'

        try {
          // Write clipboard to file then attach it to the draft
          const file_content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve(reader.result as any)
            }
            reader.onabort = reject
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          const fileName = file.name || `file.${extension(file.type)}`
          const path = await runtime.writeTempFileFromBase64(
            fileName,
            file_content.split(';base64,')[1]
          )
          await addFileToDraft(path, fileName, msgType)
          // delete file again after it was sucessfuly added
          await runtime.removeTempFile(path)
        } catch (err) {
          log.error('Failed to paste file.', err)
        }
      }

  const settingsStore = useSettingsStore()[0]

  useLayoutEffect(() => {
    // focus composer on chat change
    // Only one of these is actually rendered at any given moment.
    regularMessageInputRef.current?.focus()
    editMessageInputRef.current?.focus()
  }, [chatId, editMessageInputRef, regularMessageInputRef])

  const ariaSendShortcut: string = useMemo(() => {
    if (settingsStore == undefined) {
      return ''
    }

    const firstShortcut = enterKeySendsKeyboardShortcuts(
      settingsStore.desktopSettings.enterKeySends
    )[0].keyBindings[0]

    if (!Array.isArray(firstShortcut) || !firstShortcut.includes('Enter')) {
      log.warn('Unexpected shortcut for "Send Message"')
      return ''
    }

    return firstShortcut.join('+')
  }, [settingsStore])

  if (chatId === null) {
    return <section ref={ref}>Error, chatid missing</section>
  }

  if (isContactRequest) {
    return (
      <section ref={ref} className='composer contact-request'>
        <button
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
        </button>
        <button
          className='contact-request-button accept'
          onClick={() => {
            EffectfulBackendActions.acceptChat(selectedAccountId(), chatId)
          }}
        >
          {tx('accept')}
        </button>
      </section>
    )
  } else if (isProtectionBroken) {
    return (
      <section ref={ref} className='composer contact-request'>
        <button
          className='contact-request-button'
          onClick={async () => {
            openDialog(ProtectionBrokenDialog, { name: selectedChat.name })
          }}
        >
          {tx('more_info_desktop')}
        </button>
        <button
          className='contact-request-button'
          onClick={() => {
            EffectfulBackendActions.acceptChat(selectedAccountId(), chatId)
          }}
        >
          {tx('ok')}
        </button>
      </section>
    )
  } else if (!selectedChat.canSend) {
    return null
  } else {
    return (
      <section
        className='composer'
        ref={ref}
        role='region'
        // Note that there are other `return`s in this component,
        // but this `aria-label` doesn't seem to apply to them.
        //
        // TODO a11y: when `isEditingModeActive`, we have an "Edit message"
        // text, which we can use as the label / header.
        aria-label={
          messageEditing.isEditingModeActive
            ? window.static_translate('edit_message')
            : window.static_translate('write_message_desktop')
          // We could also add chat name here to make it extra clear
          // which chat we're in,
          // but the "Chat" region label
          // (`id='chat-section-heading'`) is probably enough.
        }
      >
        <div className='upper-bar'>
          {!messageEditing.isEditingModeActive ? (
            <>
              {draftState.quote !== null && (
                <div className='attachment-quote-section is-quote'>
                  <Quote quote={draftState.quote} tabIndex={0} />
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
                  <VisualVCardComponent
                    vcardContact={draftState.vcardContact}
                  />
                  <CloseButton onClick={removeFile} />
                </div>
              )}
            </>
          ) : (
            <div className='attachment-quote-section is-quote'>
              <Quote
                quote={{
                  // FYI most of these properties are not used
                  // inside the `Quote` component.

                  // `...messageEditing.originalMessage`, would also work,
                  // but the `T.MessageQuote` type and the `T.Message` type
                  // have some overlap, e.g. the `type` property,
                  // so let's be explicit.
                  messageId: messageEditing.originalMessage.id,
                  chatId: messageEditing.originalMessage.chatId,
                  isForwarded: messageEditing.originalMessage.isForwarded,
                  text: messageEditing.originalMessage.text,
                  overrideSenderName:
                    messageEditing.originalMessage.overrideSenderName,
                  viewType: messageEditing.originalMessage.viewType,

                  kind: 'WithMessage',
                  authorDisplayColor:
                    messageEditing.originalMessage.sender.color,
                  authorDisplayName:
                    messageEditing.originalMessage.sender.displayName,
                  // It's probably fine to skip image,
                  // since it's only possible to edit message _text_.
                  // We'd probably be fine if we only passed `message.text`.
                  image: null,
                }}
                isEditMessage
                tabIndex={0}
              />
              <CloseButton
                onClick={() => {
                  messageEditing.cancelEditing()
                  setTimeout(() => {
                    regularMessageInputRef.current?.focus()
                  })
                }}
                aria-label={tx('cancel')}
              />
            </div>
          )}
        </div>
        <div className='lower-bar'>
          {!messageEditing.isEditingModeActive && !recording && (
            <MenuAttachment
              addFileToDraft={addFileToDraft}
              showAppPicker={setShowAppPicker}
              selectedChat={selectedChat}
            />
          )}
          {settingsStore && !recording && (
            <>
              <ComposerMessageInput
                // We use `hidden` instead of simply conditionally rendering
                // because the source of truth for the draft text
                // is stored inside the `ComposerMessageInput`,
                // and not inside of `useDraft()`.
                // That is at least between the `updateDraftText()` calls,
                // but they are throttled / debounced.
                // But we want to restore the draft text when we exit the
                // "edit" mode. Hence `hidden` instead of conditional rendering.
                hidden={messageEditing.isEditingModeActive}
                isMessageEditingMode={false}
                ref={regularMessageInputRef}
                enterKeySends={settingsStore?.desktopSettings.enterKeySends}
                sendMessageOrEditRequest={
                  !messageEditing.isEditingModeActive
                    ? composerSendMessage!
                    : () => {
                        log.error(
                          'Tried to send a message while in message editing mode'
                        )
                      }
                }
                chatId={chatId}
                updateDraftText={updateDraftText}
                onPaste={handlePaste ?? undefined}
                onChange={setCurrentEditText}
              />
              <ComposerMessageInput
                isMessageEditingMode={true}
                hidden={!messageEditing.isEditingModeActive}
                ref={editMessageInputRef}
                enterKeySends={settingsStore?.desktopSettings.enterKeySends}
                sendMessageOrEditRequest={
                  messageEditing.doSendEditRequest ?? (() => {})
                }
                chatId={chatId}
                // We don't store the edits as "drafts" anywhere except
                // inside the <ComposerMessageInput> component itself,
                // so this can be a no-op.
                updateDraftText={() => {}}
                // Message editing mode doesn't support file pasting.
                // onPaste={handlePaste}
                onChange={setCurrentEditText}
              />
            </>
          )}
          {!runtime.getRuntimeInfo().hideEmojiAndStickerPicker &&
            !recording && (
              <button
                type='button'
                className='emoji-button'
                ref={pickerButtonRef}
                onClick={onEmojiIconClick}
                aria-label={tx('emoji')}
              >
                <span />
              </button>
            )}
          {showSendButton && (
            <button
              // This ensures that the button loses focus as we switch between
              // the editing mode and the regular mode,
              // so that it's harder to accidentally send a normal message
              // right after sending the draft by using the keyboard.
              // Conceptually those are two different buttons.
              key={messageEditing.isEditingModeActive.toString()}
              className='send-button'
              // TODO apply `disabled` if the textarea is empty
              // or includes only whitespace.
              // See `doSendEditRequest`.
              onClick={
                !messageEditing.isEditingModeActive
                  ? composerSendMessage!
                  : messageEditing.doSendEditRequest
              }
              aria-label={tx('menu_send')}
              aria-keyshortcuts={ariaSendShortcut}
            >
              <div className='paper-plane'></div>
            </button>
          )}
          {!showSendButton && !voiceMessageDisabled && (
            <AudioRecorder
              recording={recording}
              setRecording={setRecording}
              saveVoiceAsDraft={saveVoiceAsDraft}
              onError={onAudioError}
            />
          )}
        </div>
        {/* We don't want to show the app picker when
        `messageEditing.isEditingModeActive` because picking an app
        modifies the regular message draft, but the draft is not visible
        when the message editing mode is active.

        Having another condition after `showAppPicker` is not nice,
        but it shouldn't be really feasible anyway
        to enter the message editing mode while the app picker is open,
        and it shouldn't be possible to open the app picker
        while the message editing mode is active. */}
        {showAppPicker && !messageEditing.isEditingModeActive && (
          <OutsideClickHelper onClick={() => setShowAppPicker(false)}>
            <AppPicker onAppSelected={onAppSelected!} />
          </OutsideClickHelper>
        )}
        {showEmojiPicker && (
          <EmojiAndStickerPicker
            chatId={chatId}
            ref={emojiAndStickerRef}
            onEmojiSelect={onEmojiSelect}
            setShowEmojiPicker={setShowEmojiPicker}
            // Message editing does not support stickers.
            // The way the sticker picker currently works is that
            // it simply sends a message when you click on a sticker.
            hideStickerPicker={messageEditing.isEditingModeActive}
          />
        )}
      </section>
    )
  }
})

export default Composer

export type DraftObject = { chatId: number } & Pick<
  Type.Message,
  'id' | 'text' | 'file' | 'quote' | 'viewType' | 'vcardContact'
> &
  MessageTypeAttachmentSubset

function emptyDraft(chatId: number | null): DraftObject {
  return {
    id: 0,
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
  canSend: boolean, // no draft needed in chats we can't send messages
  inputRef: React.MutableRefObject<ComposerMessageInput | null>
): {
  draftState: DraftObject
  onSelectReplyToShortcut: (
    upOrDown:
      | KeybindAction.Composer_SelectReplyToUp
      | KeybindAction.Composer_SelectReplyToDown
  ) => void
  removeQuote: () => void
  updateDraftText: (text: string, InputChatId: number) => void
  addFileToDraft: (
    file: string,
    fileName: string,
    viewType: T.Viewtype
  ) => Promise<void>
  removeFile: () => void
  clearDraftStateButKeepTextareaValue: () => void
} {
  const [
    draftState,
    /**
     * Set `draftState`, but don't update the value of the message textarea
     * (because it's managed by a separate piece of state).
     *
     * This will not save the draft to the backend.
     */
    _setDraftStateButKeepTextareaValue,
  ] = useState<DraftObject>(emptyDraft(chatId))
  /**
   * `draftRef.current` gets set to `draftState` on every render.
   * That is, when you mutate the value of this ref,
   * `draftState` also gets mutated.
   *
   * Having this `ref` is just a hack to perform direct state mutations
   * without triggering a re-render or linter's warnings about the missing
   * `draftState` hook dependency.
   *
   * TODO figure out why this is needed.
   */
  const draftRef = useRef<DraftObject>(emptyDraft(chatId))
  draftRef.current = draftState

  /**
   * Reset `draftState` to "empty draft" value,
   * but don't save it to backend and don't change the value
   * of the textarea.
   */
  const clearDraftStateButKeepTextareaValue = useCallback(() => {
    _setDraftStateButKeepTextareaValue(_ => emptyDraft(chatId))
  }, [chatId])

  const loadDraft = useCallback(
    (chatId: number) => {
      if (chatId === null || !canSend) {
        clearDraftStateButKeepTextareaValue()
        return
      }
      inputRef.current?.setState({ loadingDraft: true })
      BackendRemote.rpc.getDraft(selectedAccountId(), chatId).then(newDraft => {
        if (!newDraft) {
          log.debug('no draft')
          clearDraftStateButKeepTextareaValue()
          inputRef.current?.setText('')
        } else {
          _setDraftStateButKeepTextareaValue(old => ({
            ...old,
            id: newDraft.id,
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
    [clearDraftStateButKeepTextareaValue, inputRef, canSend]
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
    if (chatId === null || !canSend) {
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
      const fileName =
        draft.fileName ?? (draft.file ? basename(draft.file) : null)
      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        draft.text,
        draft.file !== '' ? draft.file : null,
        fileName ?? null,
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
      _setDraftStateButKeepTextareaValue(old => ({
        ...old,
        id: newDraft.id,
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
      clearDraftStateButKeepTextareaValue()
    }
    inputRef.current?.setState({ loadingDraft: false })
  }, [chatId, clearDraftStateButKeepTextareaValue, canSend, inputRef])

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
    async (file: string, fileName: string, viewType: T.Viewtype) => {
      draftRef.current.file = file
      draftRef.current.fileName = fileName
      draftRef.current.viewType = viewType
      inputRef.current?.focus()
      return saveDraft()
    },
    [inputRef, saveDraft]
  )

  const { jumpToMessage } = useMessage()
  const onSelectReplyToShortcut = async (
    upOrDown:
      | KeybindAction.Composer_SelectReplyToUp
      | KeybindAction.Composer_SelectReplyToDown
  ) => {
    if (chatId == undefined || !canSend) {
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
      jumpToMessage({
        accountId,
        msgId: messageId,
        msgChatId: chatId,
        highlight: true,
        focus: false,
        // The message is usually already in view,
        // so let's not scroll at all if so.
        scrollIntoViewArg: { block: 'nearest' },
      })
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
    onSelectReplyToShortcut,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraftStateButKeepTextareaValue,
  }
}

function useMessageEditing(
  accountId: number,
  chatId: T.BasicChat['id'],
  editMessageInputRef: React.MutableRefObject<ComposerMessageInput | null>
) {
  const tx = useTranslationFunction()
  const { userFeedback } = useContext(ScreenContext)

  const [_originalMessage, setOriginalMessage] = useState<null | T.Message>(
    null
  )
  // We unset `_originalMessage` when switching between chats below,
  // but let's still make sure that it belongs to the current chat here.
  const originalMessage =
    _originalMessage?.chatId === chatId ? _originalMessage : null

  // Should we also listen for `MsgsChanged` and update the message?
  // E.g. if it got edited from another device.

  const isEditingModeActive = originalMessage != null

  const cancelEditing = useCallback(() => {
    setOriginalMessage(null)
    // This should be unnecessary because `setOriginalMessage(null)`
    // should be enough, but let's sill clean up.
    editMessageInputRef.current?.setText('')
  }, [editMessageInputRef])

  if (useHasChanged2(chatId)) {
    // Yes, this means that the "edit draft" gets lost on chat change.
    // Though maybe we can easily keep it between chat switches,
    // at least for one chat?
    // Because we do check if `_originalMessage` belongs to the current chat,
    // so it's safe to not `setOriginalMessage(null)`
    // when switching between chats.
    cancelEditing()
  }

  useEffect(() => {
    window.__enterEditMessageMode = (newOriginalMessage: T.Message) => {
      if (newOriginalMessage.chatId !== chatId) {
        log.error(
          'Tried to start editing message',
          newOriginalMessage,
          `but the message doesn't belong to the current chat=${chatId}.`
        )
        return
      }

      const prevOriginalMessageId = originalMessage?.id
      setOriginalMessage(newOriginalMessage)
      // Let's not reset the text if we're already editing this message.
      if (newOriginalMessage.id !== prevOriginalMessageId) {
        editMessageInputRef.current?.setText(newOriginalMessage.text)
      }

      // Wait until the new element is actually rendered, only then focus.
      setTimeout(() => {
        editMessageInputRef.current?.focus()
      })
    }
    return () => {
      window.__enterEditMessageMode = null
    }
  }, [chatId, editMessageInputRef, originalMessage?.id])

  const doSendEditRequest = useCallback(() => {
    if (editMessageInputRef.current == null) {
      log.error('doEdit called, but editMessageInputRef is not present')
      return
    }

    const newText = editMessageInputRef.current.getText()
    if (newText.trim().length === 0) {
      userFeedback({
        type: 'error',
        text: tx('chat_please_enter_message'),
      })
      log.error('doEdit called, but newText is empty')
      return
    }

    if (originalMessage == null) {
      // This should not happen, because we don't return
      // `doSendEditRequest` if the message is null.
      log.error('doEdit called, but originalMessage is', originalMessage)
      return
    }

    // We could also check whether the text is unchanged,
    // but let's leave it up to the core.

    const originalMessage_ = originalMessage
    BackendRemote.rpc
      .sendEditRequest(accountId, originalMessage.id, newText)
      .catch(err => {
        log.error('Failed to edit a message', err)
        // Restore the "editing" state.
        //
        // FYI yes, theoretically the user could start editing another message
        // before the promise gets settled,
        // but this backend call shouldn't take long,
        // and it's rare that it would fail.
        setOriginalMessage(originalMessage_)
        editMessageInputRef.current?.setText(newText)

        userFeedback({
          type: 'error',
          // Probably not worth translating, since it's rare.
          text: 'Failed to edit the message',
        })
      })

    // Otimistically exit the "edit" mode,
    // without waiting for the backend call to finish.
    setOriginalMessage(null)
    editMessageInputRef.current.setText('')
    // TODO focus the "regular message" input?
    // Or is it not a bug but a feature,
    // so that you don't accidentally send the draft
    // right after editing a message?
    // Though this doesn't apply if you send a message by clicking
    // the "send" button with a pointer device (mouse).
    //
    // Maybe instead, to guard against this, we could simply disable
    // the "send" function for ~1 second after the edit is done.
  }, [accountId, editMessageInputRef, originalMessage, tx, userFeedback])

  // An early return to help TypeScript.
  if (!isEditingModeActive) {
    return {
      isEditingModeActive,
      cancelEditing,
    }
  }

  return {
    isEditingModeActive,
    originalMessage,
    doSendEditRequest,
    /**
     * Exit the "edit" mode, without doing anything else.
     * This is a no-op when the editing mode is already not active.
     */
    cancelEditing,
  }
}
