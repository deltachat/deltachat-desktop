import MailtoDialog from '../dialogs/MailtoDialog'
import { getLogger } from '../../../shared/logger'
import { parseMailto } from '../../../shared/parse_mailto'
import {
  createChatByEmail,
  createDraftMessage,
  selectChat,
} from './ChatMethods'

const log = getLogger('renderer/processMailtoUrl')

/**
 * Handles `mailto:` links.
 *
 * By default this selects a chat with the email address specified in the link.
 *
 * In case this link contains a subject and / or body a draft message will be
 * created. If no email address was given, the user is asked to select a
 * receiver.
 */
export default async function processMailtoUrl(
  url: string,
  callback: any = null
) {
  const tx = window.static_translate
  log.debug('processing mailto url:', url)

  try {
    const mailto = parseMailto(url)

    const messageText = mailto.subject
      ? mailto.subject + (mailto.body ? '\n\n' + mailto.body : '')
      : mailto.body

    if (mailto.to) {
      // Attempt creating a new chat based on email address. This method might
      // return `null` when the user did _not_ confirm creating a new chat
      const chatId = await createChatByEmail(mailto.to)

      if (chatId) {
        if (messageText) {
          await createDraftMessage(chatId, messageText)
        } else {
          selectChat(chatId)
        }
      }
    } else {
      if (messageText) {
        // Body but no email address was given in link, show a dialogue to
        // select a receiver
        window.__openDialog(MailtoDialog, { messageText })
      }
    }

    callback && callback()
  } catch (error) {
    log.error('mailto decoding error', error)

    window.__openDialog('AlertDialog', {
      message: tx('mailto_link_could_not_be_decoded', url),
      cb: callback,
    })
  }
}
