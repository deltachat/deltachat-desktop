import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useLayoutEffect,
  useCallback,
  useMemo,
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
import type { Viewtype } from '@deltachat/jsonrpc-client/dist/generated/types'
import { VisualVCardComponent } from '../message/VCard'
import { KeybindAction } from '../../keybindings'
import useKeyBindingAction from '../../hooks/useKeyBindingAction'
import { CloseButton } from '../Dialog'
import { enterKeySendsKeyboardShortcuts } from '../KeyboardShortcutHint'
import { AppPicker } from '../AppPicker'
import { AppInfo, AppStoreUrl } from '../AppPicker'
import OutsideClickHelper from '../OutsideClickHelper'
import { basename } from 'path'

const log = getLogger('renderer/composer')

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
    addFileToDraft: (
      file: string,
      fileName: string,
      viewType: T.Viewtype
    ) => Promise<void>
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
  const [showAppPicker, setShowAppPicker] = useState(false)

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

  const onAppSelected = async (appInfo: AppInfo) => {
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
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
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

    const msgType: Viewtype = file.type.startsWith('image') ? 'Image' : 'File'

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
    messageInputRef.current?.focus()
  }, [chatId, messageInputRef])

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
    return <div ref={ref}>Error, chatid missing</div>
  }

  if (isContactRequest) {
    return (
      <div ref={ref} className='composer contact-request'>
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
      </div>
    )
  } else if (isProtectionBroken) {
    return (
      <div ref={ref} className='composer contact-request'>
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
              <VisualVCardComponent vcardContact={draftState.vcardContact} />
              <CloseButton onClick={removeFile} />
            </div>
          )}
        </div>
        <div className='lower-bar'>
          <MenuAttachment
            addFileToDraft={addFileToDraft}
            showAppPicker={setShowAppPicker}
            selectedChat={selectedChat}
          />
          {settingsStore && (
            <ComposerMessageInput
              ref={messageInputRef}
              enterKeySends={settingsStore?.desktopSettings.enterKeySends}
              sendMessage={composerSendMessage}
              chatId={chatId}
              chatName={selectedChat.name}
              updateDraftText={updateDraftText}
              onPaste={handlePaste}
            />
          )}
          {!runtime.getRuntimeInfo().hideEmojiAndStickerPicker && (
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
          <button
            className='send-button'
            onClick={composerSendMessage}
            aria-label={tx('menu_send')}
            aria-keyshortcuts={ariaSendShortcut}
          >
            <div className='paper-plane'></div>
          </button>
        </div>
        {showAppPicker && (
          <OutsideClickHelper onClick={() => setShowAppPicker(false)}>
            <AppPicker onAppSelected={onAppSelected} />
          </OutsideClickHelper>
        )}
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
  'id' | 'text' | 'file' | 'quote' | 'viewType' | 'vcardContact' | 'webxdcInfo'
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
    webxdcInfo: null,
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
  removeQuote: () => void
  updateDraftText: (text: string, InputChatId: number) => void
  addFileToDraft: (
    file: string,
    fileName: string,
    viewType: T.Viewtype
  ) => Promise<void>
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
      if (chatId === null || !canSend) {
        clearDraft()
        return
      }
      BackendRemote.rpc.getDraft(selectedAccountId(), chatId).then(newDraft => {
        if (!newDraft) {
          log.debug('no draft')
          clearDraft()
          inputRef.current?.setText('')
        } else {
          _setDraft(old => ({
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
            webxdcInfo: newDraft.webxdcInfo,
          }))
          inputRef.current?.setText(newDraft.text)
        }
        inputRef.current?.setState({ loadingDraft: false })
        setTimeout(() => {
          inputRef.current?.focus()
        })
      })
    },
    [clearDraft, inputRef, canSend]
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
      _setDraft(old => ({
        ...old,
        id: newDraft.id,
        file: newDraft.file,
        fileBytes: newDraft.fileBytes,
        fileMime: newDraft.fileMime,
        fileName: newDraft.fileName,
        viewType: newDraft.viewType,
        quote: newDraft.quote,
        vcardContact: newDraft.vcardContact,
        webxdcInfo: newDraft.webxdcInfo,
      }))
      // don't load text to prevent bugging back
    } else {
      clearDraft()
    }
  }, [chatId, clearDraft, canSend, inputRef])

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
    async (file: string, fileName: string, viewType: Viewtype) => {
      draftRef.current.file = file
      draftRef.current.fileName = fileName
      draftRef.current.viewType = viewType
      inputRef.current?.focus()
      return saveDraft()
    },
    [inputRef, saveDraft]
  )

  useKeyBindingAction(KeybindAction.Composer_SelectReplyToUp, () => {
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToUp)
  })
  useKeyBindingAction(KeybindAction.Composer_SelectReplyToDown, () => {
    onSelectReplyToShortcut(KeybindAction.Composer_SelectReplyToDown)
  })
  useKeyBindingAction(KeybindAction.Composer_CancelReply, () => {
    removeQuote()
  })
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
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraft,
  }
}
