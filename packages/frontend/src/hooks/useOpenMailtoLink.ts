import { useCallback } from 'react'

import MailtoDialog from '../components/dialogs/MailtoDialog'
import useAlertDialog from './dialog/useAlertDialog'
import useChat from './chat/useChat'
import useCreateChatByEmail from './chat/useCreateChatByEmail'
import useCreateDraftMessage from './chat/useCreateDraftMesssage'
import useDialog from './dialog/useDialog'
import useTranslationFunction from './useTranslationFunction'
import { getLogger } from '../../../shared/logger'
import { parseMailto } from '../../../shared/parse_mailto'

const log = getLogger('renderer/hooks/useOpenMailtoLink')

/**
 * Handles `mailto:` links.
 *
 * By default this selects a chat with the email address specified in the link.
 *
 * In case this link contains a subject and / or body a draft message will be
 * created. If no email address was given, the user is asked to select a
 * receiver.
 */
export default function useOpenMailtoLink() {
  const createChatByEmail = useCreateChatByEmail()
  const createDraftMessage = useCreateDraftMessage()
  const openAlertDialog = useAlertDialog()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectChat } = useChat()

  return useCallback(
    async (accountId: number, url: string) => {
      log.debug('processing mailto url:', url)

      try {
        const mailto = parseMailto(url)

        const messageText = mailto.subject
          ? mailto.subject + (mailto.body ? '\n\n' + mailto.body : '')
          : mailto.body

        if (mailto.to) {
          // Attempt creating a new chat based on email address. This method might
          // return `null` when the user did _not_ confirm creating a new chat
          const chatId = await createChatByEmail(accountId, mailto.to)

          if (chatId) {
            if (messageText) {
              await createDraftMessage(accountId, chatId, messageText)
            } else {
              selectChat(accountId, chatId)
            }
          }
        } else {
          if (messageText) {
            // Body but no email address was given in link, show a dialogue to
            // select a receiver
            openDialog(MailtoDialog, { messageText })
          }
        }
      } catch (error) {
        log.error('mailto decoding error', error)

        await openAlertDialog({
          message: tx('mailto_link_could_not_be_decoded', url),
        })
      }
    },
    [
      createChatByEmail,
      createDraftMessage,
      openAlertDialog,
      openDialog,
      selectChat,
      tx,
    ]
  )
}
