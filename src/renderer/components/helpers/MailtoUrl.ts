import MailtoDialog from '../dialogs/MailtoDialog'
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

export async function doMailtoAction(chatId: number, messageText: string) {
  const accountId = selectedAccountId()

  const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

  selectChat(chatId)

  if (draft) {
    const { name } = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)

    // ask if the draft should be replaced
    const continue_process = await new Promise((resolve, _reject) => {
      window.__openDialog('ConfirmationDialog', {
        message: window.static_translate('confirm_replace_draft', name),
        confirmLabel: window.static_translate('replace_draft'),
        cb: resolve,
      })
    })
    if (!continue_process) {
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
}
