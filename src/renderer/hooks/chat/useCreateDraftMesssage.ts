import { useCallback } from 'react'

import useChat from './useChat'
import useConfirmationDialog from '../dialog/useConfirmationDialog'
import useTranslationFunction from '../useTranslationFunction'
import { BackendRemote } from '../../backend-com'

export type CreateDraftMessage = (
  accountId: number,
  chatId: number,
  messageText: string
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
    async (accountId, chatId, messageText) => {
      const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

      selectChat(chatId)

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
        null,
        null,
        'Text'
      )

      window.__reloadDraft && window.__reloadDraft()
    },
    [tx, openConfirmationDialog, selectChat]
  )
}
