import { DeltaBackend } from './delta-remote'
import { getLogger } from '../shared/logger'
import { DeltaChat } from './backend'

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

  getAllAccounts() {
    return DeltaChat.listAccounts()
  }

  async importContacts(contacts: [string, string][]) {
    let error_count = 0
    for (const contact of contacts) {
      if (
        await DeltaBackend.call(
          'contacts.createContact',
          contact[0],
          contact[1]
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

  testErrorLogging() {
    log.debug(new Error('a test error - should be logged to logfile'))
    throw new Error('a test error - should be catched and logged to logfile')
  }
}

export const exp = new Experimental()
