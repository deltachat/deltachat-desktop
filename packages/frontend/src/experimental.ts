import { getLogger } from '../../shared/logger'
import { BackendRemote } from './backend-com'
import { printCallCounterResult } from './debug-tools'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from './ScreenController'

const log = getLogger('renderer/experiments')

class Experimental {
  help() {
    /* ignore-console-log */
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

  debugDragAreaActive: boolean = false
  debugDragAreaUpdateInterval: ReturnType<typeof setInterval> | null
  showDragAreas() {
    let element: HTMLCanvasElement | undefined = document.getElementById(
      'drag-area-visualisation'
    ) as HTMLCanvasElement
    if (!element) {
      element = document.createElement('canvas')
      element.height = window.visualViewport.height
      element.width = window.visualViewport.width
      element.id = 'drag-area-visualisation'
      element.popover = 'manual'
      document.body.append(element)
    }

    if (this.debugDragAreaActive) {
      element.hidePopover()
      clearInterval(this.debugDragAreaUpdateInterval)
      this.debugDragAreaUpdateInterval = null
      this.debugDragAreaActive = false
    } else {
      element.showPopover()
      const drawing = element.getContext('2d')
      drawing.translate(0.5, 0.5)
      this.debugDragAreaUpdateInterval = setInterval(() => {
        // hack to make it show on top of dialogs
        element.hidePopover()
        element.showPopover()

        const { height, width } = element.getBoundingClientRect()
        drawing.clearRect(0, 0, width, height)

        function drawElement(rect: DOMRect | undefined, color: string) {
          if (!rect) {
            return
          }
          drawing.fillStyle = color
          drawing.fillRect(rect.x, rect.y, rect.width, rect.height)
        }

        function traverseDOMRecursively(element: HTMLElement) {
          // element.computedStyleMap
          const styles = window.getComputedStyle(element)

          //@ts-ignore
          const role = styles.webkitAppRegion

          if (role !== 'none') {
            const boundingRect = element.getClientRects()[0]
            if (role === 'no-drag') {
              drawElement(boundingRect, 'green')
            } else if (role === 'drag') {
              drawElement(boundingRect, 'red')
            }
            drawing.moveTo(0, 0)
          }

          for (const child of element.children) {
            if (child instanceof HTMLElement) {
              traverseDOMRecursively(child)
            }
          }
        }

        traverseDOMRecursively(document.documentElement)
      }, 50)
      this.debugDragAreaActive = true
    }
  }
}

export const exp = new Experimental()
