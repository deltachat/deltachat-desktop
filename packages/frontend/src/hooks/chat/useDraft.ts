import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { T } from '@deltachat/jsonrpc-client'
import { basename } from 'path'

import { getLogger } from '../../../../shared/logger'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { MessageTypeAttachmentSubset } from '../../components/attachment/Attachment'
import { KeybindAction } from '../../keybindings'
import useMessage from './useMessage'
import ComposerMessageInput from '../../components/composer/ComposerMessageInput'
import { type MessageListStore } from '../../stores/messagelist'

const log = getLogger('renderer/composer')

export type DraftObject = { chatId: number } & Pick<
  Type.Message,
  'id' | 'file' | 'viewType' | 'vcardContact'
> &
  MessageTypeAttachmentSubset & {
    /**
     * Whether the current state is to be soon uploaded to the backend
     * ({@linkcode BackendRemote.rpc.miscSetDraft}); and then re-fetched
     * (e.g. to finalize the value of {@linkcode DraftObject.fileName}
     * or {@linkcode DraftObject.quote}).
     *
     * This only gets set to `true` when the user changes the draft.
     */
    isPendingSaveAndRefetch: boolean
    /**
     * Note that this text is not always synced with the actual state
     * of the composer <textarea>. It's basically duplicated state.
     */
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
    isPendingSaveAndRefetch: false,
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
  clearDraftStateButKeepTextareaValue: () => void
  clearDraftStateAndUpdateTextareaValue: () => void
  setDraftStateAndUpdateTextareaValue: (newValue: DraftObject) => void
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
  ] = useState<DraftObject>(() => emptyDraft(chatId))

  /**
   * @see {@link _setDraftStateButKeepTextareaValue}.
   */
  const setDraftStateAndUpdateTextareaValue = useCallback(
    (newValue: DraftObject) => {
      _setDraftStateButKeepTextareaValue(newValue)
      inputRef.current?.setText(newValue.text)
    },
    [inputRef]
  )

  /**
   * Reset `draftState` to "empty draft" value,
   * but don't save it to backend and don't change the value
   * of the textarea.
   */
  const clearDraftStateButKeepTextareaValue = useCallback(() => {
    _setDraftStateButKeepTextareaValue(_ => emptyDraft(chatId))
  }, [chatId])
  /**
   * @see {@link clearDraftStateButKeepTextareaValue}
   */
  const clearDraftStateAndUpdateTextareaValue = useCallback(() => {
    setDraftStateAndUpdateTextareaValue(emptyDraft(chatId))
  }, [chatId, setDraftStateAndUpdateTextareaValue])

  const skipLoadingDraft = chatId === null || !canSend
  // The "loading" approach below is similar to that of our `useRpcFetch`.
  /**
   * Dummy state used to trigger manual refreshes.
   * Changing this value forces a new fetch.
   */
  const [refreshDraftDummyValue, _setRefreshDraftDummyValue] = useState(0)
  const reloadDraft = useCallback(
    () => _setRefreshDraftDummyValue(old => old + 1),
    []
  )
  type LoadDraftDependencies = [
    typeof accountId,
    typeof chatId,
    typeof refreshDraftDummyValue,
    typeof isContactRequest,

    typeof clearDraftStateButKeepTextareaValue,
    typeof inputRef,
    typeof skipLoadingDraft,
  ]
  const draftDependenciesIdentity = useMemo(
    () => Symbol(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accountId,
      chatId,
      refreshDraftDummyValue,
      isContactRequest,
      clearDraftStateButKeepTextareaValue,
      inputRef,
      skipLoadingDraft,
    ] as LoadDraftDependencies
  )
  const [loadedDraftForDependencies, setLoadedDraftForDependencies] = useState<
    null | typeof draftDependenciesIdentity
  >(null)
  const draftIsLoading = skipLoadingDraft
    ? false
    : loadedDraftForDependencies !== draftDependenciesIdentity
  useEffect(
    () => {
      if (skipLoadingDraft) {
        clearDraftStateButKeepTextareaValue()
        return
      }

      let outdated = false

      BackendRemote.rpc
        .getDraft(selectedAccountId(), chatId)
        .then(newDraft => {
          if (outdated) {
            return
          }

          if (!newDraft) {
            log.debug('no draft')
            clearDraftStateButKeepTextareaValue()
            inputRef.current?.setText('')
          } else {
            _setDraftStateButKeepTextareaValue(old => ({
              ...old,
              isPendingSaveAndRefetch: false,
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
          setLoadedDraftForDependencies(draftDependenciesIdentity)
          setTimeout(() => {
            inputRef.current?.focus()
          })
        })
        .catch(error => {
          if (!outdated) {
            setLoadedDraftForDependencies(draftDependenciesIdentity)
          }
          throw error
        })

      return () => {
        outdated = true
      }
    },
    [
      accountId,
      chatId,
      refreshDraftDummyValue,
      isContactRequest,
      clearDraftStateButKeepTextareaValue,
      inputRef,
      skipLoadingDraft,
      draftDependenciesIdentity,
    ] as [...LoadDraftDependencies, typeof draftDependenciesIdentity]
  )

  useEffect(() => {
    window.__reloadDraft = reloadDraft
    return () => {
      window.__reloadDraft = null
    }
  }, [reloadDraft])

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
  useEffect(() => {
    if (
      chatId == null ||
      !canSend ||
      // Note that this covers the "`loadDraft` has not yet finished"
      // and "`loadDraft` has just finished" cases.
      !draftState.isPendingSaveAndRefetch
    ) {
      return
    }

    /**
     * A.k.a. "don't refetch the draft after saving".
     */
    let outdated = false

    // Note that we must make sure that this function doesn't change the state
    // such that `isPendingSaveAndRefetch` remains `true`,
    // in order to avoid an endless loop.
    ;(async function saveAndRefetchDraft() {
      const accountId = selectedAccountId()

      const draft = draftState
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

      if (outdated) {
        return
      }
      const newDraft = await BackendRemote.rpc.getDraft(accountId, chatId)
      if (outdated) {
        return
      }

      if (newDraft) {
        _setDraftStateButKeepTextareaValue(old => ({
          ...old,
          isPendingSaveAndRefetch: false,
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
        _setDraftStateButKeepTextareaValue(_ => ({
          ...emptyDraft(chatId),
          isPendingSaveAndRefetch: false,
        }))
      }
    })()

    return () => {
      outdated = true
    }
  }, [draftState, chatId, canSend])

  const setAndSaveAndRefetchDraftButKeepTextareaValue = useCallback(
    (
      action: (
        prevDraftState: DraftObject
      ) => Omit<DraftObject, 'isPendingSaveAndRefetch'>
    ) => {
      _setDraftStateButKeepTextareaValue(prevDraftState => {
        return {
          ...action(prevDraftState),
          isPendingSaveAndRefetch: true,
        }
      })
    },
    []
  )

  const updateDraftText = (text: string, InputChatId: number) => {
    if (chatId !== InputChatId) {
      log.warn("chat Id and InputChatId don't match, do nothing")
    } else {
      setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
        ...draft,
        text,
      }))
    }
  }

  const removeQuote = useCallback(() => {
    setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
      ...draft,
      quote: null,
    }))
    inputRef.current?.focus()
  }, [inputRef, setAndSaveAndRefetchDraftButKeepTextareaValue])

  const removeFile = useCallback(() => {
    setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
      ...draft,
      file: '',
      viewType: 'Text',
    }))

    inputRef.current?.focus()
  }, [inputRef, setAndSaveAndRefetchDraftButKeepTextareaValue])

  type FilePath = string
  const fileIsNotInDraftMap = useRef(
    new Map<FilePath, { promise: Promise<void>; resolvePromise: () => void }>()
  )
  const getFileIsNotInDraftPromise = useCallback(
    (filePath: FilePath): Promise<void> => {
      const entry = fileIsNotInDraftMap.current.get(filePath)
      if (entry != undefined) {
        return entry.promise
      }

      let resolvePromise: () => void
      const promise = new Promise<void>(r => (resolvePromise = r))
      fileIsNotInDraftMap.current.set(filePath, {
        promise,
        resolvePromise: resolvePromise!,
      })
      return promise
    },
    []
  )
  useEffect(() => {
    const map = fileIsNotInDraftMap.current
    map.forEach(({ resolvePromise }, filePath) => {
      // If the file is not in the draft, then it has been removed
      // from the draft (or, possibly, was never added to the draft
      // in the first place).
      if (draftState.file !== filePath) {
        log.info('File', filePath, 'is not in the draft, invoking callback')
        resolvePromise()
        map.delete(filePath)
      }
    })
  }, [draftState.file])
  // TODO all this complexity can probably be solved
  // by adding Core API to set draft file by content (and not just by path).
  /**
   * @returns a Promise that resolves when the file
   * has been removed from the draft (or, possibly, was never added
   * to the draft in the first place).
   * This is useful when adding a temporary file,
   * so that you know that you can delete it.
   *
   * Note that as of writing, this happens basically immediately,
   * because when you call {@linkcode BackendRemote.rpc.miscSetDraft},
   * the Core copies the file and sets the file path to that copied files' path.
   */
  const addFileToDraft = useCallback(
    (file: string, fileName: string, viewType: T.Viewtype): Promise<void> => {
      setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
        ...draft,
        file,
        fileName,
        viewType,
        fileBytes: 0,
        fileMime: null,
      }))
      inputRef.current?.focus()
      return getFileIsNotInDraftPromise(file)
    },
    [
      inputRef,
      setAndSaveAndRefetchDraftButKeepTextareaValue,
      getFileIsNotInDraftPromise,
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
      setAndSaveAndRefetchDraftButKeepTextareaValue == null ||
      // These are implied by
      // `setAndSaveAndRefetchDraftButKeepTextareaValue == null`,
      // but TypeScript doesn't know
      chatId == undefined ||
      !canSend
    ) {
      return
    }
    const quoteMessage = (messageId: number) => {
      setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
        ...draft,
        quote: {
          kind: 'WithMessage',
          messageId,
        },
      }))

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
      setAndSaveAndRefetchDraftButKeepTextareaValue(draft => ({
        ...draft,
        quote: {
          kind: 'WithMessage',
          messageId,
        },
      }))
      inputRef.current?.focus()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  }, [inputRef, setAndSaveAndRefetchDraftButKeepTextareaValue])

  return {
    draftState,
    draftIsLoading,
    onSelectReplyToShortcut,
    removeQuote,
    updateDraftText,
    addFileToDraft,
    removeFile,
    clearDraftStateButKeepTextareaValue,
    clearDraftStateAndUpdateTextareaValue,
    setDraftStateAndUpdateTextareaValue,
  }
}
