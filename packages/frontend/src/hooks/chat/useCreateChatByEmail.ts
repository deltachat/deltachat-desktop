import { useCallback } from 'react'

import ConfirmationDialog from '../../components/dialogs/ConfirmationDialog'
import useDialog from '../dialog/useDialog'
import InvalidUnencryptedMailDialog from '../../components/dialogs/InvalidUnencryptedMail'
import useTranslationFunction from '../useTranslationFunction'
import { createChatByContactId, getChatInfoByEmail } from '../../backend/chat'
import { useSettingsStore } from '../../stores/settings'

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
  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.force_encryption === '1'

  const createChatByEmail = useCallback(
    async (accountId: number, email: string) => {
      const { chatId, contactId } = await getChatInfoByEmail(accountId, email)
      if (chatId) {
        return chatId
      }

      // On chatmail accounts a chat can't be created from a plain email address
      // alone (there's no key for it), so we only allow it when the address is
      // already a known contact
      if (isChatmail && !contactId) {
        openDialog(InvalidUnencryptedMailDialog)
        return null
      }

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
    [isChatmail, openDialog, tx]
  )

  return createChatByEmail
}
