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
import { T } from '@deltachat/jsonrpc-client'
import { extension } from 'mime-types'

import MenuAttachment from './menuAttachment'
import ComposerMessageInput from './ComposerMessageInput'
import { getLogger } from '../../../../shared/logger'
import { EmojiAndStickerPicker } from './EmojiAndStickerPicker'
import { replaceColonsSafe } from '../conversations/emoji'
import { Quote } from '../message/Message'
import { DraftAttachment } from '../attachment/messageAttachment'
import { useSettingsStore } from '../../stores/settings'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { confirmDialog, isMessageEditable } from '../message/messageFunctions'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useMessage from '../../hooks/chat/useMessage'
import useChat from '../../hooks/chat/useChat'
import { useDraft, type DraftObject } from '../../hooks/chat/useDraft'

import type { EmojiData, BaseEmoji } from 'emoji-mart/index'
import { VisualVCardComponent } from '../message/VCard'
import { KeybindAction } from '../../keybindings'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import { CloseButton } from '../Dialog'
import { enterKeySendsKeyboardShortcuts } from '../KeyboardShortcutHint'
import { AppPicker } from '../AppPicker'
import { AppInfo, AppStoreUrl } from '../AppPicker'
import OutsideClickHelper from '../OutsideClickHelper'
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
    selectedChat: Type.FullChat
    regularMessageInputRef: React.RefObject<ComposerMessageInput | null>
    editMessageInputRef: React.RefObject<ComposerMessageInput | null>
    draftState: DraftObject
    draftIsLoading: ReturnType<typeof useDraft>['draftIsLoading']
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
    clearDraftState: () => void
    setDraftState: (newValue: DraftObject) => void
    messageCache: { [msgId: number]: Type.MessageLoadResult | undefined }
  }
