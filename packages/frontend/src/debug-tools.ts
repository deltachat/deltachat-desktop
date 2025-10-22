import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('runtime/debug-tools')

const countCalls: { [key: string]: number } = {}
export function countCall(label: string) {
  if (countCalls[label]) {
    countCalls[label]++
  } else {
    countCalls[label] = 1
  }
}
export function printCallCounterResult() {
  // eslint-disable-next-line no-console
  console.table(countCalls)
}

/** Visualize drag/no-drag regions for debuging.
 * This is important because on MacOS there is no window title bar,
 * so the navbar and other elements need to take that role to make the window dragable.
 * But whats draggable is not clickable, so buttons need to be excluded.
 *
 * See https://github.com/deltachat/deltachat-desktop/issues/4018 to get an idea why this is important to get right.
 */
export class DragRegionOverlay {
  debugDragAreaUpdateInterval: ReturnType<typeof setInterval> | null = null
  toggle() {
    if (runtime.getRuntimeInfo().target !== 'electron') {
      log.warn(
        'DragRegionOverlay currently is based on a css attribute (`-webkit-app-region`), so might only work in the electron version'
      )
    }

    let element: HTMLCanvasElement | undefined = document.getElementById(
      'drag-area-visualisation'
    ) as HTMLCanvasElement
    if (!element) {
      if (!window.visualViewport) {
        throw new Error(
          'failed to init DragRegionOverlay: window.visualViewport is undefined, this is unexpected.'
        )
      }

      element = document.createElement('canvas')
      element.height = window.visualViewport.height
      element.width = window.visualViewport.width
      element.id = 'drag-area-visualisation'
      element.popover = 'manual'
      document.body.append(element)
    }

    if (this.debugDragAreaUpdateInterval) {
      element.hidePopover()
      clearInterval(this.debugDragAreaUpdateInterval)
      this.debugDragAreaUpdateInterval = null
    } else {
      element.showPopover()
      const drawing = element.getContext('2d')
      if (!drawing) {
        throw new Error(
          'failed to init DragRegionOverlay: canvas context not set'
        )
      }
      drawing.translate(0.5, 0.5)
      this.debugDragAreaUpdateInterval = setInterval(() => {
        if (!window.visualViewport) {
          throw new Error(
            'failed to init DragRegionOverlay: window.visualViewport is undefined, this is unexpected.'
          )
        }
        element.height = window.visualViewport.height
        element.width = window.visualViewport.width
        // hack to make it show on top of dialogs
        element.hidePopover()
        element.showPopover()

        const { height, width } = element.getBoundingClientRect()
        drawing.clearRect(0, 0, width, height)

        function drawElement(rect: DOMRect | undefined, color: string) {
          if (!rect || !drawing) {
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
          }

          for (const child of element.children) {
            if (child instanceof HTMLElement) {
              traverseDOMRecursively(child)
            }
          }
        }

        traverseDOMRecursively(document.documentElement)
      }, 50)
    }
  }
}
