import { useState, useRef, useEffect, useCallback } from 'react'
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
  'id' | 'file' | 'quote' | 'viewType' | 'vcardContact'
> &
  MessageTypeAttachmentSubset & {
    /**
     * Note that this text is not always synced with the actual state
     * of the composer <textarea>. It's basically duplicated state.
     */
    text: Type.Message['text']
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
  const draftRef = useRef<DraftObject>(draftState)
  draftRef.current = draftState

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
    window.__reloadDraft = loadDraft.bind(null, chatId || 0)
    return () => {
      window.__reloadDraft = null
    }
  }, [chatId, loadDraft])

  useEffect(() => {
    log.debug('reloading chat because id changed', chatId)
    loadDraft(chatId || 0)
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
   */
  const saveAndRefetchDraft = useCallback(async () => {
    if (chatId === null || !canSend) {
      return
    }
    const accountId = selectedAccountId()

    const draft = draftRef.current
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
      saveAndRefetchDraft()
    }
  }

  const removeQuote = useCallback(() => {
    if (draftRef.current) {
      draftRef.current.quote = null
    }
    saveAndRefetchDraft()
    inputRef.current?.focus()
  }, [inputRef, saveAndRefetchDraft])

  const removeFile = useCallback(() => {
    draftRef.current.file = ''
    draftRef.current.viewType = 'Text'
    saveAndRefetchDraft()
    inputRef.current?.focus()
  }, [inputRef, saveAndRefetchDraft])

  const addFileToDraft = useCallback(
    async (file: string, fileName: string, viewType: T.Viewtype) => {
      draftRef.current.file = file
      draftRef.current.fileName = fileName
      draftRef.current.viewType = viewType
      inputRef.current?.focus()
      return saveAndRefetchDraft()
    },
    [inputRef, saveAndRefetchDraft]
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
    if (chatId == undefined || !canSend) {
      return
    }
    const quoteMessage = (messageId: number) => {
      draftRef.current.quote = {
        kind: 'WithMessage',
        messageId,
      } as Type.MessageQuote
      saveAndRefetchDraft()

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
      draftRef.current.quote = {
        kind: 'WithMessage',
        messageId,
      } as Partial<Type.MessageQuote> as any as Type.MessageQuote
      saveAndRefetchDraft()
      inputRef.current?.focus()
    }
    return () => {
      window.__setQuoteInDraft = null
    }
  }, [draftRef, inputRef, saveAndRefetchDraft])

  return {
    draftState,
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