>((props, ref) => {
  const {
    isContactRequest,
    selectedChat,
    regularMessageInputRef,
    editMessageInputRef,
    draftState,
    draftIsLoading,
    onSelectReplyToShortcut,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    messageCache,
  } = props

  const chatId = selectedChat.id
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAppPicker, setShowAppPicker] = useState(false)
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
    editMessageInputRef,
    regularMessageInputRef
  )
  /**
   * Use this only if you're sure that what you want to do with the ref
   * applies to both the editing mode and to the regular mode.
   */
  const currentComposerMessageInputRef = messageEditing.isEditingModeActive
    ? editMessageInputRef
    : regularMessageInputRef

  const onComposerMessageInputChange = useCallback(
    (newText: string) => updateDraftText(newText, chatId),
    [chatId, updateDraftText]
  )

  const onArrowUpWhenEmpty = useCallback(async () => {
    if (messageEditing.isEditingModeActive) {
      return
    }
    try {
      // Find the last message from messageCache
      const messageIds = Object.keys(messageCache)
        .map(Number)
        .filter(id => id > 0)
      if (messageIds.length === 0) {
        return
      }
      const lastMessageId = Math.max(...messageIds)
      const message = messageCache[lastMessageId]
      if (
        message &&
        message.kind === 'message' &&
        isMessageEditable(message, selectedChat)
      ) {
        // Enter edit mode only for editable messages
        window.__enterEditMessageMode?.(message)
      }
    } catch (error) {
      log.error('Failed to load last sent message for editing', error)
    }
  }, [messageEditing.isEditingModeActive, messageCache, selectedChat])

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

  const showSendButton = messageEditing.isEditingModeActive
    ? messageEditing.newText.length > 0
    : draftState.text.length > 0 || !!draftState.file

  const composerSendMessage =
    messageEditing.isEditingModeActive || draftIsLoading
      ? null
      : async () => {
          if (chatId === null) {
            throw new Error('chat id is undefined')
          }
          if (!(draftState.text.length > 0) && !draftState.file) {
            log.debug(`Empty message: don't send it...`)
            return
          }

          const preSendDraftState = draftState
          const sendMessagePromise = sendMessage(accountId, chatId, {
            text: replaceColonsSafe(draftState.text),
            file: draftState.file || undefined,
            filename: draftState.fileName || undefined,
            quotedMessageId:
              draftState.quote?.kind === 'WithMessage'
                ? draftState.quote.messageId
                : null,
            viewtype: draftState.viewType,
          })
          // _Immediately_ clear the draft from React state.
          // This does _not_ remove the draft from the back-end yet.
          // This is primarily to make sure that you can't accidentally
          // doube-send the same message.
          //
          // We could instead disable the textarea
          // and disable sending the next message
          // until the previous one has been sent,
          // but it's unnecessary to block the user in such a way,
          // because it's not often that `sendMessage` fails.
          // And also disabling an input makes it lose focus,
          // so we'd have to re-focus it, which would make screen readers
          // re-announce it, which is disorienting.
          // See https://github.com/deltachat/deltachat-desktop/issues/4590#issuecomment-2821985528.
          props.clearDraftState()

          let sentSuccessfully: boolean
          try {
            await sendMessagePromise
            sentSuccessfully = true
          } catch (err) {
            sentSuccessfully = false
            openDialog(AlertDialog, {
              message:
                tx('systemmsg_failed_sending_to', selectedChat.name) +
                '\n' +
                tx('error_x', unknownErrorToString(err)),
            })
            // Restore the draft, since we failed to send.
            // Note that this will not save the draft to the backend.
            //
            // TODO fix: hypothetically by this point the user
            // could have started typing a new message already,
            // and so this would override it on the frontend.
            props.setDraftState(preSendDraftState)
          }
          if (sentSuccessfully) {
            // TODO fix: hypothetically by this point the user
            // could have started typing (and even have sent!)
            // a new message already, so this would override it on the backend.
            await BackendRemote.rpc.removeDraft(accountId, chatId)
          }
        }

  const sendButtonAction: null | (() => void) =
    !messageEditing.isEditingModeActive
      ? composerSendMessage
      : messageEditing.doSendEditRequest

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
        if (messageEditing.isEditingModeActive) {
          messageEditing.cancelEditing()
          setTimeout(() => {
            regularMessageInputRef.current?.focus()
          })
        }
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
  }, [shiftPressed, messageEditing, regularMessageInputRef])

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
        const downloadUrl = AppStoreUrl + appInfo.cache_relname
        const responseP = BackendRemote.rpc.getHttpResponse(
          selectedAccountId(),
          AppStoreUrl + appInfo.cache_relname
        )
        let response: Awaited<typeof responseP>
        try {
          response = await responseP
          if (!(response?.blob?.length > 0)) {
            throw new Error(
              'BackendRemote.rpc.getHttpResponse did not return a body'
            )
          }
        } catch (error) {
          openDialog(AlertDialog, {
            message: tx(
              'error_x',
              'Failed download the app file from the store:\n' +
                unknownErrorToString(error) +
                '\n\n' +
                'You may try to download the app manually from\n\n' +
                downloadUrl +
                '\n\n' +
                'or\n' +
                'https://webxdc.org/apps'
            ),
          })
          return
        }
        const path = await runtime.writeTempFileFromBase64(
          appInfo.cache_relname,
          response.blob
        )
        await addFileToDraft(path, appInfo.cache_relname, 'File')
        await runtime.removeTempFile(path)
        setShowAppPicker(false)
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
          type='button'
          className='contact-request-button delete'
          onClick={async () => {
            if (selectedChat.chatType !== 'Single') {
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
          {selectedChat.chatType === 'Single' ? tx('block') : tx('delete')}
        </button>
        <button
          type='button'
          className='contact-request-button accept'
          onClick={() => {
            EffectfulBackendActions.acceptChat(selectedAccountId(), chatId)
          }}
        >
          {tx('accept')}
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
                <section
                  className='attachment-quote-section is-quote'
                  aria-label={tx('menu_reply')}
                >
                  {/* Check that this is a "full" quote.
                  TODO it would be nice to show a placeholder otherwise. */}
                  {'text' in draftState.quote && (
                    <Quote quote={draftState.quote} tabIndex={0} />
                  )}
                  <CloseButton onClick={removeQuote} />
                </section>
              )}
              {draftState.file && !draftState.vcardContact && (
                <section
                  className='attachment-quote-section is-attachment'
                  aria-label={tx('attachment')}
                >
                  {/* TODO make this pretty: draft image/video/attachment */}
                  {/* <p>file: {draftState.file}</p> */}
                  {/* {draftState.viewType} */}
                  <DraftAttachment attachment={draftState} />
                  <CloseButton onClick={removeFile} />
                </section>
              )}
              {draftState.vcardContact && (
                <section
                  className='attachment-quote-section is-attachment'
                  aria-label={tx('attachment')}
                >
                  <VisualVCardComponent
                    vcardContact={draftState.vcardContact}
                  />
                  <CloseButton onClick={removeFile} />
                </section>
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
                text={draftState.text}
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
                loadingDraft={draftIsLoading}
                sendMessageOrEditRequest={
                  (!messageEditing.isEditingModeActive
                    ? composerSendMessage
                    : null) ??
                  (() => {
                    log.error(
                      'Tried to send a message while draft is loading or in message editing mode'
                    )
                  })
                }
                chatId={chatId}
                onPaste={handlePaste ?? undefined}
                onChange={onComposerMessageInputChange}
                onArrowUpWhenEmpty={onArrowUpWhenEmpty}
              />
              <ComposerMessageInput
                text={messageEditing.newText ?? ''}
                isMessageEditingMode={true}
                hidden={!messageEditing.isEditingModeActive}
                ref={editMessageInputRef}
                enterKeySends={settingsStore?.desktopSettings.enterKeySends}
                loadingDraft={false}
                sendMessageOrEditRequest={
                  messageEditing.doSendEditRequest ?? (() => {})
                }
                chatId={chatId}
                // Message editing mode doesn't support file pasting.
                // onPaste={handlePaste}
                onChange={messageEditing.setNewText ?? (() => {})}
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
              type='button'
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
              disabled={sendButtonAction == null}
              onClick={sendButtonAction ?? (() => {})}
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

function useMessageEditing(
  accountId: number,
  chatId: T.BasicChat['id'],
  editMessageInputRef: React.RefObject<ComposerMessageInput | null>,
  regularMessageInputRef: React.RefObject<ComposerMessageInput | null>
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
  const [newText, setNewText] = useState<string>(originalMessage?.text || '')

  // Should we also listen for `MsgsChanged` and update the message?
  // E.g. if it got edited from another device.

  const isEditingModeActive = originalMessage != null

  const cancelEditing = useCallback(() => {
    setOriginalMessage(null)
    // This should be unnecessary because `setOriginalMessage(null)`
    // should be enough, but let's sill clean up.
    setNewText('')
  }, [])

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
        setNewText(newOriginalMessage.text)
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
        setNewText(newText)

        userFeedback({
          type: 'error',
          // Probably not worth translating, since it's rare.
          text: 'Failed to edit the message',
        })
      })

    // Otimistically exit the "edit" mode,
    // without waiting for the backend call to finish.
    setOriginalMessage(null)
    setNewText('')
    // Focus the regular message input after editing
    setTimeout(() => {
      regularMessageInputRef.current?.focus()
    })
  }, [
    accountId,
    newText,
    originalMessage,
    tx,
    userFeedback,
    regularMessageInputRef,
  ])

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
    newText,
    setNewText,
    doSendEditRequest,
    /**
     * Exit the "edit" mode, without doing anything else.
     * This is a no-op when the editing mode is already not active.
     */
    cancelEditing,
  }
}
