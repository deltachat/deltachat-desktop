import { useState, useEffect, useCallback, useMemo } from 'react'
import { T } from '@deltachat/jsonrpc-client'
import { basename } from 'path'

import { getLogger } from '../../../../shared/logger'
import { BackendRemote, Type } from '../../backend-com'
import { MessageTypeAttachmentSubset } from '../../components/attachment/Attachment'
import { KeybindAction } from '../../keybindings'
import useMessage from './useMessage'
import ComposerMessageInput from '../../components/composer/ComposerMessageInput'
import { type MessageListStore } from '../../stores/messagelist'
import { debounce } from 'debounce'

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
    window.__reloadDraft = loadDraft
    return () => {
      window.__reloadDraft = null
    }
  }, [loadDraft])

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
    async (file: string, fileName: string, viewType: T.Viewtype) => {
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
      setAndDebouncedSaveAndRefetchDraft == null ||
      // These are implied by `setAndDebouncedSaveAndRefetchDraft == null`,
      // but TypeScript doesn't know
      debouncedSaveAndRefetchDraft == null ||
      chatId == undefined ||
      !canSend
    ) {
      return
    }
    const quoteMessage = (messageId: number) => {
      setAndDebouncedSaveAndRefetchDraft({
        ...draftState,
        quote: {
          kind: 'WithMessage',
          messageId,
        },
      })
      // Need an immediate refetch, to get the "full" quote,
      // with the author's name, text, etc.
      debouncedSaveAndRefetchDraft.flush()

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
        quoteMessage(messageIds[messageIds.length - 1])
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
    quoteMessage(newId)
  }

  useEffect(() => {
    window.__setQuoteInDraft = (messageId: number) => {
      setAndDebouncedSaveAndRefetchDraft?.({
        ...draftState,
        quote: {
          kind: 'WithMessage',
          messageId,
        },
      })
      // Again, we need an immediate refetch, to get the "full" quote,
      // with the author's name, text, etc.
      debouncedSaveAndRefetchDraft?.flush()

      inputRef.current?.focus()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  }, [
    draftState,
    inputRef,
    setAndDebouncedSaveAndRefetchDraft,
    debouncedSaveAndRefetchDraft,
  ])

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
