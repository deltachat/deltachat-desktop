import { callDcMethodAsync } from './ipc'
import { getLogger } from '../shared/logger'

const log = getLogger('renderer/experiments')

class Experimental {
  help = `
These functions are highly experimental, use at your own risk.
- importContacts (contacts:[email,name][]) // for mass importing contacts
    example: type "exp.importContacts([['email1@example.com', 'Heinz Herlich'],['bea@example.com','Berta Bissig']])"
    `
  constructor() {
    window.exp = this
  }

  async importContacts(contacts: [string, string][]) {
    let error_count = 0
    for (const contact of contacts) {
      if (
        await callDcMethodAsync(
          'contacts.createContact',
          contact[1],
          contact[0]
        )
      )
        log.debug('created contact', contact[1], contact[0])
      else {
        log.error('error on creating contact', contact[1], contact[0])
        error_count++
      }
    }
    log.info(`Imported ${contacts.length - error_count} contacts`)
  }
}

export const exp = new Experimental()
