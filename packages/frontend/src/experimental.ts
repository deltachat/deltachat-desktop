import { getLogger } from '../../shared/logger'
import { BackendRemote } from './backend-com'
import { DragRegionOverlay, printCallCounterResult } from './debug-tools'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from './ScreenController'

const log = getLogger('renderer/experiments')

class Experimental {
  help() {
    // eslint-disable-next-line no-console
    console.log(`
These functions are highly experimental, use at your own risk.
- importContacts (contacts:[email,name][]) // for mass importing contacts
    example: type "exp.importContacts([['email1@example.com', 'Heinz Herlich'],['bea@example.com','Berta Bissig']])"
- getAllAccounts() // list all accounts

only for debugging:
- testErrorLogging()
- getContextEmitters()
- printCallCounterResult() // for profiling you can track what is called how often with 'countCall(label: string)'
- .rpc // only available in devmode, gives full access to jsonrpc
- .runtime // only available in devmode, gives full access to runtime
- showDragAreas() // toggle drag region overlay
    `)
  }
  constructor() {
    window.exp = this
  }

  getAllAccounts() {
    return BackendRemote.listAccounts()
  }

  async importContacts(contacts: [string, string][]) {
    const accountId = selectedAccountId()
    let error_count = 0
    for (const contact of contacts) {
      if (
        await BackendRemote.rpc.createContact(accountId, contact[0], contact[1])
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
    throw new Error('a test error - should be caught and logged to logfile')
  }

  getContextEmitters() {
    return (BackendRemote as any).contextEmitters
  }

  printCallCounterResult() {
    printCallCounterResult()
  }

  get rpc() {
    if (!runtime.getRC_Config().devmode) {
      throw new Error(
        "you need to enable devmode to access this. This is dangerous don't continue if you don't know what you are doing."
      )
    }
    return BackendRemote.rpc
  }

  get runtime() {
    if (!runtime.getRC_Config().devmode) {
      throw new Error(
        "you need to enable devmode to access this. This is dangerous don't continue if you don't know what you are doing."
      )
    }
    return runtime
  }

  dragRegionOverlay?: DragRegionOverlay
  showDragAreas() {
    if (!this.dragRegionOverlay) {
      this.dragRegionOverlay = new DragRegionOverlay()
    }
    this.dragRegionOverlay.toggle()
  }
}

export const exp = new Experimental()
