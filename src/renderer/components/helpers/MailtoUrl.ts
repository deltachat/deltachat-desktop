import MailtoDialog, { doMailtoAction } from '../dialogs/MailtoDialog'
import { BackendRemote } from '../../backend-com'
import { getLogger } from '../../../shared/logger'
import { parseMailto } from '../../../shared/parse_mailto'
import { selectChat } from './ChatMethods'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/processMailtoUrl')

export default async function processMailtoUrl(
  url: string,
  callback: any = null
) {
  const tx = window.static_translate
  log.debug('processing mailto url:', url)

  try {
    const accountId = selectedAccountId()
    const mailto = parseMailto(url)
    const messageText = mailto.subject
      ? mailto.subject + (mailto.body ? '\n\n' + mailto.body : '')
      : mailto.body

    if (mailto.to) {
      let contactId = await BackendRemote.rpc.lookupContactIdByAddr(
        accountId,
        mailto.to
      )
      if (contactId === null) {
        contactId = await BackendRemote.rpc.createContact(
          accountId,
          mailto.to,
          null
        )
      }
      const chatId = await BackendRemote.rpc.createChatByContactId(
        accountId,
        contactId
      )
      if (messageText) {
        await doMailtoAction(chatId, messageText)
      } else {
        selectChat(chatId)
      }
    } else {
      if (messageText) {
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
