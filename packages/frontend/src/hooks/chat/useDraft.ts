import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useEffectEvent,
} from 'react'
import { T } from '@deltachat/jsonrpc-client'

import { getLogger } from '../../../../shared/logger'
import { BackendRemote, Type } from '../../backend-com'
import { MessageTypeAttachmentSubset } from '../../components/attachment/Attachment'
import { KeybindAction } from '../../keybindings'
import useMessage from './useMessage'
import ComposerMessageInput from '../../components/composer/ComposerMessageInput'
import { type MessageListStore } from '../../stores/messagelist'
import { debounce } from 'debounce'
import useTranslationFunction from '../useTranslationFunction'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useConfirmationDialog from '../dialog/useConfirmationDialog'
import useAlertDialog from '../dialog/useAlertDialog'

const log = getLogger('renderer/composer')

export type DraftObject = { chatId: number } & Pick<
  Type.Message,
  'id' | 'file' | 'viewType' | 'vcardContact'
> &
  MessageTypeAttachmentSubset & {
    text: Type.Message['text']
    quote:
      | Type.Message['quote']
      /**
       * This is for when we've set the quote by `messageId`,
       * but havent loaded the full quote yet.
       */
      | { kind: 'WithMessage'; messageId: number }
  }

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

function isDraftEmpty(draft: DraftObject): boolean {
  return !(
    (draft.text && draft.text.length > 0) ||
    (draft.file && draft.file != '') ||
    !!draft.quote
  )
}

