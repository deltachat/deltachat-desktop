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

  deleteContact(contactId: number) {
    return this.selectedAccountContext.deleteContact(contactId)
  }
}
