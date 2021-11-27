import DeltaChat from 'deltachat-node'
import { getLogger } from '../../shared/logger'

import SplitOut from './splitout'
import { JsonContact } from '../../shared/shared-types'

const log = getLogger('main/deltachat/contacts')

export default class JsonContacts extends SplitOut {
  unblockContact(contactId: number) {
    const contact = this.selectedAccountContext.getContact(contactId)
    this.selectedAccountContext.blockContact(contactId, false)
    const name = contact.getNameAndAddress()
    log.info(`Unblocked contact ${name} (id = ${contactId})`)
  }

  blockContact(contactId: number) {
    const contact = this.selectedAccountContext.getContact(contactId)
    this.selectedAccountContext.blockContact(contactId, true)
    const name = contact.getNameAndAddress()
    log.debug(`Blocked contact ${name} (id = ${contactId})`)
  }

  getBlocked(): JsonContact[] {
    if (!this.selectedAccountContext) return []
    return this.selectedAccountContext
      .getBlockedContacts()
      .map(this.getContact.bind(this))
  }

  async changeNickname(contactId: number, name: string) {
    const contact = this.selectedAccountContext.getContact(contactId)
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
    return this.selectedAccountContext.getContact(contactId).toJson()
  }

  getContactIds(listFlags: number, queryStr: string): number[] {
    return (
      this.selectedAccountContext
        .getContacts(listFlags, queryStr)
        // deduplicate the items here until its fixed in the core: see https://github.com/deltachat/deltachat-core-rust/issues/2552
        .filter(function (item: number, pos: number, ary: number[]) {
          return !pos || item != ary[pos - 1]
        })
    )
  }

  _getJsonContact(id: number) {
    const contact = this.selectedAccountContext.getContact(id).toJson()
    return { ...contact }
  }

  getContacts(ids: number[]) {
    const result: { [id: number]: JsonContact } = {}
    for (const id of ids) {
      result[id] = this._getJsonContact(id)
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
}
