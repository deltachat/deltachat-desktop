import DeltaChat from 'deltachat-node'

import SplitOut from './splitout'

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

  getContact(contactId: number) {
    const contact = this.selectedAccountContext.getContact(contactId)?.toJson()
    if (!contact) {
      throw new Error('contact not found')
    }
    return contact
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
