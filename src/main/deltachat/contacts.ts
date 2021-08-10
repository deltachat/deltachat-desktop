import DeltaChat from 'deltachat-node'
import { getLogger } from '../../shared/logger'

import SplitOut from './splitout'
import { DCContact } from '../../shared/shared-types'

const log = getLogger('main/deltachat/contacts')

export default class DCContacts extends SplitOut {
  unblockContact(contactId: number) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log.info(`Unblocked contact ${name} (id = ${contactId})`)
  }

  blockContact(contactId: number) {
    const contact = this._dc.getContact(contactId)
    this._dc.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log.debug(`Blocked contact ${name} (id = ${contactId})`)
  }

  changeNickname(contactId: number, name: string) {
    const contact = this._dc.getContact(contactId)
    const address = contact.getAddress()
    const result = this._dc.createContact(name, address)

    // trigger interface updates
    const chatId = this._dc.getChatIdByContactId(contactId)
    this._controller.chatList.onChatModified(chatId)

    // TODO implement chat changed event in the core on name change
    return result
  }

  createContact(email: string, name?: string) {
    if (!DeltaChat.maybeValidAddr(email)) {
      throw new Error(this._controller.translate('bad_email_address'))
    }
    return this._dc.createContact(name || '', email)
  }

  /** Gets the direct message chat id with this contact and creates it if it doesn't exist yet */
  createChatByContactId(contactId: number) {
    const contact = this._dc.getContact(contactId)
    if (!contact) {
      throw new Error(`no contact could be found with id ${contactId}`)
    }
    const existingChatId = this._dc.getChatIdByContactId(contactId)
    if (existingChatId !== 0) {
      return existingChatId
    }
    const newChatId = this._dc.createChatByContactId(contactId)
    if (newChatId !== 0) {
      return newChatId
    } else {
      throw new Error('Could not create chat with contact ' + contactId)
    }
  }

  getContact(contactId: number) {
    return this._dc.getContact(contactId).toJson()
  }

  getContactIds(listFlags: number, queryStr: string): number[] {
    return this._dc.getContacts(listFlags, queryStr)
  }

  _getDCContact(id: number) {
    const contact = this._dc.getContact(id).toJson()
    return { ...contact }
  }

  getContacts(ids: number[]) {
    const result: { [id: number]: DCContact } = {}
    for (const id of ids) {
      result[id] = this._getDCContact(id)
    }
    return result
  }

  getEncryptionInfo(contactId: number) {
    return this._dc.getContactEncryptionInfo(contactId)
  }

  lookupContactIdByAddr(email: string): number {
    if (!DeltaChat.maybeValidAddr(email)) {
      throw new Error(this._controller.translate('bad_email_address'))
    }
    return this._dc.lookupContactIdByAddr(email)
  }
}
