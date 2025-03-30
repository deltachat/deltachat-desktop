import { useCallback } from 'react'

import useChat from './useChat'
import useConfirmationDialog from '../dialog/useConfirmationDialog'
import useTranslationFunction from '../useTranslationFunction'
import { BackendRemote } from '../../backend-com'

export type CreateDraftMessage = (
  accountId: number,
  chatId: number,
  messageText: string,
  file?: { path: string; name: string }
) => Promise<void>

/**
 * Create draft message in given chat.
 *
 * In case a draft message already exists, the user is asked if they want to
 * replace it.
 */
export default function useCreateDraftMessage() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const { selectChat } = useChat()

  return useCallback<CreateDraftMessage>(
    async (accountId, chatId, messageText, file) => {
      const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

      selectChat(accountId, chatId)

      if (draft) {
        const { name } = await BackendRemote.rpc.getBasicChatInfo(
          accountId,
          chatId
        )

        // Ask if the draft should be replaced
        const continueProcess = await openConfirmationDialog({
          message: tx('confirm_replace_draft', name),
          confirmLabel: tx('replace_draft'),
        })

        if (!continueProcess) {
          return
        }
      }

      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        messageText,
        file?.path || null,
        file?.name || null,
        null,
        file ? 'File' : 'Text'
      )

      window.__reloadDraft?.()
    },
    [tx, openConfirmationDialog, selectChat]
  )
}
