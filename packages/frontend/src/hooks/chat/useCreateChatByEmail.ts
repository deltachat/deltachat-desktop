import { useCallback } from 'react'

import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog'
import useDialog from '../dialog/useDialog'
import useTranslationFunction from '../useTranslationFunction'
import { createChatByContactId, getChatInfoByEmail } from '../../backend/chat'

import type { T } from '@deltachat/jsonrpc-client'

type ChatId = T.FullChat['id']

export type CreateChatByEmail = (
  accountId: number,
  email: string
) => Promise<ChatId | null>

/**
 * Creates a new chat with given email address and returns chat id.
 *
 * In case an unknown email address was chosen or a chat does not exist yet the
 * user will be prompted with a confirmation dialogue. In case the user aborts the
 * action null is returned.
 */
export default function useCreateChatByEmail(): CreateChatByEmail {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const createChatByEmail = useCallback(
    async (accountId: number, email: string) => {
      const { chatId, contactId } = await getChatInfoByEmail(accountId, email)
      if (chatId) {
        return chatId
      }
      /**
       * Although we know that creating a new chat will probably fail on chatmail accounts,
       * since we can't create an encrypted chat based on an email address, we continue
       * here.
       * see https://github.com/deltachat/deltachat-android/issues/3361
       */

      // Ask user if they want to proceed with creating a new contact and / or chat
      const continueProcess = await new Promise((resolve, _reject) => {
        openDialog(ConfirmationDialog, {
          message: tx('ask_start_chat_with', email),
          confirmLabel: tx('ok'),
          cb: resolve,
        })
      })

      if (!continueProcess) {
        return null
      }

      return await createChatByContactId(accountId, contactId, email)
    },
    [openDialog, tx]
  )

  return createChatByEmail
}