export function useDraft(
  messageListState: MessageListStore['state'],
  accountId: number,
  chatId: number | null,
  isContactRequest: boolean,
  canSend: boolean, // no draft needed in chats we can't send messages
  inputRef: React.RefObject<ComposerMessageInput | null>
): {
  draftState: DraftObject
  /**
   * Whether the initial loading of the draft is being performed,
   * e.g. after switching the chat, or after a
   * {@linkcode BackendRemote.rpc.miscSetDraft} from outside of
   * {@linkcode useDraft}.
   */
  draftIsLoading: boolean
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
  clearDraftState: () => void
  setDraftState: (newValue: DraftObject) => void
} {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const openAlertDialog = useAlertDialog()

  const [
    draftState,
    /**
     * This will not save the draft to the backend.
     */
    setDraftState,
  ] = useState<DraftObject>(() => emptyDraft(chatId))

  const clearDraftState = useCallback(() => {
    setDraftState(emptyDraft(chatId))
  }, [chatId])

  /**
   * Aborts and gets re-created when {@linkcode accountId} or
   * {@linkcode chatId} change, or simply when the component unmounts.
   *
   * It is needed to avoid races where e.g. `getDraft` started but then
   * {@linkcode chatId} changed before it finished.
   * The approach is similar to
   * https://react.dev/learn/you-might-not-need-an-effect#fetching-data.
   */
  const abortController = useMemo(
    () => new AbortController(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, chatId]
  )
  useEffect(() => {
    // The fact that `abortController` updated means that its dependencies,
    // i.e. `[accountId, chatId]`, updated.
    return () => {
      // This is now the "old" `abortController`. Let's abort it.
      abortController.abort()
    }
  }, [abortController])

  const [draftIsLoading_, setDraftIsLoading] = useState(true)
  const skipLoadingDraft = chatId === null || !canSend
  const draftIsLoading = skipLoadingDraft ? false : draftIsLoading_
  const loadDraft = useCallback(() => {
    if (skipLoadingDraft) {
      clearDraftState()
      return
    }
    setDraftIsLoading(true)
    BackendRemote.rpc
      .getDraft(accountId, chatId)
      .then(newDraft => {
        if (abortController.signal.aborted) {
          return
        }

        if (!newDraft) {
          log.debug('no draft')
          clearDraftState()
        } else {
          setDraftState(_old => ({
            chatId,
            id: newDraft.id,
            text: newDraft.text,
            file: newDraft.file,
            fileBytes: newDraft.fileBytes,
            fileMime: newDraft.fileMime,
            fileName: newDraft.fileName,
            viewType: newDraft.viewType,
            quote: newDraft.quote,
            vcardContact: newDraft.vcardContact,
          }))
        }
        setDraftIsLoading(false)
        setTimeout(() => {
          inputRef.current?.focus()
        })
      })
      .catch(error => {
        setDraftIsLoading(false)
        throw error
      })
  }, [
    accountId,
    chatId,
    abortController,
    clearDraftState,
    inputRef,
    skipLoadingDraft,
  ])

  useEffect(() => {
    log.debug('reloading chat because id changed', chatId)
    loadDraft()
  }, [chatId, loadDraft, isContactRequest])

  /**
   * Saving (uploading) the draft to the backend is not always enough.
   * We also need to then immediately refetch the draft from the backend,
   * in cases such as
   * - Setting the quote. Because we only set its `messageId`,
   *   without setting the quote's text and the author locally.
   * - Adding an attachment ({@linkcode addFileToDraft}).
   *   Because the file name might get changed
   *   by the backend, and because we don't set the file size locally.
   *
   * TODO fix: when adding an attachment, the composer quickly flashes
   * the new attachment as "file <path>; 0 bytes",
   * even if it is a media attachment or a contact.
   * The same flash happens when setting a quote.
   */
  const saveAndRefetchDraft_ = useCallback(
    async (chatId: number, draft: DraftObject) => {
      if (!isDraftEmpty(draft)) {
        await BackendRemote.rpc.miscSetDraft(
          accountId,
          chatId,
          draft.text,
          draft.file !== '' ? draft.file : null,
          draft.fileName,
          draft.quote?.kind === 'WithMessage' ? draft.quote.messageId : null,
          draft.viewType
        )
      } else {
        await BackendRemote.rpc.removeDraft(accountId, chatId)
      }

      if (abortController.signal.aborted) {
        return
      }
      const newDraft = await BackendRemote.rpc.getDraft(accountId, chatId)
      if (abortController.signal.aborted) {
        return
      }

      // don't load text to prevent bugging back
      if (newDraft) {
        setDraftState(old => ({
          text: old.text,

          chatId,
          id: newDraft.id,
          file: newDraft.file,
          fileBytes: newDraft.fileBytes,
          fileMime: newDraft.fileMime,
          fileName: newDraft.fileName,
          viewType: newDraft.viewType,
          quote: newDraft.quote,
          vcardContact: newDraft.vcardContact,
        }))
      } else {
        setDraftState(old => ({
          ...emptyDraft(chatId),
          text: old.text,
        }))
      }
    },
    [accountId, abortController]
  )
  const saveAndRefetchDraft = useMemo(
    () =>
      chatId != null && canSend
        ? (newDraftState: DraftObject) =>
            saveAndRefetchDraft_(chatId, newDraftState)
        : null,
    [canSend, chatId, saveAndRefetchDraft_]
  )
  const debouncedSaveAndRefetchDraft = useMemo(
    () =>
      saveAndRefetchDraft == null
        ? null
        : // Maybe we could also specify `maxWait` option,
          // but only Lodash's `debounce` supports it.
          debounce(saveAndRefetchDraft, 15_000),
    [saveAndRefetchDraft]
  )
  // Flush the draft to backend when switching chats.
  // Note that specifying `chatId` as a dependency is not necessary,
  // because `debouncedSaveAndRefetchDraft` itself already depends on it.
  useEffect(() => {
    return () => {
      debouncedSaveAndRefetchDraft?.flush()
    }
  }, [accountId, chatId, debouncedSaveAndRefetchDraft])
  // Flush when alt-tabbing and stuff.
  // This should also work for when quitting the app,
  // but it doesn't manage to finish in time, unfortunately.
  useEffect(() => {
    if (debouncedSaveAndRefetchDraft == null) {
      return
    }
    const flushIfHidden = () => {
      if (document.visibilityState === 'hidden') {
        debouncedSaveAndRefetchDraft.flush()
      }
    }
    document.addEventListener('visibilitychange', flushIfHidden)
    return () => document.removeEventListener('visibilitychange', flushIfHidden)
  }, [debouncedSaveAndRefetchDraft])
  // TODO also flush when unfocusing the element?
  // For example, to cover the case where the user goes to quit the app
  // (though this will not cover `Ctrl + Q` shortcut),
  // or to turn off the machine.

  const setAndDebouncedSaveAndRefetchDraft = useMemo(
    () =>
      debouncedSaveAndRefetchDraft == null
        ? null
        : (newDraftState: DraftObject) => {
            setDraftState(newDraftState)
            debouncedSaveAndRefetchDraft(newDraftState)
          },
    [debouncedSaveAndRefetchDraft]
  )

  const updateDraftText = (text: string, InputChatId: number) => {
    if (chatId !== InputChatId) {
      log.warn("chat Id and InputChatId don't match, do nothing")
    } else {
      setAndDebouncedSaveAndRefetchDraft?.({
        ...draftState,
        text,
      })
    }
  }

  const removeQuote = useCallback(() => {
    setAndDebouncedSaveAndRefetchDraft?.({
      ...draftState,
      quote: null,
    })
    inputRef.current?.focus()
  }, [draftState, inputRef, setAndDebouncedSaveAndRefetchDraft])

  const removeFile = useCallback(() => {
    setAndDebouncedSaveAndRefetchDraft?.({
      ...draftState,
      file: '',
      fileName: null,
      fileBytes: 0,
      fileMime: null,
      // VCard is derived from the file. When we remove `file`,
      // the re-fetched draft object will also have removed `vcardContact`.
      // But we can skip a flush here, so let's set it to `null` manually.
      vcardContact: null,
      viewType: 'Text',
    })

    inputRef.current?.focus()
  }, [draftState, inputRef, setAndDebouncedSaveAndRefetchDraft])

  const addFileToDraft = useCallback(
    async (file: string, fileName: string | null, viewType: T.Viewtype) => {
      if (debouncedSaveAndRefetchDraft == null || saveAndRefetchDraft == null) {
        return
      }
      inputRef.current?.focus()
      const newDraftState: typeof draftState = {
        ...draftState,
        file,
        fileName,
        viewType,
        fileBytes: 0,
        fileMime: null,
      }
      // Cannot use `setAndDebouncedSaveAndRefetchDraft`
      // because it doesn't return the Promise.
      setDraftState(newDraftState)
      debouncedSaveAndRefetchDraft?.clear()
      return saveAndRefetchDraft(newDraftState)
    },
    [draftState, inputRef, saveAndRefetchDraft, debouncedSaveAndRefetchDraft]
  )

  const quoteMessage = useMemo(
    () =>
      setAndDebouncedSaveAndRefetchDraft == null ||
      debouncedSaveAndRefetchDraft == null
        ? null
        : (messageOrMessageId: number | T.Message) => {
            let newDraftState: typeof draftState
            let needRefetch: boolean
            const isFullMessage = typeof messageOrMessageId !== 'number'
            if (isFullMessage) {
              const fullQuote = messageToQuote(messageOrMessageId)
              newDraftState = {
                ...draftState,
                quote: fullQuote.quote,
              }
              needRefetch = fullQuote.needRefetch
            } else {
              newDraftState = {
                ...draftState,
                quote: {
                  kind: 'WithMessage',
                  messageId: messageOrMessageId,
                },
              }
              needRefetch = true
            }

            setAndDebouncedSaveAndRefetchDraft(newDraftState)
            if (needRefetch) {
              // Need an immediate refetch, to get the "full" quote,
              // with the author's name, text, etc.
              debouncedSaveAndRefetchDraft.flush()
            }
          },
    [
      draftState,
      setAndDebouncedSaveAndRefetchDraft,
      debouncedSaveAndRefetchDraft,
    ]
  )

  const { jumpToMessage } = useMessage()

  /**
   * Support the Ctrl/Cmd+Up/Down shortcuts to select a message
   * to reply to and set the quote in the draft accordingly
   */
  const onSelectReplyToShortcut = (
    upOrDown:
      | KeybindAction.Composer_SelectReplyToUp
      | KeybindAction.Composer_SelectReplyToDown
  ) => {
    if (
      quoteMessage == null ||
      setAndDebouncedSaveAndRefetchDraft == null ||
      // These are implied by `setAndDebouncedSaveAndRefetchDraft == null`,
      // but TypeScript doesn't know
      debouncedSaveAndRefetchDraft == null ||
      chatId == undefined ||
      !canSend
    ) {
      return
    }
    const quoteAndJumpToMessage = (messageOrMessageId: number | T.Message) => {
      const isFullMessage = typeof messageOrMessageId !== 'number'
      quoteMessage(messageOrMessageId)
      jumpToMessage({
        accountId,
        msgId: isFullMessage ? messageOrMessageId.id : messageOrMessageId,
        msgChatId: chatId,
        highlight: true,
        focus: false,
        // The message is usually already in view,
        // so let's not scroll at all if so.
        scrollIntoViewArg: { block: 'nearest' },
      })
    }

    /**
     * filter all messageIds that can be replied to
     *
     * see https://github.com/deltachat/deltachat-desktop/blob/77a1f88a351df49e5df38a14c3a1704a76ecdcb3/packages/frontend/src/components/message/Message.tsx#L274-L278
     */
    const messageIds = Object.keys(messageListState.messageCache)
      .map(Number)
      .filter(
        id =>
          messageListState.messageCache[id]?.kind === 'message' &&
          messageListState.messageCache[id]?.isInfo === false
      )
    const currQuote = draftState.quote
    if (!currQuote) {
      if (upOrDown === KeybindAction.Composer_SelectReplyToUp) {
        const id = messageIds[messageIds.length - 1]
        const fromCache = messageListState.messageCache[id]
        quoteAndJumpToMessage(fromCache?.kind === 'message' ? fromCache : id)
      }
      return
    }
    if (currQuote.kind !== 'WithMessage') {
      // Or shall we override with the last message?
      return
    }
    const currQuoteMessageIdInd = messageIds.lastIndexOf(currQuote.messageId)
    if (currQuoteMessageIdInd === -1) {
      // maybe the message is just not in the cache (yet)
      // but still in the full list of messages
      // -> check if it's there
      const isQuoteInMessagelist = messageListState.messageListItems.some(
        m => m.kind === 'message' && m.msg_id === currQuote.messageId
      )
      if (isQuoteInMessagelist) {
        // message is in the full list, just not in the cache (yet)
        // -> jump to it, it will be loaded then (and the surrounding messages)
        jumpToMessage({
          accountId,
          msgId: currQuote.messageId,
          msgChatId: chatId,
          highlight: true,
          focus: false,
          scrollIntoViewArg: { block: 'nearest' },
        })
        return
      } else {
        // message not found at all, remove quote
        removeQuote()
        return
      }
    }
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
    const fromCache = messageListState.messageCache[newId]
    quoteAndJumpToMessage(fromCache?.kind === 'message' ? fromCache : newId)
  }

  useEffect(() => {
    window.__setQuoteInDraft = (
      messageOrMessageId: Parameters<Exclude<typeof quoteMessage, null>>[0]
    ) => {
      quoteMessage?.(messageOrMessageId)
      inputRef.current?.focus()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  }, [quoteMessage, inputRef])

  /**
   * Handle {@linkcode window.__setDraftRequest} which might have been set
   * before the chat was loaded to set a draft with specified text and/or file.
   */
  const handleSetDraftRequest = useCallback(() => {
    if (
      window.__setDraftRequest == undefined ||
      draftIsLoading ||
      window.__setDraftRequest.accountId !== accountId ||
      window.__setDraftRequest.chatId !== chatId
    ) {
      return
    }

    const setDraftRequest = window.__setDraftRequest
    window.__setDraftRequest = undefined

    if (saveAndRefetchDraft == null) {
      // This is expected to happen if `!canSend`.
      openAlertDialog({
        message: tx(
          'error_x',
          'Could not set draft message\n' + JSON.stringify({ canSend, chatId })
        ),
      })
      return
    }

    ;(async () => {
      // TODO fix: consider checking _only_ whether either file or text
      // is going to get overridden in the current draft.
      // If there is no file, just add the file to draft,
      // no need to ask for confirmation.
      //
      // Also if the file and the text are the same as in the current draft,
      // no need to do anything.
      if (!isDraftEmpty(draftState)) {
        // perf: we could add `chat` argument to `useDraft`,
        // but let's not change API for such a minor thing
        const chatName: string = await BackendRemote.rpc
          .getBasicChatInfo(accountId, chatId)
          .then(c => c.name)
          .catch(() => tx('chat'))

        const continueProcess: boolean = await openConfirmationDialog({
          message: tx('confirm_replace_draft', chatName),
          confirmLabel: tx('replace_draft'),
        })
        if (!continueProcess) {
          return
        }
      }

      const newDraftState = emptyDraft(chatId)

      if (setDraftRequest.text !== undefined) {
        newDraftState.text = setDraftRequest.text
      }
      if (setDraftRequest.file !== undefined) {
        // Same as in `addFileToDraft`.
        newDraftState.file = setDraftRequest.file.path
        newDraftState.fileName = setDraftRequest.file.name ?? null
        newDraftState.viewType = setDraftRequest.file.viewType
        newDraftState.fileMime = null
        newDraftState.fileBytes = 0
      }
      // Cannot use `setAndDebouncedSaveAndRefetchDraft`
      // because it doesn't return the Promise. See also `addFileToDraft`.
      //
      // `await` is important here, it makes sure
      // that we don't delete the file before we're done storing it
      // to the Core.
      setDraftState(newDraftState)
      debouncedSaveAndRefetchDraft?.clear()
      await saveAndRefetchDraft(newDraftState)
    })().finally(() => {
      if (setDraftRequest.file?.deleteTempFileWhenDone) {
        runtime.removeTempFile(setDraftRequest.file.path)
      }
    })
  }, [
    accountId,
    canSend,
    chatId,
    debouncedSaveAndRefetchDraft,
    draftIsLoading,
    draftState,
    openAlertDialog,
    openConfirmationDialog,
    saveAndRefetchDraft,
    tx,
  ])
  handleSetDraftRequest()
  const handleSetDraftRequestEffectEvent = useEffectEvent(handleSetDraftRequest)
  useEffect(() => {
    window.__checkSetDraftRequest = handleSetDraftRequestEffectEvent
    return () => {
      if (window.__checkSetDraftRequest === handleSetDraftRequestEffectEvent) {
        window.__checkSetDraftRequest = undefined
      }
    }
  }, [])

  return {
    draftState,
    draftIsLoading,
    onSelectReplyToShortcut,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraftState: useCallback(() => {
      clearDraftState()
      debouncedSaveAndRefetchDraft?.clear()
    }, [clearDraftState, debouncedSaveAndRefetchDraft]),
    setDraftState: useCallback(
      (newState: DraftObject) => {
        setDraftState(newState)
        debouncedSaveAndRefetchDraft?.clear()
      },
      [debouncedSaveAndRefetchDraft]
    ),
  }
}

function messageToQuote(
  message: Pick<
    T.Message,
    | 'id'
    | 'chatId'
    | 'sender'
    | 'viewType'
    | 'text'
    | 'file'
    | 'isForwarded'
    | 'overrideSenderName'
  >
): {
  quote: T.MessageQuote
  /**
   * Whether the accuracy of the conversion is good enough
   * to show the returned quote in the UI,
   * or whether we need to re-fetch the quote from core right away.
   */
  needRefetch: boolean
} {
  return {
    needRefetch: !(
      // Obscure `viewType`s usually have some special quote text.
      // For example, quotes with a contact attachment
      // have `text` '<person emoji> <Contact name>',
      // even if the original message doens't have any text.
      // So let's refetch those.
      // See https://github.com/chatmail/core/blob/347938a9f991c44f304f20e562c460ed66ef13a4/deltachat-jsonrpc/src/api/types/message.rs#L157-L177.
      (
        message.viewType === 'Text' ||
        // Images and stickers also have `text` '<emoji> Image',
        // but it's probably fine not to refetch.
        message.viewType === 'Image' ||
        message.viewType === 'Sticker' ||
        message.viewType === 'Gif'
      )
    ),
    quote: {
      kind: 'WithMessage',
      chatId: message.chatId,
      isForwarded: message.isForwarded,
      overrideSenderName: message.overrideSenderName,
      authorDisplayColor: message.sender.color,
      authorDisplayName: message.sender.displayName,

      text: message.text,
      viewType: message.viewType,
      image:
        message.viewType === 'Image' ||
        message.viewType === 'Sticker' ||
        message.viewType === 'Gif'
          ? message.file
          : null,
      messageId: message.id,
    },
  }
}
