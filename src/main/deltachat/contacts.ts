import DeltaChat from 'deltachat-node'

import SplitOut from './splitout'
import { JsonContact } from '../../shared/shared-types'

export default class JsonContacts extends SplitOut {
  async changeNickname(contactId: number, name: string) {
    const contact = this.selectedAccountContext.getContact(contactId)
    if (!contact) {
      throw new Error('contact not found')
    }
    const address = contact.getAddress()
    const result = this.selectedAccountContext.createContact(name, address)
    return result
  }

  createContact(email: string, name?: string) {
    if (!DeltaChat.maybeValidAddr(email)) {
      throw new Error(this.controller.translate('bad_email_address'))
    }
    return this.selectedAccountContext.createContact(name || '', email)
  }

  /** Gets the direct message chat id with this contact and creates it if it doesn't exist yet */
  createChatByContactId(contactId: number) {
    const contact = this.selectedAccountContext.getContact(contactId)
    if (!contact) {
      throw new Error(`no contact could be found with id ${contactId}`)
    }
    const existingChatId = this.selectedAccountContext.getChatIdByContactId(
      contactId
    )
    if (existingChatId !== 0) {
      return existingChatId
    }
    const newChatId = this.selectedAccountContext.createChatByContactId(
      contactId
    )
    if (newChatId !== 0) {
      return newChatId
    } else {
      throw new Error('Could not create chat with contact ' + contactId)
    }
  }

  getContact(contactId: number) {
    const contact = this.selectedAccountContext.getContact(contactId)?.toJson()
    if (!contact) {
      throw new Error('contact not found')
    }
    return contact
  }

  getContacts(ids: number[]) {
    const result: { [id: number]: JsonContact } = {}
    for (const id of ids) {
      result[id] = this.getContact(id)
    }
    return result
  }

  getEncryptionInfo(contactId: number) {
    return this.selectedAccountContext.getContactEncryptionInfo(contactId)
  }

  lookupContactIdByAddr(email: string): number {
    if (!DeltaChat.maybeValidAddr(email)) {
      throw new Error(this.controller.translate('bad_email_address'))
    }
    return this.selectedAccountContext.lookupContactIdByAddr(email)
  }

  deleteContact(contactId: number) {
    return this.selectedAccountContext.deleteContact(contactId)
  }
}
